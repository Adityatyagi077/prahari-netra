# Prahari Netra Phone Live Camera

## What it does
- Connects an Android/iPhone browser camera to the command station over WebRTC on the local Wi-Fi network.
- Runs the existing local YOLO service on the command-station laptop.
- Shows PERSON / VEHICLE / CAR / PLATE-candidate counts and detection boxes.
- Includes Visible, Night Vision, and Thermal display modes.
- Night mode also applies low-light enhancement before YOLO inference.

## Start
1. Start the project with `./START_PRAHARI.sh`.
2. Open the admin app at `https://localhost:5173` on the laptop.
3. Open **Phone live** from the Admin command menu. A room code appears.
4. On the phone, while connected to the same Wi-Fi, open the **Network URL** printed by Vite followed by `/phone`.
5. Accept the local self-signed certificate warning if the browser shows one.
6. Enter the room code and press **Start live**. Allow camera access.
7. Return to the laptop. The remote phone stream appears and local YOLO begins inference.

## Important
- The phone and laptop must be on the same local network for the no-cloud WebRTC connection.
- A normal phone camera is not a true thermal sensor. Thermal mode is an IR-style display treatment. Night mode improves low-light inference but cannot create detail that the camera sensor did not capture.
- License plate output is a plate-candidate estimate from vehicle regions; the included `yolo11n.pt` model is not a dedicated plate detector/OCR model.
