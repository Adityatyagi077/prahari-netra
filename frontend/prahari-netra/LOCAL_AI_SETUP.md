# Prahari Netra — Local AI inference

This frontend sends the current video frame to the local FastAPI service at `http://127.0.0.1:8000/detect`.
The service runs Ultralytics YOLO locally and returns real person/vehicle bounding boxes and confidence scores.

Start the AI service:

```bash
cd ML-services
./run-ai.sh
```

The first start may download the YOLO model weights once. Keep this terminal running.

In a second VS Code terminal, start the web app:

```bash
cd frontend/prahari-netra
PORT=5174 BASE_PATH=/ pnpm dev
```

Open http://localhost:5174.
