# Local YOLO service

Run `./run-ai.sh` from this directory. The script creates/uses `.venv`, installs the requirements, loads `yolo11n.pt` from the script directory, and starts FastAPI on `127.0.0.1:8000`.

Health check: `http://127.0.0.1:8000/health`

The frontend proxies `/ai-api/*` to this service.
