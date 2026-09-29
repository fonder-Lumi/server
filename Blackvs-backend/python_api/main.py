"""
BlackVS Python API — Production-ready FastAPI backend
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("blackvs-api")

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="BlackVS Python API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ─── Config ──────────────────────────────────────────────────────────────────
_CORS_ORIGINS = [x.strip() for x in os.getenv("CORS_ORIGIN", "*").split(",")]
AGENT_URL = os.getenv("AGENT_URL", "http://127.0.0.1:9100")
DATA_DIR = Path(os.getenv("DATA_DIR", "/opt/blackvs/data"))
API_TOKEN = os.getenv("API_TOKEN", "")          # optional bearer token guard
METRICS_INTERVAL = int(os.getenv("METRICS_INTERVAL", "5"))  # SSE poll seconds

DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_FILE = DATA_DIR / "blackvs.json"

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Persistent JSON store ────────────────────────────────────────────────────
_STORE_DEFAULTS: dict[str, list] = {
    "sites": [],
    "databases": [],
    "ftp": [],
    "mailDomains": [],
    "mailboxes": [],
}


def _load_db() -> dict[str, list]:
    if DB_FILE.exists():
        try:
            data = json.loads(DB_FILE.read_text())
            # Ensure all keys present
            for k, v in _STORE_DEFAULTS.items():
                data.setdefault(k, list(v))
            return data
        except Exception as exc:
            logger.warning("Could not parse DB file, starting fresh: %s", exc)
    return {k: list(v) for k, v in _STORE_DEFAULTS.items()}


_store: dict[str, list] = _load_db()
_store_lock = asyncio.Lock()


def _save_db() -> None:
    tmp = DB_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(_store, indent=2, default=str))
    tmp.replace(DB_FILE)


async def _save_db_async() -> None:
    async with _store_lock:
        await asyncio.get_event_loop().run_in_executor(None, _save_db)


# ─── Helpers ─────────────────────────────────────────────────────────────────
_DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)([a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$"
)
_SAFE_RE = re.compile(r"^[A-Za-z0-9_\-]+$")


def _valid_domain(v: str) -> bool:
    return bool(_DOMAIN_RE.match(v))


def _safe_name(v: str, max_len: int = 48) -> bool:
    return bool(_SAFE_RE.match(v)) and 0 < len(v) <= max_len


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


async def _agent(route: str, method: str = "GET", payload: Any = None, timeout: float = 30.0) -> Any:
    """Forward a request to the Rust agent and return parsed JSON."""
    url = f"{AGENT_URL}{route}"
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.request(method, url, json=payload)
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text or f"Agent returned {exc.response.status_code}"
        raise HTTPException(status_code=exc.response.status_code, detail=detail)
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Rust agent is unreachable. Is blackvs-agent running?")
    except Exception as exc:
        logger.error("Agent request failed: %s %s -> %s", method, url, exc)
        raise HTTPException(status_code=500, detail=str(exc))


def _check_token(authorization: str | None) -> None:
    if not API_TOKEN:
        return  # auth disabled
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    if authorization.removeprefix("Bearer ").strip() != API_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token")


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "ok": True,
        "service": "blackvs-api-python",
        "version": "1.0.0",
        "time": _now(),
        "agent": AGENT_URL,
    }


@app.get("/api/server")
async def get_server(authorization: str | None = Header(default=None)):
    _check_token(authorization)
    return await _agent("/server")


@app.get("/api/metrics")
async def get_metrics(authorization: str | None = Header(default=None)):
    _check_token(authorization)
    return await _agent("/metrics")


@app.get("/api/services")
async def get_services(authorization: str | None = Header(default=None)):
    _check_token(authorization)
    return await _agent("/services")


@app.get("/api/sites")
async def get_sites():
    return _store["sites"]


@app.get("/api/databases")
async def get_databases():
    return _store["databases"]


@app.get("/api/ftp/users")
async def get_ftp_users():
    return _store["ftp"]


@app.get("/api/mail/domains")
async def get_mail_domains():
    return _store["mailDomains"]


@app.get("/api/mail/mailboxes")
async def get_mailboxes():
    return _store.get("mailboxes", [])


@app.post("/api/sites", status_code=201)
async def create_site(req: Request, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    body = await req.json()
    domain = str(body.get("domain", "")).lower().strip()
    if not _valid_domain(domain):
        raise HTTPException(400, "Invalid domain name")
    if any(x["domain"] == domain for x in _store["sites"]):
        raise HTTPException(409, "Site already exists")

    await _agent("/site/create", "POST", {"domain": domain})
    item = {
        "id": str(uuid.uuid4()),
        "domain": domain,
        "status": "active",
        "sslActive": False,
        "sslExpiryDays": 0,
        "createdAt": _now(),
    }
    _store["sites"].append(item)
    await _save_db_async()
    logger.info("Site created: %s", domain)
    return item


@app.delete("/api/sites/{site_id}", status_code=200)
async def delete_site(site_id: str, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    idx = next((i for i, x in enumerate(_store["sites"]) if x["id"] == site_id), None)
    if idx is None:
        raise HTTPException(404, "Site not found")
    removed = _store["sites"].pop(idx)
    await _save_db_async()
    logger.info("Site deleted: %s", removed["domain"])
    return {"ok": True}


@app.post("/api/sites/{site_id}/reload")
async def reload_site(site_id: str, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    item = next((x for x in _store["sites"] if x["id"] == site_id), None)
    if not item:
        raise HTTPException(404, "Site not found")
    await _agent("/site/reload", "POST", {"domain": item["domain"]})
    return {"ok": True}


@app.post("/api/sites/{site_id}/ssl")
async def provision_ssl(site_id: str, req: Request, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    item = next((x for x in _store["sites"] if x["id"] == site_id), None)
    if not item:
        raise HTTPException(404, "Site not found")
    body = await req.json() if req.headers.get("content-length", "0") != "0" else {}
    email = body.get("email", f"admin@{item['domain']}")
    await _agent("/site/ssl", "POST", {"domain": item["domain"], "email": email})
    item["sslActive"] = True
    item["sslExpiryDays"] = 90
    await _save_db_async()
    return {"ok": True}


@app.post("/api/databases", status_code=201)
async def create_database(req: Request, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    body = await req.json()
    name = str(body.get("name", "")).strip()
    username = str(body.get("username", "")).strip()
    password = str(body.get("password", ""))
    if not _safe_name(name) or not _safe_name(username, 32) or len(password) < 12:
        raise HTTPException(400, "Use safe names and a password of at least 12 characters")
    if any(x["name"] == name for x in _store["databases"]):
        raise HTTPException(409, "Database already exists")
    await _agent("/database/create", "POST", {"name": name, "username": username, "password": password})
    item = {"id": str(uuid.uuid4()), "name": name, "username": username, "createdAt": _now()}
    _store["databases"].append(item)
    await _save_db_async()
    logger.info("Database created: %s", name)
    return item


@app.delete("/api/databases/{db_id}")
async def delete_database(db_id: str, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    idx = next((i for i, x in enumerate(_store["databases"]) if x["id"] == db_id), None)
    if idx is None:
        raise HTTPException(404, "Database not found")
    _store["databases"].pop(idx)
    await _save_db_async()
    return {"ok": True}


@app.post("/api/ftp/users", status_code=201)
async def create_ftp_user(req: Request, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    body = await req.json()
    username = str(body.get("username", "")).strip()
    home = str(body.get("home", "")).strip()
    password = str(body.get("password", ""))
    if not _safe_name(username, 32) or len(password) < 12:
        raise HTTPException(400, "Invalid FTP username or weak password (min 12 chars)")
    await _agent("/ftp/create", "POST", {"username": username, "home": home, "password": password})
    item = {
        "id": str(uuid.uuid4()),
        "username": username,
        "home": home or f"/var/www/{username}",
        "createdAt": _now(),
    }
    _store["ftp"].append(item)
    await _save_db_async()
    return item


@app.delete("/api/ftp/users/{ftp_id}")
async def delete_ftp_user(ftp_id: str, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    idx = next((i for i, x in enumerate(_store["ftp"]) if x["id"] == ftp_id), None)
    if idx is None:
        raise HTTPException(404, "FTP user not found")
    _store["ftp"].pop(idx)
    await _save_db_async()
    return {"ok": True}


@app.post("/api/mail/domains", status_code=201)
async def create_mail_domain(req: Request, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    body = await req.json()
    domain = str(body.get("domain", "")).lower().strip()
    if not _valid_domain(domain):
        raise HTTPException(400, "Invalid domain")
    if any(x["domain"] == domain for x in _store["mailDomains"]):
        raise HTTPException(409, "Mail domain already exists")
    res = await _agent("/mail/domain", "POST", {"domain": domain})
    item = {
        "id": str(uuid.uuid4()),
        "domain": domain,
        "createdAt": _now(),
        "note": res.get("note", ""),
    }
    _store["mailDomains"].append(item)
    await _save_db_async()
    return item


@app.post("/api/mail/mailboxes", status_code=201)
async def create_mailbox(req: Request, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    body = await req.json()
    email = str(body.get("email", "")).lower().strip()
    password = str(body.get("password", ""))
    if "@" not in email or len(password) < 8:
        raise HTTPException(400, "Invalid email or weak password (min 8 chars)")
    if any(x["email"] == email for x in _store.get("mailboxes", [])):
        raise HTTPException(409, "Mailbox already exists")
    await _agent("/mail/mailbox", "POST", {"email": email, "password": password})
    item = {"id": str(uuid.uuid4()), "email": email, "createdAt": _now()}
    _store.setdefault("mailboxes", []).append(item)
    await _save_db_async()
    return item


@app.post("/api/services/{name}/{action}")
async def service_action(name: str, action: str, authorization: str | None = Header(default=None)):
    _check_token(authorization)
    valid_names = {"nginx", "mysql", "mariadb", "vsftpd", "postfix", "dovecot", "php8.3-fpm"}
    valid_actions = {"start", "stop", "restart", "status"}
    if name not in valid_names or action not in valid_actions:
        raise HTTPException(400, f"Unsupported service '{name}' or action '{action}'")
    return await _agent(f"/service/{name}/{action}", "POST", {})


@app.get("/api/logs")
async def get_logs(
    lines: int = 200,
    service: str = "nginx",
    authorization: str | None = Header(default=None),
):
    _check_token(authorization)
    valid_svcs = {"nginx", "mysql", "mariadb", "vsftpd", "postfix", "dovecot", "blackvs-agent", "blackvs-api"}
    if service not in valid_svcs:
        raise HTTPException(400, "Invalid service name")
    return await _agent(f"/logs/{service}?lines={lines}")


# ─── SSE real-time metrics ────────────────────────────────────────────────────

@app.get("/api/events")
async def sse_events(request: Request):
    """Server-Sent Events stream of live metrics from the Rust agent."""

    async def event_generator():
        yield "retry: 3000\n\n"  # tell client to reconnect after 3 s
        while True:
            if await request.is_disconnected():
                break
            try:
                metrics = await _agent("/metrics")
                data = json.dumps(metrics, default=str)
                yield f"event: metrics\ndata: {data}\n\n"
            except HTTPException as exc:
                yield f"event: error\ndata: {json.dumps({'error': exc.detail})}\n\n"
            except Exception as exc:
                yield f"event: error\ndata: {json.dumps({'error': str(exc)})}\n\n"
            await asyncio.sleep(METRICS_INTERVAL)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",   # disable nginx buffering
            "Connection": "keep-alive",
        },
    )


# ─── Global error handler ─────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def _unhandled(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


# ─── Startup / Shutdown ───────────────────────────────────────────────────────

@app.on_event("startup")
async def _startup():
    logger.info("BlackVS Python API starting — agent=%s data=%s", AGENT_URL, DATA_DIR)


@app.on_event("shutdown")
async def _shutdown():
    logger.info("BlackVS Python API shutting down")
    _save_db()


# ─── Entrypoint ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8081"))
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=port,
        workers=1,
        log_level="info",
        access_log=True,
        proxy_headers=True,
    )
