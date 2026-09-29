#!/usr/bin/env bash
# ============================================================
#  BlackVS — Production Linux Installation Script
#  Supports: Ubuntu 22.04 / 24.04 LTS (Debian-based)
#  Run as root: sudo bash scripts/install-linux.sh
# ============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }
info() { echo -e "${CYAN}[i]${NC} $*"; }

# ── Checks ──────────────────────────────────────────────────────────────────
[[ $EUID -eq 0 ]] || err "Run as root: sudo bash scripts/install-linux.sh"
command -v apt-get >/dev/null 2>&1 || err "Ubuntu/Debian apt-based system required."

INSTALL_DIR="/opt/blackvs"
DATA_DIR="$INSTALL_DIR/data"
PANEL_DIR="/var/www/blackvs-panel"

log "========================================"
log "  BlackVS Production Installer v1.0.0   "
log "========================================"
info "Install dir : $INSTALL_DIR"
info "Data dir    : $DATA_DIR"
info "Panel dir   : $PANEL_DIR"

# ── System packages ──────────────────────────────────────────────────────────
log "Installing system packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl ca-certificates build-essential pkg-config git \
  nginx mariadb-server vsftpd \
  postfix dovecot-core dovecot-imapd dovecot-pop3d \
  python3 python3-pip python3-venv \
  certbot python3-certbot-nginx \
  ufw fail2ban \
  jq rsync lsof

# ── PHP 8.3 ──────────────────────────────────────────────────────────────────
log "Installing PHP 8.3..."
if ! php -r 'echo PHP_MAJOR_VERSION;' 2>/dev/null | grep -q '^8'; then
  add-apt-repository -y ppa:ondrej/php 2>/dev/null || true
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    php8.3-fpm php8.3-cli php8.3-mysql php8.3-curl \
    php8.3-mbstring php8.3-xml php8.3-zip php8.3-gd
fi

# ── Node.js 22 ───────────────────────────────────────────────────────────────
log "Installing Node.js 22..."
if ! command -v node >/dev/null 2>&1 || [[ "$(node -e 'process.stdout.write(process.versions.node.split(".")[0])')" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node --version
npm --version

# ── Rust ─────────────────────────────────────────────────────────────────────
log "Installing Rust toolchain..."
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
# shellcheck disable=SC1090
source "$HOME/.cargo/env"
rustup update stable
cargo --version

# ── Create directories ────────────────────────────────────────────────────────
log "Creating directories..."
install -d -m 0755 "$INSTALL_DIR"
install -d -m 0700 "$DATA_DIR"
install -d -m 0755 "$PANEL_DIR"
chown -R www-data:www-data "$PANEL_DIR"

# ── Copy source ───────────────────────────────────────────────────────────────
log "Copying source files to $INSTALL_DIR..."
rsync -a --exclude=node_modules --exclude=target --exclude=.git \
  "$(pwd)/" "$INSTALL_DIR/"

cd "$INSTALL_DIR"

# ── Python venv + deps ───────────────────────────────────────────────────────
log "Setting up Python virtualenv..."
python3 -m venv /opt/blackvs/venv
/opt/blackvs/venv/bin/pip install -q --upgrade pip
/opt/blackvs/venv/bin/pip install -q \
  fastapi "uvicorn[standard]" httpx

# ── Node.js API build ────────────────────────────────────────────────────────
log "Building Node.js API..."
npm ci --prefix "$INSTALL_DIR"
npm run build --prefix "$INSTALL_DIR"

# ── Rust agent build ─────────────────────────────────────────────────────────
log "Building Rust agent (release)..."
cargo build --release --manifest-path "$INSTALL_DIR/agent/Cargo.toml"
install -m 0755 "$INSTALL_DIR/agent/target/release/blackvs-agent" /usr/local/bin/blackvs-agent

# ── Panel static build ────────────────────────────────────────────────────────
if [[ -d "$INSTALL_DIR/../blackvs-panel" ]]; then
  log "Building frontend panel..."
  PANEL_SRC="$INSTALL_DIR/../blackvs-panel"
  npm ci --prefix "$PANEL_SRC"
  VITE_API_URL="/api" npm run build --prefix "$PANEL_SRC"
  rsync -a "$PANEL_SRC/dist/" "$PANEL_DIR/"
  chown -R www-data:www-data "$PANEL_DIR"
fi

# ── Env file ────────────────────────────────────────────────────────────────
log "Configuring environment..."
if [[ ! -f "$INSTALL_DIR/.env" ]]; then
  cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
  # Generate a random API token
  API_TOKEN=$(openssl rand -hex 32)
  sed -i "s|^#*API_TOKEN=.*|API_TOKEN=$API_TOKEN|" "$INSTALL_DIR/.env" || \
    echo "API_TOKEN=$API_TOKEN" >> "$INSTALL_DIR/.env"
  warn "Generated API token written to $INSTALL_DIR/.env — keep it secret!"
fi

# ── MariaDB secure defaults ───────────────────────────────────────────────────
log "Configuring MariaDB..."
systemctl enable --now mariadb
# Ensure socket auth for root
mysql -e "UPDATE mysql.global_priv SET priv=json_set(priv, '$.plugin', 'mysql_native_password', '$.authentication_string', '') WHERE User='root' AND Host='localhost'; FLUSH PRIVILEGES;" 2>/dev/null || true

# ── vsftpd config ─────────────────────────────────────────────────────────────
log "Configuring vsftpd..."
cat >/etc/vsftpd.conf <<'VSFTPD'
listen=YES
listen_ipv6=NO
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
dirmessage_enable=YES
use_localtime=YES
xferlog_enable=YES
connect_from_port_20=YES
chroot_local_user=YES
allow_writeable_chroot=YES
secure_chroot_dir=/var/run/vsftpd/empty
pam_service_name=vsftpd
rsa_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
rsa_private_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
ssl_enable=NO
VSFTPD

# ── Postfix minimal config ────────────────────────────────────────────────────
log "Configuring Postfix..."
postconf -e "myhostname = $(hostname -f)"
postconf -e "virtual_mailbox_domains = hash:/etc/postfix/virtual_domains"
touch /etc/postfix/virtual_domains
postmap /etc/postfix/virtual_domains 2>/dev/null || true

# ── Dovecot minimal config ────────────────────────────────────────────────────
log "Configuring Dovecot..."
touch /etc/dovecot/users
chmod 600 /etc/dovecot/users

# ── Nginx panel + API config ──────────────────────────────────────────────────
log "Configuring Nginx..."
cat >/etc/nginx/sites-available/blackvs-panel <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/blackvs-panel;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Panel SPA
    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
    }

    # Static assets — long cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to Python/Node backend
    location /api/ {
        proxy_pass          http://127.0.0.1:8080;
        proxy_http_version  1.1;
        proxy_set_header    Host              $host;
        proxy_set_header    X-Real-IP         $remote_addr;
        proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;

        # SSE / streaming
        proxy_set_header    Connection        '';
        proxy_buffering     off;
        proxy_cache         off;
        proxy_read_timeout  86400s;
        chunked_transfer_encoding off;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/blackvs-panel /etc/nginx/sites-enabled/blackvs-panel
nginx -t

# ── systemd services ──────────────────────────────────────────────────────────
log "Installing systemd services..."

# Agent
cat >/etc/systemd/system/blackvs-agent.service <<'SVC'
[Unit]
Description=BlackVS privileged Linux server agent
After=network.target
StartLimitIntervalSec=60
StartLimitBurst=5

[Service]
Type=simple
ExecStart=/usr/local/bin/blackvs-agent
Restart=always
RestartSec=3
User=root
PrivateTmp=true
ProtectHome=false
ProtectSystem=false
AmbientCapabilities=CAP_NET_BIND_SERVICE
Environment=RUST_LOG=info
Environment=AGENT_BIND=127.0.0.1:9100

[Install]
WantedBy=multi-user.target
SVC

# Python API
cat >/etc/systemd/system/blackvs-api.service <<SVC
[Unit]
Description=BlackVS Python API (FastAPI/uvicorn)
After=network.target blackvs-agent.service
StartLimitIntervalSec=60
StartLimitBurst=5

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR
EnvironmentFile=-$INSTALL_DIR/.env
ExecStart=/opt/blackvs/venv/bin/uvicorn python_api.main:app \\
          --host 127.0.0.1 --port 8080 --workers 2 \\
          --proxy-headers --forwarded-allow-ips='127.0.0.1' \\
          --log-level info --access-log
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=full
ReadWritePaths=$DATA_DIR

[Install]
WantedBy=multi-user.target
SVC

# ── Enable and start all services ─────────────────────────────────────────────
log "Enabling and starting services..."
systemctl daemon-reload
systemctl enable --now mariadb
systemctl enable --now nginx
systemctl enable --now vsftpd
systemctl enable --now php8.3-fpm
systemctl enable --now blackvs-agent
systemctl enable --now blackvs-api

# ── UFW firewall ──────────────────────────────────────────────────────────────
log "Configuring UFW firewall..."
ufw --force enable
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 21/tcp    # FTP
ufw allow 25/tcp    # SMTP
ufw allow 143/tcp   # IMAP
ufw allow 587/tcp   # SMTP submission
ufw deny 8080       # block direct API access
ufw deny 9100       # block direct agent access
ufw status

# ── Fail2ban ──────────────────────────────────────────────────────────────────
log "Configuring fail2ban..."
systemctl enable --now fail2ban

# ── Health check ─────────────────────────────────────────────────────────────
log "Running health checks..."
sleep 3
if curl -fs http://127.0.0.1:9100/health >/dev/null; then
  log "Agent  → http://127.0.0.1:9100/health  ✓"
else
  warn "Agent health check failed — check: journalctl -u blackvs-agent"
fi

if curl -fs http://127.0.0.1:8080/api/health >/dev/null; then
  log "API    → http://127.0.0.1:8080/api/health  ✓"
else
  warn "API health check failed — check: journalctl -u blackvs-api"
fi

if curl -fs http://127.0.0.1:80/ >/dev/null; then
  log "Panel  → http://127.0.0.1:80/  ✓"
else
  warn "Panel nginx check failed — check: journalctl -u nginx"
fi

echo ""
log "════════════════════════════════════════"
log "  BlackVS Installation Complete!        "
log "════════════════════════════════════════"
info "Panel   → http://$(hostname -I | awk '{print $1}'):80"
info "API     → http://127.0.0.1:8080/api/health"
info "Agent   → http://127.0.0.1:9100/health"
info "API docs → http://127.0.0.1:8080/api/docs"
warn "Port 9100 (agent) is localhost-only. NEVER expose it publicly."
warn "Review $INSTALL_DIR/.env and set a strong API_TOKEN."
