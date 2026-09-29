import os
import json
import uuid
import asyncio
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import httpx

app = FastAPI(title="BlackVS Python API")

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AGENT_URL = os.getenv("AGENT_URL", "http://127.0.0.1:9100")
DATA_DIR = os.getenv("DATA_DIR", "./data")
os.makedirs(DATA_DIR, exist_ok=True)
db_file = os.path.join(DATA_DIR, "blackvs.json")

def load_db():
    if os.path.exists(db_file):
        with open(db_file, "r") as f:
            return json.load(f)
    return {"sites": [], "databases": [], "ftp": [], "mailDomains": [], "mailboxes": []}

store = load_db()

def save_db():
    with open(db_file, "w") as f:
        json.dump(store, f, indent=2)

async def agent_req(route: str, method: str = "GET", json_data=None):
    async with httpx.AsyncClient() as client:
        try:
            req = client.build_request(method, f"{AGENT_URL}{route}", json=json_data)
            res = await client.send(req, timeout=30.0)
            res.raise_for_status()
            return res.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

import re
def valid_domain(v):
    return re.match(r"^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$", v) is not None

def safe_name(v, max_len=48):
    return re.match(r"^[A-Za-z0-9_-]+$", v) is not None and 0 < len(v) <= max_len

@app.get("/api/health")
async def health():
    return {"ok": True, "service": "blackvs-api-python", "time": datetime.utcnow().isoformat()}

@app.get("/api/server")
async def get_server(): return await agent_req("/server")

@app.get("/api/metrics")
async def get_metrics(): return await agent_req("/metrics")

@app.get("/api/services")
async def get_services(): return await agent_req("/services")

@app.get("/api/sites")
async def get_sites(): return store["sites"]

@app.get("/api/databases")
async def get_databases(): return store["databases"]

@app.get("/api/ftp/users")
async def get_ftp_users(): return store["ftp"]

@app.get("/api/mail/domains")
async def get_mail_domains(): return store["mailDomains"]

@app.get("/api/mail/mailboxes")
async def get_mailboxes(): return store.get("mailboxes", [])

@app.post("/api/sites")
async def create_site(req: Request):
    body = await req.json()
    domain = str(body.get("domain", "")).lower().strip()
    if not valid_domain(domain):
        raise HTTPException(400, "Invalid domain")
    if any(x["domain"] == domain for x in store["sites"]):
        raise HTTPException(409, "Site already exists")
    
    await agent_req("/site/create", "POST", {"domain": domain})
    item = {"id": str(uuid.uuid4()), "domain": domain, "status": "active", "createdAt": datetime.utcnow().isoformat()}
    store["sites"].append(item)
    save_db()
    return item

@app.post("/api/sites/{id}/reload")
async def reload_site(id: str):
    item = next((x for x in store["sites"] if x["id"] == id), None)
    if not item: raise HTTPException(404, "Site not found")
    await agent_req("/site/reload", "POST", {"domain": item["domain"]})
    return {"ok": True}

@app.post("/api/databases")
async def create_database(req: Request):
    body = await req.json()
    name = str(body.get("name", "")).strip()
    username = str(body.get("username", "")).strip()
    password = str(body.get("password", ""))
    
    if not safe_name(name) or not safe_name(username, 32) or len(password) < 12:
        raise HTTPException(400, "Use safe names and a password of at least 12 characters")
        
    await agent_req("/database/create", "POST", {"name": name, "username": username, "password": password})
    item = {"id": str(uuid.uuid4()), "name": name, "username": username, "createdAt": datetime.utcnow().isoformat()}
    store["databases"].append(item)
    save_db()
    return item

@app.post("/api/ftp/users")
async def create_ftp_user(req: Request):
    body = await req.json()
    username = str(body.get("username", "")).strip()
    home = str(body.get("home", "")).strip()
    password = str(body.get("password", ""))
    
    if not safe_name(username, 32) or len(password) < 12:
        raise HTTPException(400, "Invalid FTP username or password")
        
    await agent_req("/ftp/create", "POST", {"username": username, "home": home, "password": password})
    item = {"id": str(uuid.uuid4()), "username": username, "home": home or f"/var/www/{username}", "createdAt": datetime.utcnow().isoformat()}
    store["ftp"].append(item)
    save_db()
    return item

@app.post("/api/mail/domains")
async def create_mail_domain(req: Request):
    body = await req.json()
    domain = str(body.get("domain", "")).lower().strip()
    if not valid_domain(domain): raise HTTPException(400, "Invalid domain")
    
    res = await agent_req("/mail/domain", "POST", {"domain": domain})
    item = {"id": str(uuid.uuid4()), "domain": domain, "createdAt": datetime.utcnow().isoformat(), "note": res.get("note", "")}
    store["mailDomains"].append(item)
    save_db()
    return item
    
@app.post("/api/mail/mailboxes")
async def create_mailbox(req: Request):
    body = await req.json()
    email = str(body.get("email", "")).lower().strip()
    password = str(body.get("password", ""))
    if "@" not in email or len(password) < 8:
        raise HTTPException(400, "Invalid email or weak password")
        
    res = await agent_req("/mail/mailbox", "POST", {"email": email, "password": password})
    item = {"id": str(uuid.uuid4()), "email": email, "createdAt": datetime.utcnow().isoformat()}
    if "mailboxes" not in store:
        store["mailboxes"] = []
    store["mailboxes"].append(item)
    save_db()
    return item

@app.post("/api/services/{name}/{action}")
async def service_action(name: str, action: str):
    valid_names = {"nginx", "mysql", "mariadb", "vsftpd", "postfix", "dovecot"}
    valid_actions = {"start", "stop", "restart", "status"}
    if name not in valid_names or action not in valid_actions:
        raise HTTPException(400, "Unsupported service/action")
    return await agent_req(f"/service/{name}/{action}", "POST", {})

@app.get("/api/events")
async def events(req: Request):
    async def event_generator():
        while True:
            if await req.is_disconnected():
                break
            try:
                metrics = await agent_req("/metrics")
                yield f"data: {json.dumps(metrics)}\n\n"
            except Exception as e:
                yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
            await asyncio.sleep(5)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="127.0.0.1", port=port)
