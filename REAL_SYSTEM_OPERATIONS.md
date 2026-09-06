# Prahari Netra — Real System Operations

## Services
- Frontend: `https://localhost:5173`
- Backend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:3000/api/system-health`
- Local YOLO: `http://127.0.0.1:8000/health`

## Start everything
From the project root:

```bash
chmod +x START_PRAHARI.sh ML-services/run-ai.sh
./START_PRAHARI.sh
```

The launcher installs only missing AI dependencies, starts the Express relay, local YOLO service, and Vite frontend.

## Phone live
1. Open Admin → **Phone live** on the laptop.
2. Copy the displayed room code.
3. On the phone, open `https://<LAPTOP-IP>:5173/phone`.
4. If Chrome warns about the local development certificate, open the advanced option and continue to the local site.
5. Enter the room code and press **Start live**.
6. Allow camera permission. Use the rear camera.
7. The laptop receives the WebRTC stream and sends frames to local YOLO for PERSON/VEHICLE detection.
8. **Night Vision** enhances low-light frames before inference. **Thermal** is an IR-style visual treatment; a normal phone camera is not a true thermal sensor.

## Real system health
Admin → **System health** now checks: local camera recording assets, the live FastAPI YOLO health endpoint, the live Express backend process/uptime, browser-local storage usage, and browser network state. The result is not hard-coded.

## Real tactical log behavior
Operator actions such as exports, health checks, incident actions, camera refreshes, evidence exports, and incident creation are written to a browser-local tactical log and can be exported. Incident timestamps continuously follow the current IST clock.

## Ground officer visibility
Ground Officer heartbeats are posted to the Express backend every five seconds. Admin Overview polls that backend state, so an admin on another device on the same local network can see the officer's online status, current route, activity, selected camera, and display mode.

## If a port is already in use
Check:

```bash
lsof -i :8000
lsof -i :3000
lsof -i :5173
```

Stop only the stale process, then restart `START_PRAHARI.sh`.
