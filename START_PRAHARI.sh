#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
PIDS=()
cleanup(){ for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done; }
trap cleanup EXIT INT TERM

command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required."; exit 1; }
cd "$ROOT"
pnpm install

(cd "$ROOT/ML-services" && chmod +x run-ai.sh && ./run-ai.sh) & PIDS+=("$!")
(cd "$ROOT/backend/api-server" && PORT=3000 pnpm dev) & PIDS+=("$!")
(cd "$ROOT/frontend/prahari-netra" && pnpm dev) & PIDS+=("$!")

echo "Prahari-Netra services started."
echo "Laptop app: https://localhost:5173"
echo "Phone page: https://<LAPTOP-IP>:5173/phone"
echo "AI health: http://127.0.0.1:8000/health"
echo "Backend health: http://127.0.0.1:3000/api/system-health"
wait
