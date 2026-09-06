from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import numpy as np
import cv2
from pathlib import Path

app = FastAPI(title='Prahari Netra Local AI')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

MODEL_PATH = Path(__file__).resolve().parent / 'yolo11n.pt'
if not MODEL_PATH.exists():
    raise FileNotFoundError(f'YOLO model not found: {MODEL_PATH}')

model = YOLO(str(MODEL_PATH))
VEHICLES = {'car', 'truck', 'bus', 'motorcycle'}

@app.get('/health')
def health():
    return {
        'status': 'ok',
        'model': 'yolo11n',
        'model_path': str(MODEL_PATH),
        'classes': ['person', 'car', 'truck', 'bus', 'motorcycle'],
    }

def estimate_plate_candidates(frame, vehicle_boxes):
    """Lightweight plate-candidate estimate. yolo11n has no plate class.
    Returns candidate rectangles inside vehicle boxes; this is NOT OCR.
    """
    candidates = []
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    for x1, y1, x2, y2 in vehicle_boxes:
        x1, y1 = max(0, int(x1)), max(0, int(y1))
        x2, y2 = min(frame.shape[1], int(x2)), min(frame.shape[0], int(y2))
        if x2 <= x1 or y2 <= y1:
            continue
        roi = gray[y1:y2, x1:x2]
        h, w = roi.shape[:2]
        if w < 40 or h < 25:
            continue
        # License plates are usually compact, bright, horizontal regions.
        _, thresh = cv2.threshold(roi, 170, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        best = None
        best_score = 0.0
        for contour in contours:
            rx, ry, rw, rh = cv2.boundingRect(contour)
            area = rw * rh
            ratio = rw / max(rh, 1)
            area_ratio = area / max(w * h, 1)
            if 2.0 <= ratio <= 7.0 and 0.005 <= area_ratio <= 0.12 and rw >= 25:
                score = area_ratio * min(ratio, 6.0)
                if score > best_score:
                    best_score = score
                    best = [x1 + rx, y1 + ry, rw, rh]
        if best:
            candidates.append(best)
    return candidates

@app.post('/detect')
async def detect(file: UploadFile = File(...), mode: str = Form('visible')):
    try:
        data = await file.read()
        frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=400, detail='Invalid image frame')

        mode = mode.lower().strip()
        if mode in {'night', 'thermal'}:
            # Low-light enhancement before YOLO. This helps a normal phone/CCTV
            # camera retain people/vehicle features at night; it is not true thermal imaging.
            lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
            l_channel, a_channel, b_channel = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
            l_channel = clahe.apply(l_channel)
            enhanced = cv2.cvtColor(cv2.merge((l_channel, a_channel, b_channel)), cv2.COLOR_LAB2BGR)
            gamma = 1.35
            table = np.array([((i / 255.0) ** (1.0 / gamma)) * 255 for i in np.arange(256)]).astype('uint8')
            frame = cv2.LUT(enhanced, table)

        # Keep inference CPU-friendly for this local laptop setup.
        result = model.predict(frame, conf=0.25, imgsz=640, device='cpu', verbose=False)[0]
        detections = []
        vehicle_boxes = []
        names = result.names

        for box in result.boxes:
            cls = int(box.cls[0])
            name = names[cls]
            if name != 'person' and name not in VEHICLES:
                continue
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            item = {
                'class': 'PERSON' if name == 'person' else 'VEHICLE',
                'label': name,
                'confidence': confidence,
                'bbox': [x1, y1, x2 - x1, y2 - y1],
            }
            detections.append(item)
            if name in VEHICLES:
                vehicle_boxes.append((x1, y1, x2, y2))

        plate_candidates = estimate_plate_candidates(frame, vehicle_boxes)
        return {
            'detections': detections,
            'counts': {
                'person': sum(d['class'] == 'PERSON' for d in detections),
                'vehicle': sum(d['class'] == 'VEHICLE' for d in detections),
                'car': sum(d.get('label') == 'car' for d in detections),
                'plate_candidates': len(plate_candidates),
            },
            'plate_candidates': [
                {'class': 'PLATE_CANDIDATE', 'confidence': 0.0, 'bbox': b}
                for b in plate_candidates
            ],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'YOLO inference failed: {type(exc).__name__}: {exc}')
