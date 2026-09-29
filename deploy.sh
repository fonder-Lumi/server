#!/bin/bash
set -e

echo "========================================="
echo "   BlackVS Production Deployment Setup   "
echo "========================================="

# 1. Build and run the Rust Agent (requires Rust toolchain on the host)
echo "=> Building BlackVS Rust Agent..."
cd Blackvs-backend/agent
if ! command -v cargo &> /dev/null; then
    echo "Rust/Cargo not found. Please install Rust on the host to compile the agent:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi
cargo build --release

echo "=> Starting Agent in the background..."
# Kill any existing agent running on port 9100
lsof -ti:9100 | xargs kill -9 2>/dev/null || true
nohup ./target/release/agent > agent.log 2>&1 &
echo "Agent started (PID: $!)"
cd ../../

# 2. Build and start the Docker Compose stack (Panel + Backend)
echo "=> Building and starting Docker Compose services..."
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker and Docker Compose."
    exit 1
fi

docker compose up --build -d

echo "========================================="
echo "Deployment Complete!"
echo " - Panel available at:   http://localhost:80"
echo " - Backend API at:       http://localhost:8080"
echo " - Host Agent at:        http://localhost:9100"
echo "========================================="
