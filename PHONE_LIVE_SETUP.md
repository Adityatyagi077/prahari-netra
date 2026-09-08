# Prahari Netra Phone Live

1. Start the backend on port 3000.
2. Start the frontend with HTTPS on port 5173.
3. On the laptop open `/admin/phone` and create a room.
4. On the phone, use the LAN URL `https://<LAPTOP-IP>:5173/phone?code=<ROOM-CODE>`.
5. Accept the development certificate warning and allow camera access.
6. Keep both devices on the same Wi-Fi/LAN.

The phone transmitter uses WebRTC with direct LAN ICE candidates and the Express backend only for signaling. No video is uploaded to a cloud service.

Demo operator IDs:
- `operator.admin` / `admin@prahari`
- `operator.officer` / `officer@prahari`
