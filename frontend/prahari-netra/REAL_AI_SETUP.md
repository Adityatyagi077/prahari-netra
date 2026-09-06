# Real-time local AI detection

This project sends current video frames to the local FastAPI service in `ML-services`, which runs YOLO object detection.

Install frontend dependencies from `frontend/prahari-netra`:
`pnpm install`

Run:
`PORT=5174 BASE_PATH=/ pnpm dev`

Start the AI service separately with `cd ML-services && ./run-ai.sh`. Person, car, truck, bus and motorcycle detections are returned as PERSON or VEHICLE.

For an offline deployment, retain the model weights in `ML-services` and run the service on the same secure network as the frontend.
