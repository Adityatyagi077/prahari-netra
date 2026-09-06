#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Prefer the project's own environment. If it exists but is incomplete, install the pinned runtime there.
if [ ! -x ".venv/bin/python" ]; then
  python3 -m venv .venv
fi
PYTHON="$(pwd)/.venv/bin/python"
if ! "$PYTHON" -c "import fastapi, uvicorn, ultralytics, cv2, numpy" >/dev/null 2>&1; then
  "$PYTHON" -m pip install --upgrade pip
  "$PYTHON" -m pip install -r requirements.txt
fi
"$PYTHON" -c "import fastapi, uvicorn, ultralytics, cv2, numpy; print('YOLO runtime: OK')"

if curl -fsS http://127.0.0.1:8000/health >/dev/null 2>&1; then
  echo "AI service already running on 127.0.0.1:8000"
  exit 0
fi
exec "$PYTHON" -m uvicorn ai_server:app --host 127.0.0.1 --port 8000 --log-level info
