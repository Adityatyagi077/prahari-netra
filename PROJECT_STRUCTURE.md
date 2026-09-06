# Project structure

```
frontend/
  prahari-netra/       React dashboard, UI assets, and recorded camera videos
backend/
  api-server/          Express API service
ML-services/           FastAPI + YOLO inference service and model weights
lib/
  api-spec/            Shared OpenAPI contract
  api-zod/             Shared validation types
  api-client-react/    Generated React API client
  db/                  Database connection and schema
```

## Data flow

1. `frontend/prahari-netra` plays a camera recording and extracts frames.
2. It sends each frame to `ML-services` at `POST /detect`.
3. The ML service runs YOLO and returns detection labels, confidence scores, and bounding boxes.
4. The frontend renders those detections over the video feed.
5. `backend/api-server` and the packages in `lib` are reserved for persistent application data such as users, cameras, incidents, and evidence. The dashboard is not connected to them yet.
