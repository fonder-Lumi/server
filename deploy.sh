#!/usr/bin/env bash
# ============================================================
#  BlackVS — Production Deployment Script
#  Usage: bash deploy.sh [--docker | --linux]
#  --docker   Build & run Docker Compose stack (panel + API)
#  --linux    Full bare-metal install (calls install-linux.sh)
# ============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }
info() { echo -e "${CYAN}[i]${NC} $*"; }

MODE="${1:---docker}"

log "========================================="
log "   BlackVS Production Deployment          "
log "========================================="
info "Mode: $MODE"

# ── Rust Agent ────────────────────────────────────────────────────────────────
build_agent() {
  log "Building BlackVS Rust Agent..."
  command -v cargo >/dev/null 2>&1 || err "Rust/cargo not found. Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
  (cd Blackvs-backend/agent && cargo build --release)
  log "Rust agent built: Blackvs-backend/agent/target/release/blackvs-agent"
}

start_agent() {
  log "Starting Rust agent on port 9100..."
  # Kill any existing instance
  lsof -ti:9100 | xargs kill -9 2>/dev/null || true
  sleep 1
  nohup Blackvs-backend/agent/target/release/blackvs-agent \
    > /tmp/blackvs-agent.log 2>&1 &
  AGENT_PID=$!
  echo "$AGENT_PID" > /tmp/blackvs-agent.pid
  log "Agent started (PID: $AGENT_PID) — log: /tmp/blackvs-agent.log"
  sleep 2
  if curl -sf http://127.0.0.1:9100/health >/dev/null; then
    log "Agent health check ✓"
  else
    warn "Agent may not be running — check /tmp/blackvs-agent.log"
  fi
}

# ── Docker mode ───────────────────────────────────────────────────────────────
deploy_docker() {
  command -v docker >/dev/null 2>&1 || err "Docker not found. Install Docker first."
  
  log "Building & starting Docker Compose stack..."
  
  # Build Rust agent for host execution (it needs host privileges)
  build_agent
  start_agent
  
  # Build and launch containers
  docker compose pull --ignore-pull-failures 2>/dev/null || true
  docker compose up --build -d

  log "Waiting for services to be healthy..."
  sleep 5
  docker compose ps

  log "Health checks..."
  if curl -sf http://127.0.0.1:8080/api/health >/dev/null; then
    log "API   → http://127.0.0.1:8080/api/health  ✓"
  else
    warn "API health check failed"
  fi
  if curl -sf http://127.0.0.1:80/ >/dev/null; then
    log "Panel → http://127.0.0.1:80/  ✓"
  else
    warn "Panel health check failed"
  fi

  log "========================================="
  log "  Deployment Complete (Docker)!"
  log "========================================="
  info "Panel → http://localhost:80"
  info "API   → http://localhost:8080/api/health"
  info "Docs  → http://localhost:8080/api/docs"
  info "Agent → http://localhost:9100/health (private)"
  warn "Port 9100 must NOT be exposed publicly."
}

# ── Linux bare-metal mode ─────────────────────────────────────────────────────
deploy_linux() {
  [[ $EUID -eq 0 ]] || err "Linux mode requires root. Run: sudo bash deploy.sh --linux"
  bash Blackvs-backend/scripts/install-linux.sh
}

# ── Dispatch ─────────────────────────────────────────────────────────────────
case "$MODE" in
  --docker) deploy_docker ;;
  --linux)  deploy_linux  ;;
  *) err "Unknown mode: $MODE. Use --docker or --linux" ;;
esac
