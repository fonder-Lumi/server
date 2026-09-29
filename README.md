# BlackVS — Linux Hosting Control Panel

A production-ready, self-hosted Linux hosting control panel built with:
- **React + Vite + TypeScript** — modern frontend panel
- **Python FastAPI + uvicorn** — REST API with SSE real-time streaming
- **Rust (axum)** — privileged Linux server agent (systemd, nginx, MySQL, FTP, mail)
- **Nginx** — reverse proxy + static panel serving

---

## Architecture

```
Browser (React SPA)
    ↕  HTTP/SSE on port 80
Nginx (reverse proxy)
    ↕  /api/* → proxy_pass
Python FastAPI (127.0.0.1:8080)   ← JWT/token auth
    ↕  HTTP on port 9100
Rust Agent (127.0.0.1:9100)       ← runs as root, localhost ONLY
    ↕  systemd, nginx, mysql, vsftpd, postfix, dovecot
Linux OS
```

> **Security**: The Rust agent runs as root but is bound to `127.0.0.1:9100` only.  
> The Python API proxies calls to it. Port 9100 must **never** be exposed publicly.

---

## Quick Start — Bare Metal (Ubuntu 22.04 / 24.04)

```bash
git clone https://github.com/fonder-Lumi/server.git
cd server
sudo bash Blackvs-backend/scripts/install-linux.sh
```

The installer will:
1. Install nginx, MariaDB, vsftpd, Postfix, Dovecot, PHP 8.3, Node.js 22, Rust
2. Build the Rust agent and install to `/usr/local/bin/blackvs-agent`
3. Create a Python virtualenv and install FastAPI/uvicorn
4. Build the React panel and deploy to `/var/www/blackvs-panel`
5. Install and enable systemd services
6. Configure UFW firewall
7. Run health checks

After install:
- **Panel** → `http://YOUR_SERVER_IP`
- **API docs** → `http://127.0.0.1:8080/api/docs`
- Check logs: `journalctl -fu blackvs-api` / `journalctl -fu blackvs-agent`

---

## Quick Start — Docker Compose

Requires Docker + Docker Compose. The Rust agent **must** run on the host (needs root for systemd/disk access):

```bash
git clone https://github.com/fonder-Lumi/server.git
cd server
bash deploy.sh --docker
```

This will:
1. Build the Rust agent on the host
2. Start the agent on `127.0.0.1:9100`
3. Build and start the Python API + React panel containers

Access:
- Panel → `http://localhost`
- API → `http://localhost:8080/api/health`

---

## API Reference

### Core

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/server` | Server info (hostname, OS, uptime) |
| `GET` | `/api/metrics` | Real-time CPU, RAM, disk metrics |
| `GET` | `/api/services` | List running services |
| `GET` | `/api/events` | **SSE** live metrics stream (5s interval) |

### Sites (Nginx virtual hosts)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/sites` | List sites |
| `POST` | `/api/sites` | Create site `{domain}` |
| `DELETE` | `/api/sites/:id` | Delete site |
| `POST` | `/api/sites/:id/reload` | Reload nginx |
| `POST` | `/api/sites/:id/ssl` | Issue Let's Encrypt SSL |

### Databases (MariaDB/MySQL)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/api/databases` | — | List databases |
| `POST` | `/api/databases` | `{name, username, password}` | Create DB + user |
| `DELETE` | `/api/databases/:id` | — | Remove from store |

### FTP

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/api/ftp/users` | — | List FTP users |
| `POST` | `/api/ftp/users` | `{username, password, home}` | Create FTP user |
| `DELETE` | `/api/ftp/users/:id` | — | Remove from store |

### Mail

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/api/mail/domains` | — | List mail domains |
| `POST` | `/api/mail/domains` | `{domain}` | Add Postfix domain |
| `GET` | `/api/mail/mailboxes` | — | List mailboxes |
| `POST` | `/api/mail/mailboxes` | `{email, password}` | Create Dovecot mailbox |

### Services

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/services/:name/:action` | Control service (start/stop/restart/status) |

Valid services: `nginx`, `mysql`, `mariadb`, `vsftpd`, `postfix`, `dovecot`, `php8.3-fpm`

### Logs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/logs/:service?lines=200` | Get systemd journal logs |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Python API listen port |
| `AGENT_URL` | `http://127.0.0.1:9100` | Rust agent URL |
| `DATA_DIR` | `/opt/blackvs/data` | JSON store path |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (comma-separated) |
| `API_TOKEN` | _(empty)_ | Bearer token for auth (set in production!) |
| `METRICS_INTERVAL` | `5` | SSE polling interval in seconds |

---

## Project Structure

```
server/
├── Blackvs-backend/
│   ├── agent/                  # Rust privileged agent (axum)
│   │   ├── src/main.rs
│   │   └── Cargo.toml
│   ├── python_api/             # Python FastAPI backend
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── deploy/
│   │   ├── nginx/blackvs-panel.conf
│   │   └── systemd/
│   │       ├── blackvs-agent.service
│   │       └── blackvs-api-python.service
│   ├── scripts/
│   │   └── install-linux.sh    # One-command installer
│   ├── Dockerfile.python       # Python API Docker image
│   └── .env.example
├── blackvs-panel/              # React/Vite/TypeScript frontend
│   ├── src/
│   │   ├── context/AppContext.tsx  # SSE + state management
│   │   ├── components/
│   │   └── ...
│   ├── nginx.conf              # Docker nginx config
│   └── Dockerfile
├── docker-compose.yml          # Docker Compose production
└── deploy.sh                   # Unified deploy script
```

---

## Security Notes

- The Rust agent **must** run as root — it needs to call `systemctl`, `mysql`, `useradd`, etc.
- Bind agent to `127.0.0.1` only — never expose port 9100 publicly
- Set `API_TOKEN` in `.env` for API authentication
- Use UFW to block ports 8080 and 9100 externally (done by the installer)
- Run `certbot --nginx` for HTTPS once DNS is configured

---

## License

MIT
