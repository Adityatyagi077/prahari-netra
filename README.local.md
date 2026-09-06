# Prahari Netra

Prahari Netra is a local surveillance-dashboard prototype. It plays recorded camera feeds, sends video frames to a local YOLO service, and draws person/vehicle detections over the video.

## Project layout

```text
frontend/prahari-netra/   React + Vite dashboard and camera recordings
backend/api-server/       Express API service
ML-services/              FastAPI + YOLO detection service
lib/                      Shared API contracts, validation, and database packages
```

## Prerequisites

Install these before starting:

- Node.js 20 or newer (Node.js LTS is recommended)
- pnpm
- Python 3.12 or newer
- Git

### Windows setup

Open PowerShell and install Node.js LTS:

```powershell
winget install OpenJS.NodeJS.LTS
```

Close and reopen PowerShell, then install pnpm:

```powershell
npm install --global pnpm
```

Confirm the tools are available:

```powershell
node --version
pnpm --version
py --version
```

If Python is unavailable, install it with:

```powershell
winget install Python.Python.3.12
```

## Clone and install

```powershell
git clone <YOUR-REPOSITORY-URL>
cd NuttyMushyLogic
pnpm install
```

`pnpm install` creates the dependency folders locally. Do not commit `node_modules` or Python virtual environments.

## Run the application

Start the ML service first, then the frontend. Keep each service running in its own terminal.

### 1. Start the ML service

#### Windows PowerShell

```powershell
cd ML-services
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn ai_server:app --host 127.0.0.1 --port 8000
```

#### macOS / Linux

```bash
cd ML-services
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn ai_server:app --host 127.0.0.1 --port 8000
```

The ML service is available at `http://127.0.0.1:8000`. On its first run, Ultralytics may download the `yolo11n.pt` model if it is not already present in `ML-services`.

### 2. Start the frontend

Open a second terminal in the repository root.

#### Windows PowerShell

```powershell
$env:PORT = "5173"
$env:BASE_PATH = "/"
pnpm --filter @workspace/prahari-netra run dev
```

Open [http://localhost:5173](http://localhost:5173) in a browser.

#### macOS / Linux

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/prahari-netra run dev
```

### 3. Start the backend (optional)

The dashboard currently gets camera, incident, and map data from local frontend fixtures, so the backend is not required to view the application. Start it when developing API functionality:

#### Windows PowerShell

```powershell
$env:PORT = "5000"
pnpm --filter @workspace/api-server run dev
```

The health endpoint is [http://localhost:5000/api/healthz](http://localhost:5000/api/healthz).

## Camera recordings

The frontend reads MP4 recordings from:

```text
frontend/prahari-netra/public/recordings/
```

Expected filenames:

- `city-traffic.mp4`
- `crowd-overhead.mp4`
- `frost-path.mp4`
- `pedestrian-corridor.mp4`
- `thermal-analysis-view.mp4`
- `vehicle-highway.mp4`

If recordings are not included in a clone, add files with these names to that folder. The dashboard will still open, but feeds without a recording show an unavailable-source message.

## Verify the build

From the repository root:

```powershell
pnpm run typecheck
pnpm run build
```

## Troubleshooting

### `pnpm` is not recognized

Install Node.js, close and reopen PowerShell, then run:

```powershell
npm install --global pnpm
```

### Rollup Windows module is missing

Stop running Node processes, remove the generated dependency folder, and reinstall:

```powershell
taskkill /F /IM node.exe
Remove-Item -LiteralPath "node_modules" -Recurse -Force
pnpm install --force
```

If PowerShell reports that no Node process exists, continue with the next command.

### The dashboard says local AI is unavailable

Confirm the ML-service terminal is running and that `http://127.0.0.1:8000/health` returns a response. The frontend sends frames to `POST /detect` on port `8000`.

## Current architecture

```text
Recorded MP4 feed
  -> React frontend captures a frame
  -> FastAPI ML service receives the JPEG frame
  -> YOLO detects people and vehicles
  -> Detection JSON returns to the frontend
  -> Frontend draws boxes and confidence labels over the video
```

The Express backend and `lib` packages are the foundation for future persistent users, cameras, incidents, evidence, and database integration.
