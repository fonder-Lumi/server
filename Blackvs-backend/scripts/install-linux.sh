#!/usr/bin/env bash
set -euo pipefail

[[ $EUID -eq 0 ]] || { echo "Run: sudo bash scripts/install-linux.sh"; exit 1; }
command -v apt-get >/dev/null || { echo "Ubuntu/Debian apt-based Linux required."; exit 1; }

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl ca-certificates build-essential pkg-config nginx mariadb-server vsftpd \
  postfix dovecot-core dovecot-imapd python3 python3-pip git ufw fail2ban

if ! command -v node >/dev/null || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! command -v cargo >/dev/null; then
  curl https://sh.rustup.rs -sSf | sh -s -- -y
fi
source /root/.cargo/env

install -d -m 0755 /opt/blackvs
cp -a . /opt/blackvs
cd /opt/blackvs
install -d -m 0700 /opt/blackvs/data

npm install
npm run build
cargo build --release --manifest-path agent/Cargo.toml
install -m 0755 agent/target/release/blackvs-agent /usr/local/bin/blackvs-agent

install -m 0644 deploy/systemd/blackvs-agent.service /etc/systemd/system/blackvs-agent.service
install -m 0644 deploy/systemd/blackvs-api.service /etc/systemd/system/blackvs-api.service
install -m 0644 deploy/systemd/blackvs-api-python.service /etc/systemd/system/blackvs-api-python.service
cp -n .env.example .env || true

# Install Python API dependencies
pip3 install fastapi uvicorn httpx --break-system-packages || pip3 install fastapi uvicorn httpx

systemctl daemon-reload
systemctl enable --now mariadb nginx vsftpd
systemctl enable --now blackvs-agent blackvs-api blackvs-api-python

echo "BlackVS API   -> http://127.0.0.1:8080"
echo "BlackVS Agent -> http://127.0.0.1:9100"
echo "Keep port 9100 private."
