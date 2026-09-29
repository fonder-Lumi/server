# BlackVS Backend — Linux Hosting Control Plane

A Linux-first backend foundation for a custom BlackVS/BlackCX hosting panel.

## Architecture

React/Vite Panel
  -> Node.js API (127.0.0.1:8080)
  -> Rust privileged Server Agent (127.0.0.1:9100)
  -> Linux services: Nginx, MariaDB/MySQL, vsftpd, Postfix/Dovecot, systemd

The API is intentionally localhost-only by default. The privileged Rust agent is
also localhost-only. Put a TLS reverse proxy and authentication/RBAC in front
before exposing the panel remotely.

## What is included

- Real-time Linux CPU, RAM, swap, load, uptime and disk metrics
- Service status/restart for Nginx, MySQL/MariaDB, vsftpd, Postfix and Dovecot
- Nginx virtual-host creation/reload
- MariaDB/MySQL database + user creation
- FTP user creation with home directory and password
- Mail-domain provisioning hook
- Server health API
- SSE live metrics stream for the React panel
- systemd services
- Linux installation script for Ubuntu/Debian
- Nginx reverse-proxy example
- Python health-check helper

## Install

On an Ubuntu/Debian Linux server:

```bash
sudo bash scripts/install-linux.sh
sudo systemctl status blackvs-agent
sudo systemctl status blackvs-api
curl http://127.0.0.1:9100/health
curl http://127.0.0.1:8080/api/health
```

Requirements: Ubuntu/Debian, systemd, Node.js 22+, Rust stable, Python 3,
Nginx, MariaDB/MySQL, vsftpd. Postfix/Dovecot are installed by the installer.

## Main API

GET  /api/health
GET  /api/server
GET  /api/metrics
GET  /api/services
GET  /api/sites
GET  /api/databases
GET  /api/ftp/users
GET  /api/mail/domains
GET  /api/events              Server-Sent Events live metrics

POST /api/sites
POST /api/sites/:id/reload
POST /api/databases
POST /api/ftp/users
POST /api/mail/domains
POST /api/services/:name/:action

## Security

This is a server-control foundation, not a turnkey public hosting company.

Before public Internet exposure:
- Add authentication, RBAC, MFA and API tokens.
- Add audit logs and rate limiting.
- Use HTTPS.
- Keep port 9100 private.
- Validate all domains, paths and usernames.
- Never run customer uploads as root.
- Add quotas, isolation/containers, backups and malware scanning.
- Add DNS, DKIM/SPF/DMARC, mailboxes and certificate automation.
- Store secrets in a proper secret manager.
- Test the installer on a disposable VM first.
