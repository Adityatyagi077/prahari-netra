# Prahari Netra — India Map + Thermal Update

This package updates the Prahari Netra frontend with:

- A real SVG India state/Union Territory boundary map using `@svg-maps/india`.
- All 12 existing camera nodes remain clickable on the operations map.
- The existing camera recording map keeps a thermal source for every camera.
- Ground Officer camera watch now uses the real recorded video feed and has Visible CCTV / Thermal controls.
- Existing local YOLO AI integration is preserved.

## Setup

From the frontend directory:

```bash
pnpm install
PORT=5173 BASE_PATH=/ pnpm run dev
```

Run the AI server separately from the repository root:

```bash
cd ML-services && ./run-ai.sh
```

The AI server remains at `http://127.0.0.1:8000`.

## Recordings

The uploaded source ZIP did not contain the MP4 recording files. The frontend expects these files under:

`public/recordings/`

Expected files:

- `city-traffic.mp4`
- `crowd-overhead.mp4`
- `frost-path.mp4`
- `pedestrian-corridor.mp4`
- `thermal-analysis-view.mp4`
- `vehicle-highway.mp4`

Copy the existing recordings from your current Prahari Netra project into this package's `public/recordings/` directory before running it.

## Map data

The map component uses the `@svg-maps/india` package, which contains state and Union Territory SVG boundaries. The package is CC-BY-4.0. Verify boundary presentation against the latest Survey of India requirements before public deployment.
