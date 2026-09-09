import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Bell, Camera, Smartphone, Radio, Moon,
  Check, CheckCircle2, CircleDot, Crosshair, Database, Download, Eye, FileCheck2,
  FileKey2, Fingerprint, Flag, Gauge, Hexagon, Layers3, LineChart, LockKeyhole,
  LogOut, Map as MapIcon, Menu, MonitorCog, MoreHorizontal, Network, Pause,
  Play, RefreshCw, Search, Satellite, Settings2, ShieldCheck, SlidersHorizontal, Sparkles,
  Target, Timer, Users, Video, Wifi, WifiOff, X, Zap
} from 'lucide-react';
import './index.css';
import indiaMap from '@svg-maps/india';

type Mode = 'admin' | 'officer';
type CameraStatus = 'Online' | 'Degraded' | 'Offline';
type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

const cameras = [
  { id: 'PN-LAD-04', sector: 'Ladakh', site: 'Pangong Forward Perimeter Wall', status: 'Online' as CameraStatus, health: 98, heartbeat: '03 sec ago', detections: 4, coord: [21, 21], accent: 'amber' },
  { id: 'PN-LAD-07', sector: 'Ladakh', site: 'Chushul High Ridge FLIR Recon', status: 'Online' as CameraStatus, health: 96, heartbeat: '06 sec ago', detections: 3, coord: [25, 28], accent: 'sage' },
  { id: 'PN-RAJ-02', sector: 'Rajasthan', site: 'Longewala Barrier Gate Watch', status: 'Online' as CameraStatus, health: 100, heartbeat: '02 sec ago', detections: 2, coord: [15, 45], accent: 'sage' },
  { id: 'PN-RAJ-09', sector: 'Rajasthan', site: 'Thar Desert Access Corridor FLIR', status: 'Online' as CameraStatus, health: 91, heartbeat: '12 sec ago', detections: 2, coord: [23, 48], accent: 'sage' },
  { id: 'PN-PUN-01', sector: 'Punjab', site: 'Ferozepur Perimeter Fence Line', status: 'Online' as CameraStatus, health: 99, heartbeat: '04 sec ago', detections: 1, coord: [30, 34], accent: 'sage' },
  { id: 'PN-GUJ-06', sector: 'Gujarat', site: 'Rann of Kutch Boundary Fence', status: 'Online' as CameraStatus, health: 94, heartbeat: '15 sec ago', detections: 0, coord: [24, 59], accent: 'sage' },
  { id: 'PN-WBE-03', sector: 'West Bengal', site: 'Siliguri Vehicle Triage Post', status: 'Online' as CameraStatus, health: 97, heartbeat: '05 sec ago', detections: 3, coord: [59, 52], accent: 'sage' },
  { id: 'PN-SIK-02', sector: 'Sikkim', site: 'Nathu La Forward Staging FLIR', status: 'Online' as CameraStatus, health: 94, heartbeat: '08 sec ago', detections: 4, coord: [65, 40], accent: 'amber' },
  { id: 'PN-ARP-05', sector: 'Arunachal Pradesh', site: 'Tawang Camo Sector Patrol FLIR', status: 'Online' as CameraStatus, health: 91, heartbeat: '11 sec ago', detections: 3, coord: [78, 31], accent: 'sage' },
  { id: 'PN-ARP-08', sector: 'Arunachal Pradesh', site: 'Walong Outpost Perimeter Trees', status: 'Degraded' as CameraStatus, health: 78, heartbeat: '42 sec ago', detections: 1, coord: [84, 38], accent: 'terra' },
  { id: 'PN-ASM-04', sector: 'Assam', site: 'Dhubri Riverine Night FLIR', status: 'Online' as CameraStatus, health: 98, heartbeat: '04 sec ago', detections: 1, coord: [73, 60], accent: 'sage' },
  { id: 'PN-ASM-07', sector: 'Assam', site: 'Mobile Tactical Sensor Unit', status: 'Online' as CameraStatus, health: 95, heartbeat: '01 sec ago', detections: 1, coord: [80, 64], accent: 'sage' },
];

const incidents = [
  { id: 'INC-2417', time: '14 min ago', sector: 'Ladakh', title: 'Perimeter wall breach detected near forward post', severity: 'Critical' as Severity, camera: 'PN-LAD-04', state: 'Under review', evidence: 'Verified', kind: 'PERSON · INTRUSION' },
  { id: 'INC-2416', time: '38 min ago', sector: 'Rajasthan', title: 'Vehicle approaching restricted barrier gate at night', severity: 'High' as Severity, camera: 'PN-RAJ-02', state: 'Acknowledged', evidence: 'Verified', kind: 'VEHICLE' },
  { id: 'INC-2415', time: '1 hr ago', sector: 'Arunachal Pradesh', title: 'Concealed movement identified in tree line', severity: 'Medium' as Severity, camera: 'PN-ARP-08', state: 'Investigating', evidence: 'Pending', kind: 'PERSON · CAMO' },
  { id: 'INC-2414', time: '2 hr ago', sector: 'Punjab', title: 'Perimeter fence movement detected on IR camera', severity: 'Low' as Severity, camera: 'PN-PUN-01', state: 'Open', evidence: 'Verified', kind: 'PERSON' },
  { id: 'INC-2413', time: '4 hr ago', sector: 'West Bengal', title: 'Vehicle convoy triage and personnel scan at outpost', severity: 'High' as Severity, camera: 'PN-WBE-03', state: 'Closed', evidence: 'Verified', kind: 'VEHICLE · CONVOY' },
];

const navGroups: Array<{ label: string; items: Array<[string, string, typeof Activity]> }> = [
  { label: 'Command', items: [['/admin', 'Overview', Gauge], ['/admin/map', 'Operations map', MapIcon], ['/admin/cameras', 'Cameras', Camera], ['/admin/phone', 'Phone live', Smartphone], ['/admin/incidents', 'Incidents', Flag]] },
  { label: 'Assurance', items: [['/admin/evidence', 'Evidence vault', FileCheck2], ['/admin/analytics', 'Analytics', LineChart], ['/admin/health', 'System health', Activity]] },
  { label: 'Control', items: [['/admin/access', 'Access & audit', Users]] },
];

const officerNav = [
  ['/officer', 'My sector', Target],
  ['/officer/watch', 'Camera watch', Video],
  ['/officer/alerts', 'Alert queue', Bell],
  ['/officer/map', 'Sector map', MapIcon],
  ['/officer/evidence', 'Capture evidence', FileCheck2],
] as const;

function cn(...classes: Array<string | false | undefined>) { return classes.filter(Boolean).join(' '); }

const TACTICAL_LOG_KEY = 'prahari-netra:tactical-log';
type TacticalLog = { id: string; at: number; actor: string; action: string; context: string; trace: string };

function nowISTTime() {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date());
}
function nowISTDateTime() {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date());
}
function liveEventTime(offsetMinutes: number) {
  const d = new Date(Date.now() - offsetMinutes * 60_000);
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(d);
}
function readTacticalLogs(): TacticalLog[] {
  try { return JSON.parse(localStorage.getItem(TACTICAL_LOG_KEY) ?? '[]'); } catch { return []; }
}
function appendTacticalLog(action: string, context = 'Command') {
  try {
    const entry: TacticalLog = { id: crypto.randomUUID?.() ?? `${Date.now()}`, at: Date.now(), actor: 'A. SRINIVASAN', action, context, trace: Math.random().toString(16).slice(2, 10) + '…' + Math.random().toString(16).slice(2, 6) };
    localStorage.setItem(TACTICAL_LOG_KEY, JSON.stringify([entry, ...readTacticalLogs()].slice(0, 100)));
  } catch { }
}
function downloadText(filename: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportCsv(filename: string, rows: string[][]) {
  const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  downloadText(filename, csv, 'text/csv;charset=utf-8');
}

function StatusDot({ status = 'Online' }: { status?: string }) {
  const isOnline = status === 'Online' || status === 'Verified' || status === 'Active';
  const isWarn = status === 'Degraded' || status === 'Pending';
  const color = isOnline
    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
    : isWarn
      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
      : 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]';
  return <span className={cn('inline-block h-2 w-2 rounded-full', color)} />;
}

function Wordmark({ light = true }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
        <Hexagon size={20} strokeWidth={2.2} />
      </span>
      <span>
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          DEFENSE COMMAND NETWORK
        </span>
        <span className="block text-base font-extrabold tracking-tight text-white">
          PRAHARI NETRA
        </span>
      </span>
    </div>
  );
}

function LocalStatus() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
      AIR-GAPPED · SECURE TELEMETRY
    </span>
  );
}



const cameraRecordings: Record<string, { visible: string; thermal: string }> = {
  'PN-LAD-04': { visible: '/recordings/border-flir-wall-breach.mp4', thermal: '/recordings/border-flir-wall-breach.mp4' },
  'PN-LAD-07': { visible: '/recordings/border-flir-ridge-patrol.png', thermal: '/recordings/border-flir-ridge-patrol.png' },
  'PN-RAJ-02': { visible: '/recordings/border-checkpoint-night.mp4', thermal: '/recordings/border-checkpoint-night.mp4' },
  'PN-RAJ-09': { visible: '/recordings/border-flir-access-road.png', thermal: '/recordings/border-flir-access-road.png' },
  'PN-PUN-01': { visible: '/recordings/border-fence-patrol.mp4', thermal: '/recordings/border-fence-patrol.mp4' },
  'PN-GUJ-06': { visible: '/recordings/border-perimeter-fence.mp4', thermal: '/recordings/border-perimeter-fence.mp4' },
  'PN-WBE-03': { visible: '/recordings/border-vehicle-inspection.mp4', thermal: '/recordings/border-vehicle-inspection.mp4' },
  'PN-SIK-02': { visible: '/recordings/border-flir-convoy-night.png', thermal: '/recordings/border-flir-convoy-night.png' },
  'PN-ARP-05': { visible: '/recordings/border-flir-tactical-camo.png', thermal: '/recordings/border-flir-tactical-camo.png' },
  'PN-ARP-08': { visible: '/recordings/border-flir-outpost-trees.png', thermal: '/recordings/border-flir-outpost-trees.png' },
  'PN-ASM-04': { visible: '/recordings/border-flir-boundary-watch.png', thermal: '/recordings/border-flir-boundary-watch.png' },
  'PN-ASM-07': { visible: '/recordings/border-checkpoint-night.mp4', thermal: '/recordings/border-checkpoint-night.mp4' },
};
const defaultRecording = { visible: '/recordings/border-flir-wall-breach.mp4', thermal: '/recordings/border-flir-wall-breach.mp4' };

const borderPoints = [
  { id: 'LAD', label: 'Ladakh', x: 21, y: 21, cameras: ['PN-LAD-04', 'PN-LAD-07'] },
  { id: 'PUN', label: 'Punjab', x: 30, y: 34, cameras: ['PN-PUN-01'] },
  { id: 'RAJ', label: 'Rajasthan', x: 15, y: 45, cameras: ['PN-RAJ-02', 'PN-RAJ-09'] },
  { id: 'GUJ', label: 'Gujarat', x: 24, y: 59, cameras: ['PN-GUJ-06'] },
  { id: 'WB', label: 'West Bengal', x: 59, y: 52, cameras: ['PN-WBE-03'] },
  { id: 'SIK', label: 'Sikkim', x: 65, y: 40, cameras: ['PN-SIK-02'] },
  { id: 'ARP', label: 'Arunachal', x: 81, y: 34, cameras: ['PN-ARP-05', 'PN-ARP-08'] },
  { id: 'ASM', label: 'Assam', x: 76, y: 61, cameras: ['PN-ASM-04', 'PN-ASM-07'] },
];

const CAMERA_API = '/ai-api';

type LiveDetection = { class: 'PERSON' | 'VEHICLE'; label?: string; confidence: number; bbox: [number, number, number, number] };
type LiveStats = { person: number; vehicle: number; car: number; plate_candidates: number };

function CameraFeed({ cameraId, thermal = false, night = false, stream, aiEnabled = true, preview = false, className = '' }: { cameraId?: string; thermal?: boolean; night?: boolean; stream?: MediaStream | null; aiEnabled?: boolean; preview?: boolean; className?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [detections, setDetections] = useState<LiveDetection[]>([]);
  const [plateCandidates, setPlateCandidates] = useState<LiveDetection[]>([]);
  const [stats, setStats] = useState<LiveStats>({ person: 0, vehicle: 0, car: 0, plate_candidates: 0 });
  const [aiState, setAiState] = useState<'connecting' | 'active' | 'error' | 'off'>('connecting');
  const [aiMessage, setAiMessage] = useState('Connecting to local inference service');
  const [sourceError, setSourceError] = useState(false);
  const recording = cameraRecordings[cameraId ?? ''] ?? defaultRecording;
  const source = thermal ? recording.thermal : recording.visible;
  const isImage = Boolean(source && /\.(png|jpg|jpeg|webp)$/i.test(source));
  const isLive = Boolean(stream);
  const effectiveAi = aiEnabled && !preview;

  useEffect(() => {
    setSourceError(false); setDetections([]); setPlateCandidates([]); setStats({ person: 0, vehicle: 0, car: 0, plate_candidates: 0 }); setAiState(effectiveAi ? 'connecting' : 'off');
    setAiMessage('Connecting to local inference service');
    if (!stream && !isImage) videoRef.current?.load();
  }, [source, effectiveAi, stream, isImage]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream ?? null;
    if (stream) {
      video.play().catch(() => { });
    }
    return () => {
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    if (!effectiveAi) return;
    let cancelled = false;
    let timer: number | null = null;
    let running = false;
    const frame = document.createElement('canvas');
    const sendFrame = async () => {
      if (cancelled || running) return;
      const video = videoRef.current;
      const img = imgRef.current;
      let elW = 0;
      let elH = 0;

      if (isImage) {
        if (!img || !img.complete || !img.naturalWidth) return schedule();
        elW = img.naturalWidth;
        elH = img.naturalHeight;
      } else {
        if (!video || video.paused || video.ended || video.readyState < 2 || !video.videoWidth) return schedule();
        elW = video.videoWidth;
        elH = video.videoHeight;
      }

      running = true;
      try {
        frame.width = 640;
        frame.height = Math.max(1, Math.round(640 * elH / elW));
        const ctx = frame.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        if (isImage && img) {
          ctx.drawImage(img, 0, 0, frame.width, frame.height);
        } else if (video) {
          ctx.drawImage(video, 0, 0, frame.width, frame.height);
        }
        const blob = await new Promise<Blob | null>((resolve) => frame.toBlob(resolve, 'image/jpeg', 0.75));
        if (!blob) throw new Error('Frame encoding failed');
        const body = new FormData(); body.append('file', blob, 'frame.jpg');
        body.append('mode', night || thermal ? 'night' : 'visible');
        const response = await fetch(`${CAMERA_API}/detect`, { method: 'POST', body });
        if (!response.ok) throw new Error(`AI service returned ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setDetections(data.detections ?? []);
          setPlateCandidates(data.plate_candidates ?? []);
          setStats(data.counts ?? { person: 0, vehicle: 0, car: 0, plate_candidates: 0 });
          setAiState('active');
          setAiMessage(isImage ? 'Thermal FLIR Reconnaissance · Active' : 'Local YOLO inference active');
        }
      } catch (error) {
        if (!cancelled) {
          setAiState('error');
          setAiMessage(error instanceof Error ? error.message : 'Inference service unavailable');
          setDetections([]);
          setPlateCandidates([]);
          setStats({ person: 0, vehicle: 0, car: 0, plate_candidates: 0 });
        }
      } finally {
        running = false;
        schedule();
      }
    };
    const schedule = () => {
      if (!cancelled) timer = window.setTimeout(sendFrame, isImage ? 3000 : 350);
    };
    schedule();
    return () => { cancelled = true; if (timer !== null) window.clearTimeout(timer); };
  }, [effectiveAi, source, stream, night, thermal, isImage]);

  useEffect(() => {
    if (!effectiveAi) return;
    const target = isImage ? imgRef.current : videoRef.current;
    const canvas = canvasRef.current;
    if (!target || !canvas) return;
    const draw = () => {
      const rect = target.getBoundingClientRect();
      const elW = isImage ? (imgRef.current?.naturalWidth || 0) : (videoRef.current?.videoWidth || 0);
      const elH = isImage ? (imgRef.current?.naturalHeight || 0) : (videoRef.current?.videoHeight || 0);
      if (!elW || !rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const scale = Math.max(rect.width / elW, rect.height / elH);
      const rw = elW * scale, rh = elH * scale;
      const ox = (rect.width - rw) / 2, oy = (rect.height - rh) / 2;
      const ratio = rw / 640;
      detections.forEach((d) => {
        const [x, y, w, h] = d.bbox;
        const bx = x * ratio + ox, by = y * ratio + oy, bw = w * ratio, bh = h * ratio;
        ctx.strokeStyle = d.class === 'PERSON' ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        const label = `${d.label ? d.label.toUpperCase() : d.class} ${(d.confidence * 100).toFixed(1)}%`;
        ctx.font = '11px Inter, system-ui, sans-serif';
        const tw = ctx.measureText(label).width + 12;
        const ly = Math.max(18, by);
        ctx.fillStyle = d.class === 'PERSON' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)';
        ctx.fillRect(bx, ly - 18, tw, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, bx + 6, ly - 5);
      });
      plateCandidates.forEach((d) => {
        const [x, y, w, h] = d.bbox;
        const bx = x * ratio + ox, by = y * ratio + oy, bw = w * ratio, bh = h * ratio;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(6,182,212,0.9)';
        ctx.fillRect(bx, Math.max(15, by) - 15, 48, 15);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PLATE?', bx + 5, Math.max(15, by) - 4);
      });
    };
    const observer = new ResizeObserver(draw);
    observer.observe(target);
    if (!isImage && videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', draw);
      videoRef.current.addEventListener('play', draw);
    } else if (imgRef.current) {
      imgRef.current.addEventListener('load', draw);
    }
    const id = window.setInterval(draw, 100);
    return () => {
      observer.disconnect();
      if (!isImage && videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', draw);
        videoRef.current.removeEventListener('play', draw);
      } else if (imgRef.current) {
        imgRef.current.removeEventListener('load', draw);
      }
      window.clearInterval(id);
    };
  }, [detections, plateCandidates, effectiveAi, isImage]);

  return <div className={cn('camera-feed-shell relative overflow-hidden rounded-xl border border-white/10 bg-slate-950', className)}>
    {!sourceError ? (
      <div className="relative h-full w-full flex items-center justify-center bg-black">
        {isImage ? (
          <img
            ref={imgRef}
            src={source}
            alt={cameraId ?? 'Border Camera Feed'}
            className={cn('camera-recording h-full w-full object-cover', thermal && 'camera-recording-thermal', night && 'camera-recording-night')}
            onLoad={() => setSourceError(false)}
            onError={() => setSourceError(true)}
          />
        ) : (
          <video
            ref={videoRef}
            className={cn('camera-recording', thermal && 'camera-recording-thermal', night && 'camera-recording-night')}
            controls={!preview}
            autoPlay
            muted
            loop
            playsInline
            onError={() => !stream && setSourceError(true)}
          >
            {!stream && <source src={source} type="video/mp4" />}
          </video>
        )}
        {effectiveAi && <canvas ref={canvasRef} className="ai-detection-canvas pointer-events-none absolute inset-0 z-[5] h-full w-full" />}
      </div>
    ) : (
      <div className="camera-recording-fallback">
        <Video size={28} />
        <strong>Camera feed unavailable</strong>
        <span>Check recording in public/recordings.</span>
      </div>
    )}
    {!preview && effectiveAi && (
      <div
        className={cn(
          'pointer-events-none absolute left-4 top-4 z-10 rounded-lg border px-3 py-1.5 text-xs font-semibold backdrop-blur-md',
          aiState === 'active'
            ? 'border-emerald-500/30 bg-slate-950/80 text-emerald-400'
            : aiState === 'connecting'
            ? 'border-amber-500/30 bg-slate-950/80 text-amber-400'
            : 'border-slate-700 bg-slate-950/80 text-slate-400'
        )}
      >
        <span className="signal-pulse" /> LOCAL YOLO · {aiState === 'active' ? 'NOMINAL ACTIVE' : aiState === 'connecting' ? 'CONNECTING...' : 'STANDBY'}
      </div>
    )}
    {!preview && isImage && (
      <div className="pointer-events-none absolute left-4 bottom-4 z-10 rounded-lg border border-cyan-500/30 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 backdrop-blur-md flex items-center gap-1.5">
        <Camera size={13} /> SENSOR STILL · FLIR RECON
      </div>
    )}
    {!preview && effectiveAi && aiState === 'error' && (
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[80%] rounded-lg border border-amber-500/30 bg-slate-950/90 px-3 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-md">
        Inference standby · {aiMessage}
      </div>
    )}
  </div>;
}

function IndiaMap({ compact = false, sector = 'All sectors', onCamera, embedded = false, className }: { compact?: boolean; sector?: string; onCamera?: (id: string) => void; embedded?: boolean; className?: string }) {
  const activeCameras = sector === 'All sectors' ? cameras : cameras.filter((camera) => camera.sector === sector);
  const activeSectors = new Set(activeCameras.map((camera) => camera.sector));
  return (
    <div
      className={cn(
        'map-frame relative overflow-hidden flex-1 w-full flex flex-col justify-center',
        embedded
          ? 'map-frame-embedded min-h-[500px]'
          : compact
          ? 'rounded-xl border border-white/10 bg-slate-950/60 backdrop-blur-md min-h-[340px]'
          : 'rounded-xl border border-white/10 bg-slate-950/60 backdrop-blur-md min-h-[580px]',
        className
      )}
    >
      <div className="absolute inset-0 map-grid opacity-30" />
      <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-3">
        <span className="eyebrow flex items-center gap-1.5"><Crosshair size={13} /> RADAR C4ISR MESH</span>
        <span className="rounded-md border border-white/10 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          28 STATES · 8 UTs · ORBAT BOUNDARIES
        </span>
      </div>
      <div className="absolute right-4 top-4 z-20 flex gap-2">
        <span className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
          <Layers3 size={14} className="text-emerald-400" /> SENSOR OVERLAY ACTIVE
        </span>
      </div>
      <div className="absolute inset-x-6 top-14 bottom-16 z-10">
        <svg viewBox={indiaMap.viewBox} className="h-full w-full" role="img" aria-label="India map with state and union territory boundaries">
          <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
          {indiaMap.locations.map((location: { id: string; name: string; path: string }) => {
            const stateCamera = cameras.find((camera) => camera.sector.toLowerCase() === location.name.toLowerCase());
            return (
              <path
                key={location.id}
                d={location.path}
                className={cn('india-state-path', stateCamera && 'india-state-clickable')}
                aria-label={location.name}
                tabIndex={stateCamera ? 0 : -1}
                onClick={() => stateCamera && onCamera?.(stateCamera.id)}
                onKeyDown={(event) => {
                  if ((event.key === 'Enter' || event.key === ' ') && stateCamera) onCamera?.(stateCamera.id);
                }}
              >
                <title>{stateCamera ? `${location.name} · Open border camera ${stateCamera.id}` : location.name}</title>
              </path>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0">
          {activeCameras.map((camera) => (
            <button
              key={camera.id}
              type="button"
              aria-label={`${camera.id} · ${camera.site}`}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${camera.coord[0]}%`, top: `${camera.coord[1]}%` }}
              onClick={() => onCamera?.(camera.id)}
            >
              <span className={cn('node-halo block h-5 w-5 rounded-full', camera.status === 'Offline' ? 'offline' : camera.status === 'Degraded' ? 'degraded' : '')}>
                <span className="node-core absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              </span>
              <span className="mt-1 block whitespace-nowrap rounded-md border border-white/15 bg-slate-950/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 shadow-lg">
                {camera.id}
              </span>
            </button>
          ))}
          {borderPoints
            .filter((point) => activeSectors.has(point.label))
            .map((point) => (
              <span
                key={point.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-dashed border-emerald-500/40 bg-slate-950/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-400"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                {point.label}
              </span>
            ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-4 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md">
        <span className="flex items-center gap-2"><StatusDot /> Online {cameras.filter((c) => c.status === 'Online').length}</span>
        <span className="flex items-center gap-2"><StatusDot status="Degraded" /> Degraded {cameras.filter((c) => c.status === 'Degraded').length}</span>
        <span className="flex items-center gap-2"><StatusDot status="Offline" /> Offline {cameras.filter((c) => c.status === 'Offline').length}</span>
      </div>
      {!compact && (
        <div className="absolute bottom-4 right-4 z-20 rounded-xl border border-white/10 bg-slate-950/80 px-3.5 py-2 font-mono text-xs font-semibold text-emerald-400 backdrop-blur-md">
          12 NODES · 08 BORDER SECTORS · AIR-GAPPED
        </div>
      )}
    </div>
  );
}

function Button({ children, kind = 'secondary', onClick, testId, disabled = false, type = 'button' }: { children: ReactNode; kind?: 'primary' | 'secondary' | 'danger' | 'quiet'; onClick?: () => void; testId: string; disabled?: boolean; type?: 'button' | 'submit' | 'reset' }) {
  return <button type={type} data-testid={testId} onClick={onClick ?? (() => { })} disabled={disabled} className={cn('action-button', `action-${kind}`, disabled && 'cursor-not-allowed opacity-50')}>{children}</button>;
}

function PageHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
    <div>
      <div className="eyebrow mb-2 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
        {eyebrow}
      </div>
      <h1 className="page-title">{title}</h1>
      {detail && <p className="mt-1.5 max-w-3xl text-xs text-slate-400 leading-relaxed">{detail}</p>}
    </div>
    {action}
  </div>;
}

function Metric({ label, value, detail, tone = 'default', icon: Icon }: { label: string; value: string; detail: string; tone?: 'default' | 'alert' | 'good'; icon: typeof Activity }) {
  const iconColor = tone === 'alert' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : tone === 'good' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return <div className="metric-panel">
    <div className="flex items-start justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={cn('grid h-8 w-8 place-items-center rounded-lg border', iconColor)}>
        <Icon size={15} />
      </span>
    </div>
    <div className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</div>
    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', tone === 'alert' ? 'bg-rose-400' : tone === 'good' ? 'bg-emerald-400' : 'bg-amber-400')} />
      <span>{detail}</span>
    </div>
  </div>;
}

type OfficerPresence = {
  online: boolean;
  name: string;
  role: string;
  path: string;
  activity: string;
  camera?: string;
  mode?: string;
  lastSeen: number;
};

const OFFICER_PRESENCE_KEY = 'prahari-netra:officer-presence';

function publishOfficerPresence(presence: Omit<OfficerPresence, 'lastSeen'>) {
  try {
    localStorage.setItem(OFFICER_PRESENCE_KEY, JSON.stringify({ ...presence, lastSeen: Date.now() }));
  } catch { }
}

function clearOfficerPresence() {
  try {
    const current = JSON.parse(localStorage.getItem(OFFICER_PRESENCE_KEY) ?? '{}');
    localStorage.setItem(OFFICER_PRESENCE_KEY, JSON.stringify({
      ...current,
      online: false,
      lastSeen: Date.now(),
    }));
  } catch { }
}

function AppShell({ mode, children }: { mode: Mode; children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clock, setClock] = useState(nowISTTime());
  const isAdmin = mode === 'admin';
  const nav: Array<{ href: string; label: string; Icon: typeof Activity; group: string }> = isAdmin ? navGroups.flatMap((group) => group.items.map(([href, label, Icon]) => ({ href, label, Icon, group: group.label }))) : officerNav.map(([href, label, Icon]) => ({ href, label, Icon, group: 'Field operations' }));
  useEffect(() => { const id = window.setInterval(() => setClock(nowISTTime()), 1000); return () => window.clearInterval(id); }, []);
  useEffect(() => {
    if (isAdmin) return;
    const activityByPath: Record<string, string> = {
      '/officer': 'Reviewing assigned sector overview',
      '/officer/watch': 'Monitoring assigned camera feed',
      '/officer/alerts': 'Reviewing and triaging field alerts',
      '/officer/map': 'Reviewing assigned sector map',
      '/officer/evidence': 'Capturing field evidence',
    };
    const publish = () => {
      const payload = { online: true, name: 'R. DORJE', role: 'GROUND OFFICER · G2', path: location, activity: activityByPath[location] ?? 'Working in field console' };
      publishOfficerPresence(payload);
      fetch('/signal-api/api/officer/presence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => { });
    };
    publish();
    const heartbeat = window.setInterval(publish, 5000);
    const onUnload = () => { clearOfficerPresence(); fetch('/signal-api/api/officer/presence', { method: 'DELETE', keepalive: true }).catch(() => { }); };
    window.addEventListener('beforeunload', onUnload);
    return () => { window.clearInterval(heartbeat); window.removeEventListener('beforeunload', onUnload); };
  }, [isAdmin, location]);
  return <div className={cn('min-h-[100dvh] bg-[#090d12] text-slate-100', isAdmin ? 'shell-admin' : 'shell-officer')}>
    <aside className={cn('fixed inset-y-0 left-0 z-40 w-[264px] border-r border-white/10 bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 md:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-6 py-5"><Wordmark light /></div>
        <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-slate-900/60 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <StatusDot /> {isAdmin ? 'DEFCON 2 · ADMIN' : 'DEFCON 3 · OFFICER'}
            </span>
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">COP-ACTIVE</span>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-400">{isAdmin ? 'National C4ISR Operations Desk' : 'Assigned · Ladakh / North'}</div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{isAdmin ? 'COMMAND CHANNELS' : 'FIELD CHANNELS'}</div>
          {nav.map(({ href, label, Icon, group }) => <div key={href}>
            {isAdmin && nav.findIndex((n) => n.group === group && n.href === href) === nav.findIndex((n) => n.group === group) && (
              <div className="mb-1 mt-4 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">{group}</div>
            )}
            <Link href={href} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, '-')}`} className={cn('nav-link', location === href && 'nav-link-active')}>
              <Icon size={16} strokeWidth={1.8} className={location === href ? 'text-emerald-400' : 'text-slate-400'} />
              <span>{label}</span>
              {label === 'Alert queue' && <span className="ml-auto rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-300 border border-rose-500/30">03</span>}
            </Link>
          </div>)}
        </nav>
        <div className="border-t border-white/10 bg-slate-950/60 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="avatar">AS</span>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white">{isAdmin ? 'A. Srinivasan' : 'R. Dorje'}</div>
              <div className="text-[11px] font-medium text-emerald-400">{isAdmin ? 'Clearance: Top Secret' : 'Field Operator · G2'}</div>
            </div>
          </div>
          <Link href="/login" data-testid="link-switch-role" className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
            <LogOut size={14} /> Switch operational role
          </Link>
        </div>
      </div>
    </aside>
    {mobileOpen && <button aria-label="Close navigation" data-testid="button-close-navigation" className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs md:hidden" onClick={() => setMobileOpen(false)} />}
    <main className="md:pl-[264px]">
      <header className="sticky top-0 z-20 flex min-h-[64px] items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 backdrop-blur-xl md:px-8">
        <button className="mr-3 md:hidden text-emerald-400" data-testid="button-open-navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <div className="flex items-center gap-3">
          <LocalStatus />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <div className="text-xs font-semibold text-white">{isAdmin ? 'National Command Center · ORBAT' : 'Ladakh Sector · North Watch'}</div>
            <div className="text-[11px] text-slate-400">Prahari-HQ · Air-Gapped · <span className="font-mono text-emerald-400">{clock} IST</span></div>
          </div>
          <span className="avatar avatar-light">{isAdmin ? 'AS' : 'RD'}</span>
        </div>
      </header>
      <div className="mx-auto max-w-[1540px] px-6 py-8 md:px-8 lg:px-10">{children}</div>
    </main>
  </div>;
}

function Home() {
  const [, setLocation] = useLocation();
  return (
    <div className="entry-screen min-h-[100dvh] overflow-hidden bg-[#070b10] text-slate-100 flex flex-col justify-between">
      <div className="entry-grain opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6 md:px-12 border-b border-white/5 backdrop-blur-sm">
          <Wordmark light />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Air-Gapped Sovereign Node
            </span>
          </div>
        </header>

        {/* Main hero area with map */}
        <div className="flex-1 relative flex flex-col items-center justify-center px-6 py-12">
          {/* Tactical radar rings, sweep & converging laser scans */}
          <div className="entry-radar-container">
            <div className="entry-radar-sweep" />
            <div className="entry-radar-ring entry-radar-ring-1" />
            <div className="entry-radar-ring entry-radar-ring-2" />
            <div className="entry-converge entry-converge-left" />
            <div className="entry-converge entry-converge-right" />
            <div className="entry-converge entry-converge-top" />
            <div className="entry-converge entry-converge-bottom" />
          </div>

          {/* India map with proper state boundaries */}
          <div className="entry-india-container">
            <div className="entry-map-build-flare" />
            <svg viewBox={indiaMap.viewBox} className="entry-india-svg" aria-hidden="true">
              {indiaMap.locations.map((loc: { id: string; name: string; path: string }, index) => (
                <path key={loc.id} d={loc.path} className={`entry-state-path entry-state-path-${index % 4}`} style={{ animationDelay: `${120 + (index % 10) * 65}ms` }} />
              ))}
            </svg>

            {/* Orbital reconnaissance satellite */}
            <div className="entry-satellite-orbit" aria-hidden="true">
              <div className="entry-satellite-track" />
              <div className="entry-satellite">
                <span className="entry-satellite-beam" />
                <Satellite size={18} strokeWidth={1.8} />
              </div>
            </div>
            {/* Border sector labels */}
            <div className="entry-map-label" style={{ top: '8%', left: '50%', transform: 'translateX(-50%)' }}>
              <span className="entry-map-dot bg-emerald-400 text-emerald-400" /> LOC · Northern Sector
            </div>
            <div className="entry-map-label" style={{ top: '32%', right: '5%' }}>
              <span className="entry-map-dot bg-cyan-400 text-cyan-400" /> Eastern Command
            </div>
            <div className="entry-map-label" style={{ top: '55%', left: '5%' }}>
              <span className="entry-map-dot bg-amber-400 text-amber-400" /> Western Frontier
            </div>
          </div>

          {/* Hero text overlay */}
          <div className="relative z-20 text-center max-w-3xl mx-auto mt-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-6 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              INTELLIGENT BORDER TELEMETRY &amp; PERIMETER SURVEILLANCE
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              See the Line. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-semibold italic">
                Guard the Frontier.
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
              Air-gapped edge AI processing, WebRTC real-time visual reconnaissance, and cryptographically verified evidence provenance.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/35 active:scale-[0.98]"
                data-testid="button-enter-system"
                onClick={() => setLocation('/login')}
              >
                Enter Command Workspace <ArrowRight size={16} />
              </button>
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-md"
                data-testid="button-read-brief"
                onClick={() => document.getElementById('entry-brief')?.scrollIntoView({ behavior: 'smooth' })}
              >
                System Brief
              </button>
            </div>
          </div>
        </div>

        {/* Bottom stats section */}
        <div id="entry-brief" className="relative z-20 px-6 pb-8 md:px-12 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['48', 'Recorded Nodes Active', 'Real-time telemetry feeds'],
              ['08', 'Border Sectors', 'Zero-blindspot coverage'],
              ['SHA-256', 'Cryptographic Chain', 'Immutable tamper evidence'],
            ].map(([val, label, sub]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-emerald-500/30 shadow-lg">
                <span className="block font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">{val}</span>
                <span className="block mt-1 text-xs font-semibold text-slate-200">{label}</span>
                <span className="block mt-0.5 text-[11px] text-slate-400">{sub}</span>
              </div>
            ))}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-emerald-500/30 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="text-xs font-semibold text-white">All Outposts Nominal</span>
                </div>
                <span className="block mt-1 text-[11px] text-slate-400">Air-Gap Verified · Local Mode</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 font-medium tracking-wide">SEC-GRADE HIGH</span>
            </div>
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Sovereign Defense Environment · DEFCON 2 Standby
            </span>
            <span className="font-mono text-[11px]">BUILD 0.8.14 · LOCALHOST ISOLATION</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Login() {
  const [, setLocation] = useLocation();
  const [operatorId, setOperatorId] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');

  const credentials: Record<string, { role: Mode; password: string }> = {
    'operator.admin': { role: 'admin', password: 'admin@prahari' },
    'operator.officer': { role: 'officer', password: 'officer@prahari' },
    'admin': { role: 'admin', password: 'admin@prahari' },
    'officer': { role: 'officer', password: 'officer@prahari' },
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const key = operatorId.trim().toLowerCase();
    const account = credentials[key];
    if (!account || password !== account.password) {
      setNotice('ACCESS DENIED · Invalid operator credentials or access key');
      return;
    }
    setNotice('AUTHENTICATION SUCCESSFUL · Establishing session…');
    try {
      sessionStorage.setItem('prahari-role', account.role);
      sessionStorage.setItem('prahari-authenticated', 'true');
      sessionStorage.setItem('prahari-operator-id', key);
    } catch { }
    appendTacticalLog(`Authenticated ${account.role === 'admin' ? 'admin command' : 'ground officer'}`, 'Login');
    window.setTimeout(() => setLocation(account.role === 'admin' ? '/admin' : '/officer'), 400);
  };

  const exitSystem = () => {
    try {
      sessionStorage.removeItem('prahari-role');
      sessionStorage.removeItem('prahari-authenticated');
      sessionStorage.removeItem('prahari-operator-id');
      sessionStorage.removeItem('prahari-officer-activity');
    } catch { }
    setLocation('/');
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-[#070b10] text-slate-100 px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.06),transparent_60%)] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full mb-6">
        <Wordmark light />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          data-testid="button-exit-system"
          onClick={exitSystem}
        >
          <LogOut size={13} />
          <span>Exit System</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Secure Node</span>
              <h2 className="text-xl font-bold text-white mt-0.5">Operator Authentication</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Air-Gapped
            </span>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Operator ID
              </label>
              <input
                data-testid="input-operator-id"
                className="field-input"
                type="text"
                value={operatorId}
                onChange={(event) => { setOperatorId(event.target.value); setNotice(''); }}
                autoComplete="username"
                placeholder="operator.admin or operator.officer"
                autoFocus
                spellCheck={false}
              />
              <span className="mt-1.5 block text-[11px] text-slate-500">
                Default: <code className="text-slate-400 font-mono">admin</code> or <code className="text-slate-400 font-mono">officer</code>
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Access Vector (Key)
              </label>
              <input
                data-testid="input-access-password"
                className="field-input font-mono"
                type="password"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setNotice(''); }}
                autoComplete="current-password"
                placeholder="••••••••••••"
              />
              <span className="mt-1.5 block text-[11px] text-slate-500">
                Key: <code className="text-slate-400 font-mono">admin@prahari</code> or <code className="text-slate-400 font-mono">officer@prahari</code>
              </span>
            </div>

            {notice && (
              <div
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border p-3 text-xs font-medium',
                  notice.startsWith('ACCESS DENIED')
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                )}
                role="status"
              >
                {notice.startsWith('ACCESS DENIED') ? <X size={15} className="shrink-0 text-rose-400" /> : <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />}
                <span>{notice}</span>
              </div>
            )}

            <button
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] transition-all"
              type="submit"
              data-testid="button-authenticate"
            >
              <span>Authenticate Session</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><LockKeyhole size={12} className="text-emerald-400" /> Local session</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-cyan-400" /> Role-scoped</span>
            <span className="flex items-center gap-1.5"><Network size={12} className="text-teal-400" /> Air-gapped</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full mt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 pt-4">
        <span>PRAHARI-NETRA · AIR-GAPPED SECURE INSTANCE</span>
        <span>SECURITY PROTOCOL · ZERO OUTBOUND TELEMETRY</span>
      </footer>
    </div>
  );
}

function RoleCard({ mode, selected, onClick, onEnter }: { mode: Mode; selected: boolean; onClick: () => void; onEnter: () => void }) {
  const admin = mode === 'admin';
  return (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all cursor-pointer backdrop-blur-md',
        selected
          ? 'border-emerald-500 bg-slate-900/80 shadow-lg shadow-emerald-500/10'
          : 'border-white/10 bg-slate-900/40 hover:border-white/20'
      )}
      onClick={onClick}
      data-testid={`card-role-${mode}`}
    >
      <div className="flex items-start justify-between">
        <span className={cn('grid h-10 w-10 place-items-center rounded-lg border', admin ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400')}>
          {admin ? <MonitorCog size={22} /> : <Crosshair size={22} />}
        </span>
        <span className={cn('h-3.5 w-3.5 rounded-full border-2', selected ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'border-slate-600')} />
      </div>
      <div className="mt-5">
        <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">{admin ? 'DEFENSE C4ISR COMMAND' : 'BORDER SECTOR POST'}</div>
        <h2 className="mt-1 text-xl font-bold text-white">{admin ? 'Admin Command' : 'Ground Officer'}</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {admin ? 'Full multi-sector surveillance, incident review, health diagnostics, and evidentiary proof verification.' : 'Sector camera telemetry, alert acknowledgment, field evidence recording, and incident escalation.'}
        </p>
      </div>
      <button
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        data-testid={`button-enter-role-${mode}`}
        onClick={(event) => { event.stopPropagation(); onEnter(); }}
      >
        Enter Station <ArrowRight size={14} />
      </button>
    </div>
  );
}


function waitForIceGathering(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', done);
        resolve();
      }
    };
    pc.addEventListener('icegatheringstatechange', done);
    window.setTimeout(() => { pc.removeEventListener('icegatheringstatechange', done); resolve(); }, 5000);
  });
}

function PhoneLive() {
  const [code, setCode] = useState('');
  const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState('Creating secure local room…');
  const [mode, setMode] = useState<'visible' | 'night' | 'thermal'>('visible');
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/signal-api/api/phone/session', { method: 'POST' })
      .then((r) => r.json())
      .then((data) => { if (!cancelled) { setCode(data.code); setStatus('Waiting for phone camera…'); } })
      .catch(() => setStatus('Could not create local phone session'));
    return () => { cancelled = true; pcRef.current?.close(); };
  }, []);

  useEffect(() => {
    if (!code || offer || remoteStream) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await fetch(`/signal-api/api/phone/session/${code}`);
        if (r.ok) {
          const data = await r.json();
          if (data.offer && !cancelled) setOffer(data.offer);
        }
      } catch { }
    };
    const id = window.setInterval(poll, 900);
    poll();
    return () => { cancelled = true; window.clearInterval(id); };
  }, [code, offer, remoteStream]);

  useEffect(() => {
    if (!code || !offer || pcRef.current) return;
    const pc = new RTCPeerConnection({ iceServers: [] });
    pcRef.current = pc;
    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      setRemoteStream(stream);
      setStatus('Phone live stream connected · local YOLO active');
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setStatus('Phone live stream connected');
      if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) setStatus(`Phone link ${pc.connectionState}`);
    };
    (async () => {
      try {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await waitForIceGathering(pc);
        const local = pc.localDescription;
        if (!local) throw new Error('No WebRTC answer generated');
        const r = await fetch(`/signal-api/api/phone/session/${code}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: local.type, sdp: local.sdp }) });
        if (!r.ok) throw new Error('Could not send answer');
        setStatus('Answer sent · waiting for phone connection…');
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'WebRTC negotiation failed');
      }
    })();
    return () => { pc.close(); pcRef.current = null; };
  }, [code, offer]);

  const phoneUrl = `${window.location.protocol}//${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '<LAPTOP-IP>' : window.location.hostname}:5173/phone?code=${encodeURIComponent(code)}`;
  return (
    <>
      <PageHeader
        eyebrow="COMMAND CONSOLE · MOBILE SENSOR"
        title="Phone Live Camera"
        action={
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Radio size={13} className="animate-pulse" /> LOCAL WEBRTC
          </span>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/80 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", remoteStream ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400 animate-ping")} />
              MOBILE SENSOR NODE · {remoteStream ? 'TRANSMITTING' : 'SEARCHING PEER'}
            </span>
            <span className="font-mono text-[11px] text-slate-400">{mode === 'visible' ? 'OPTICAL SPECTRUM' : mode === 'night' ? 'NIGHT VISION' : 'IR PALETTE'}</span>
          </div>
          <CameraFeed stream={remoteStream} night={mode === 'night'} thermal={mode === 'thermal'} aiEnabled className="min-h-[440px] h-[520px]" />
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-slate-950/60 p-4">
            {([['visible', 'Visible Spectrum', Video], ['night', 'Night Vision', Moon], ['thermal', 'Thermal IR', Crosshair]] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all',
                  mode === value
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">PAIR MOBILE DEVICE</div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Open the phone transmission page on your mobile device (connected to the same Wi-Fi) and enter the pairing room code.
            </p>
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center shadow-inner">
              <div className="text-[10px] font-semibold tracking-widest text-emerald-400 uppercase">ROOM CODE</div>
              <div className="mt-1 font-mono text-4xl font-extrabold tracking-widest text-white">{code || '------'}</div>
            </div>
            <div className="mt-4 break-all rounded-lg border border-white/10 bg-slate-950/60 p-3 font-mono text-[11px] text-slate-400 select-all">
              {phoneUrl}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all"
                onClick={() => navigator.clipboard?.writeText(phoneUrl)}
              >
                <Check size={13} /> Copy Pair Link
              </button>
              {window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
                <a
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  href={phoneUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowRight size={13} /> Open Tab
                </a>
              )}
            </div>
            <div className="mt-4 text-[11px] text-slate-500 leading-relaxed">
              *If running locally, replace &lt;LAPTOP-IP&gt; with the LAN address shown in your terminal.
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {status}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">NIGHT &amp; THERMAL EMULATION</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Night mode applies gamma boost, contrast equalization, and low-light amplification before feeding frames to local YOLO edge inference. Thermal mode renders a spectral false-color gradient for rapid heat-silhouette differentiation.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

function PhoneSender() {
  const [code, setCode] = useState(new URLSearchParams(window.location.search).get('code')?.toUpperCase() ?? '');
  const [status, setStatus] = useState('Enter the room code from the command station');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'visible' | 'night' | 'thermal'>('visible');
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => () => { pcRef.current?.close(); stream?.getTracks().forEach((track) => track.stop()); }, [stream]);

  const start = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) { setStatus('Enter a room code first'); return; }
    try {
      setStatus('Requesting phone camera…');
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('Camera requires HTTPS. Open the phone page using the secure LAN URL.');
      if (stream) stream.getTracks().forEach((track) => track.stop());
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      setStream(media);
      if (videoRef.current) { videoRef.current.srcObject = media; await videoRef.current.play().catch(() => { }); }
      const pc = new RTCPeerConnection({ iceServers: [] });
      pcRef.current = pc;
      media.getTracks().forEach((track) => pc.addTrack(track, media));
      pc.onconnectionstatechange = () => { if (pc.connectionState === 'connected') setStatus('LIVE · phone camera connected'); if (['failed', 'disconnected'].includes(pc.connectionState)) setStatus(`Link ${pc.connectionState} · keep both devices on the same Wi-Fi`); };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);
      const local = pc.localDescription;
      if (!local) throw new Error('Could not create WebRTC offer');
      const posted = await fetch(`/signal-api/api/phone/session/${normalized}/offer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: local.type, sdp: local.sdp }) });
      if (!posted.ok) throw new Error('Room not found or expired');
      setStatus('Offer sent · waiting for command station…');
      const poll = window.setInterval(async () => {
        try {
          const r = await fetch(`/signal-api/api/phone/session/${normalized}`);
          if (!r.ok) return;
          const data = await r.json();
          if (data.answer) {
            window.clearInterval(poll);
            await pc.setRemoteDescription(data.answer);
            setStatus('LIVE · sending camera to command station');
          }
        } catch { }
      }, 800);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not start phone camera');
    }
  };

  const filter = mode === 'thermal' ? 'camera-recording-thermal' : mode === 'night' ? 'camera-recording-night' : '';
  return (
    <div className="min-h-[100dvh] bg-[#070b10] p-4 text-slate-100 sm:p-8 flex flex-col justify-center">
      <div className="mx-auto max-w-2xl w-full">
        <Wordmark light />
        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl mt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Mobile Tactical Sensor</div>
          <h1 className="mt-1 text-2xl font-bold text-white">Phone Live Camera Transmitter</h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Keep this interface active in the foreground while transmitting. Point the rear camera toward the surveillance field.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              className="field-input font-mono tracking-wider uppercase text-base"
              placeholder="ENTER ROOM CODE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all"
              onClick={start}
            >
              <Radio size={15} /> Start Transmission
            </button>
          </div>
          <div className="mt-5 relative overflow-hidden rounded-xl border border-white/10 bg-black aspect-video">
            <video ref={videoRef} muted playsInline className={cn('w-full h-full object-cover', filter)} />
            {!stream && (
              <div className="absolute inset-0 grid place-items-center p-8 text-center text-xs text-slate-500">
                Camera viewfinder preview will display here once camera permission is authorized.
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {([['visible', 'Visible'], ['night', 'Night Vision'], ['thermal', 'Thermal IR']] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-xs font-medium border transition-all',
                  mode === value
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/5 bg-slate-800 text-slate-400 hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 font-mono text-xs text-emerald-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {status}
          </div>
        </section>
      </div>
    </div>
  );
}

function OfficerPresencePanel() {
  const [presence, setPresence] = useState<OfficerPresence | null>(null);
  const refresh = async () => {
    try {
      const response = await fetch('/signal-api/api/officer/presence', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data.presence) { setPresence(data.presence); return; }
      }
    } catch { }
    try { const raw = localStorage.getItem(OFFICER_PRESENCE_KEY); setPresence(raw ? JSON.parse(raw) : null); } catch { setPresence(null); }
  };
  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 1000);
    const onStorage = (event: StorageEvent) => { if (event.key === OFFICER_PRESENCE_KEY) refresh(); };
    window.addEventListener('storage', onStorage);
    return () => { window.clearInterval(timer); window.removeEventListener('storage', onStorage); };
  }, []);
  const online = Boolean(presence?.online && presence.lastSeen && Date.now() - presence.lastSeen < 12000);
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/80 px-6 py-4">
        <div>
          <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
            <Eye size={13} /> FIELD OFFICER TELEMETRY
          </div>
          <h2 className="mt-0.5 text-sm font-semibold text-white">Ground Unit Operational Visibility</h2>
        </div>
        <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border', online ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-800 text-slate-400')}>
          <span className={cn('h-2 w-2 rounded-full', online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500')} />
          {online ? 'OFFICER ACTIVE IN SECTOR' : 'STANDBY · NO ACTIVE SESSION'}
        </span>
      </div>
      <div className="p-6">
        {online ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Field Operator</div>
              <div className="mt-1 text-sm font-semibold text-white">{presence?.name}</div>
              <div className="mt-0.5 text-xs text-slate-400">{presence?.role}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Current Activity</div>
              <div className="mt-1 text-sm font-semibold text-white">{presence?.activity}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Active Sector Node</div>
              <div className="mt-1 font-mono text-xs text-emerald-400">{presence?.camera || presence?.path}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Heartbeat</div>
              <div className="mt-1 font-mono text-xs text-emerald-400">
                {presence?.lastSeen ? `${Math.max(0, Math.round((Date.now() - presence.lastSeen) / 1000))}s ago` : 'Active'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              No active forward field operator session detected in local cluster.
            </span>
            <Link href="/officer" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Open Field Officer Station →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function AdminOverview() {
  const [, setLocation] = useLocation();
  const onlineCameras = cameras.filter((c) => c.status === 'Online').length;
  const criticalCount = incidents.filter((i) => i.severity === 'Critical').length;

  return (
    <>
      {/* Status Ribbon */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-5 py-3 text-xs backdrop-blur-md shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            GRID COP: SECTOR 43R-VQ
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300">Active Sensors: <strong className="text-white font-semibold">{cameras.length} Nodes</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300">Edge AI: <strong className="text-emerald-400 font-semibold">Ultralytics YOLOv11 Operational</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
            DEFCON 2 · ELEVATED VIGIL
          </span>
        </div>
      </div>

      <PageHeader
        eyebrow="C4ISR BORDER INTELLIGENCE · ORBAT COP"
        title="Tactical Command Overview"
        action={
          <div className="flex flex-wrap gap-2.5">
            <Button kind="secondary" testId="button-system-telemetry" onClick={() => { appendTacticalLog('Opened telemetry log'); setLocation('/admin/health'); }}>
              <SlidersHorizontal size={14} /> Telemetry Log
            </Button>
            <Button kind="primary" testId="button-open-command-map" onClick={() => setLocation('/admin/map')}>
              <MapIcon size={14} /> Full Radar Map
            </Button>
          </div>
        }
      />

      <div className="overview-kpi-row">
        <Metric
          label="Active Incident Alerts"
          value={String(incidents.length).padStart(2, '0')}
          detail={`${criticalCount} critical severity · forward command triage`}
          tone="alert"
          icon={AlertTriangle}
        />
        <Metric
          label="Active Sensor Mesh"
          value={`${onlineCameras} / ${cameras.length}`}
          detail={`${Math.round((onlineCameras / cameras.length) * 100)}% optical & thermal nodes reporting nominal`}
          tone="good"
          icon={Camera}
        />
      </div>

      <OfficerPresencePanel />

      {/* Main Radar Map & Threat Queue */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.95fr]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/80 px-6 py-4">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                <Crosshair size={13} /> GEOSPATIAL INTELLIGENCE
              </div>
              <h2 className="mt-0.5 text-sm font-semibold text-white">Border Sensor Network Radar Frame</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" /> 8 Border Sectors
              </span>
              <Link href="/admin/map" data-testid="link-view-full-map" className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Expand Radar HUD <ArrowRight size={13} className="ml-1 inline" />
              </Link>
            </div>
          </div>
          <IndiaMap embedded onCamera={(id) => setLocation(`/admin/cameras/${id}`)} />
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-6 py-4">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                <Flag size={13} /> COMMAND ATTENTION
              </div>
              <h2 className="mt-0.5 text-sm font-semibold text-white">Priority Threat Queue</h2>
            </div>
            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-rose-400">
              {incidents.length} ELEVATED
            </span>
          </div>
          <div className="divide-y divide-white/5 flex-1">
            {incidents.slice(0, 5).map((incident) => (
              <Link
                href={`/admin/incidents?focus=${incident.id}`}
                key={incident.id}
                data-testid={`row-priority-${incident.id}`}
                className="block px-6 py-4 transition-all hover:bg-slate-800/40 border-l-2 border-transparent hover:border-l-emerald-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={cn('severity', `severity-${incident.severity.toLowerCase()}`)}>
                    {incident.severity} · THREAT
                  </span>
                  <span className="font-mono text-xs text-slate-400">{incident.time}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{incident.title}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{incident.sector} Sector · {incident.camera}</span>
                  <span className="rounded border border-white/10 bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-emerald-400">{incident.state}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-white/10 bg-slate-950/40 p-3.5 text-center">
            <Link href="/admin/incidents" className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              View All Incident Records ({incidents.length} Total) <ArrowRight size={13} className="ml-1.5 inline" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function AdminMap() {
  const [, setLocation] = useLocation();
  const [sector, setSector] = useState('All sectors');
  const [selected, setSelected] = useState('');
  const sectors = ['All sectors', ...Array.from(new Set(cameras.map((camera) => camera.sector)))];
  const camera = cameras.find((item) => item.id === selected);

  return (
    <>
      <PageHeader
        eyebrow="COMMAND CONSOLE · GEOSPATIAL"
        title="Operations Map"
        action={
          <div className="flex gap-2">
            <Button kind="secondary" testId="button-recenter-map" onClick={() => setSelected('')}>
              <Target size={14} /> Recenter
            </Button>
            <Button kind="primary" testId="button-map-export" onClick={() => { appendTacticalLog('Exported operations map view'); exportCsv(`prahari-map-${Date.now()}.csv`, [['Camera', 'Sector', 'Site', 'Status', 'Health'], ...cameras.map(c => [c.id, c.sector, c.site, c.status, String(c.health)])]); }}>
              <Download size={14} /> Export View
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-md shadow-xl overflow-hidden">
          <IndiaMap sector={sector} onCamera={setSelected} />
        </div>
        <aside className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">FILTER NETWORK</div>
            <label className="block mt-4 text-xs font-medium text-slate-300">
              Surveillance Sector
              <select className="field-input mt-1.5" data-testid="select-map-sector" value={sector} onChange={(event) => setSector(event.target.value)}>
                {sectors.map((item) => <option key={item} value={item} className="bg-slate-900 text-white">{item}</option>)}
              </select>
            </label>

            <div className="my-6 border-y border-white/5 py-5">
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-3">NODE TELEMETRY STATUS</div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2"><StatusDot /> Operational</span>
                  <span className="font-mono text-slate-400 font-semibold">09</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2"><StatusDot status="Degraded" /> Degraded Uplink</span>
                  <span className="font-mono text-slate-400 font-semibold">02</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2"><StatusDot status="Offline" /> Offline Node</span>
                  <span className="font-mono text-slate-400 font-semibold">01</span>
                </div>
              </div>
            </div>

            {camera ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-emerald-400">{camera.id}</span>
                  <StatusDot status={camera.status} />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{camera.site}</h3>
                <p className="mt-0.5 text-xs text-slate-400">{camera.sector} Sector</p>
                <button
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  data-testid="button-open-selected-camera"
                  onClick={() => setLocation(`/admin/cameras/${camera.id}`)}
                >
                  Inspect Camera Feed <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              <div className="empty-state py-8 text-center text-xs text-slate-500">
                <MapIcon size={24} className="mx-auto mb-2 opacity-50" />
                <p>Select any sensor node on the radar HUD to view sector context.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function AdminCameras() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const filtered = cameras.filter((camera) => (filter === 'All' || camera.status === filter) && `${camera.id} ${camera.sector} ${camera.site}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow="COMMAND CONSOLE · SENSOR NETWORK"
        title="Camera Mesh Explorer"
        action={
          <Button kind="secondary" testId="button-camera-refresh" onClick={() => { appendTacticalLog('Refreshed camera mesh'); window.location.reload(); }}>
            <RefreshCw size={14} /> Refresh Mesh
          </Button>
        }
      />
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5 bg-slate-900/80">
          <label className="relative block min-w-[260px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              data-testid="input-camera-search"
              className="field-input !pl-10"
              placeholder="Search by node ID, sector, or outpost site…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="flex gap-1.5 rounded-lg border border-white/5 bg-slate-950/50 p-1">
            {['All', 'Online', 'Degraded', 'Offline'].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  filter === item
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((camera) => (
            <button
              key={camera.id}
              onClick={() => setLocation(`/admin/cameras/${camera.id}`)}
              className="rounded-xl border border-white/10 bg-slate-950/50 overflow-hidden text-left hover:border-emerald-500/40 hover:shadow-lg transition-all group"
            >
              <div className="relative aspect-video bg-black">
                <CameraFeed cameraId={camera.id} preview className="pointer-events-none h-full w-full object-cover" />
                <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/80 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {camera.status}
                </span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-mono text-xs text-emerald-400 font-semibold">{camera.id}</div>
                    <h3 className="mt-0.5 text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">{camera.site}</h3>
                  </div>
                  <StatusDot status={camera.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function CameraDetail() {
  const { id } = useParams<{ id: string }>();
  const camera = cameras.find((item) => item.id === id) ?? cameras[0];
  const [, setLocation] = useLocation();
  const [thermal, setThermal] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [note, setNote] = useState('');

  return (
    <>
      <PageHeader
        eyebrow={`CAMERA NODE · ${camera.id}`}
        title={camera.site}
        action={
          <div className="flex gap-2.5">
            <Button kind="secondary" testId="button-camera-back" onClick={() => setLocation('/admin/cameras')}>
              <ArrowLeft size={14} /> All Cameras
            </Button>
            <Button kind="primary" testId="button-create-incident" onClick={() => { appendTacticalLog(`Created incident from ${camera.id}`, camera.sector); setNote('Incident record created from camera context. Added to local tactical log.'); }}>
              Create Incident <Flag size={14} />
            </Button>
          </div>
        }
      />
      {note && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-xs text-emerald-300">
          <span>{note}</span>
          <button onClick={() => setNote('')} className="text-emerald-400 hover:text-white"><X size={15} /></button>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/80 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                {camera.id} · {thermal ? 'THERMAL IR PALETTE' : 'OPTICAL CCTV'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">EDGE RECORDING · AI ACTIVE</span>
            </div>
            <CameraFeed cameraId={camera.id} thermal={thermal} aiEnabled={aiEnabled} className="min-h-[440px] h-[480px] xl:h-[520px]" />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/60 px-5 py-3.5 text-slate-300">
              <div className="flex gap-2">
                <button
                  onClick={() => setThermal(false)}
                  className={cn('inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all border', !thermal ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-white/5 bg-slate-800 text-slate-400 hover:text-white')}
                >
                  <Video size={14} /> Visible CCTV
                </button>
                <button
                  onClick={() => setThermal(true)}
                  className={cn('inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all border', thermal ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-white/5 bg-slate-800 text-slate-400 hover:text-white')}
                >
                  <Crosshair size={14} /> Thermal IR
                </button>
                <button
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={cn('inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all border', aiEnabled ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300' : 'border-white/5 bg-slate-800 text-slate-400 hover:text-white')}
                >
                  {aiEnabled ? 'AI Overlay Active' : 'AI Overlay Muted'}
                </button>
              </div>
              <span className="font-mono text-xs text-slate-400">FPS: 30 · INTEL ON-DEVICE</span>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
            <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
              <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">EVENT TIMELINE</div>
              <h2 className="mt-0.5 text-sm font-semibold text-white">Detection &amp; Operator Activity</h2>
            </div>
            <div className="timeline p-6">
              {[
                ['14:32:19', 'AI Detection', 'Person class detected above 90% confidence threshold', 'AI ENGINE'],
                ['14:31:58', 'AI Detection', 'Vehicle class entered geofence boundary corridor', 'AI ENGINE'],
                ['14:30:44', 'Heartbeat Sync', 'Node reported nominal operational health at 98%', 'SYSTEM'],
                ['13:48:10', 'Operator Session', 'Camera context opened in command workspace', 'COMMAND'],
              ].map(([time, title, text, actor]) => (
                <div className="timeline-item" key={time}>
                  <span className="timeline-dot" />
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-xs font-semibold text-white">{title}</span>
                    <span className="font-mono text-[11px] text-slate-400">{time} · {actor}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
            <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
              <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">NODE METADATA</div>
              <h2 className="mt-0.5 text-sm font-semibold text-white">Security &amp; Connectivity</h2>
            </div>
            <div className="divide-y divide-white/5">
              {[
                ['Status', `${camera.status} · Connected`],
                ['Sensor Protocol', cameraRecordings[camera.id]?.visible.endsWith('.png') ? 'FLIR Thermal Recon Stills' : 'H.264 Tactical Stream'],
                ['AI Target Model', 'Ultralytics YOLOv11n (Local CPU)'],
                ['Frame Sampling', '640x640 Adaptive Coordinate Grid'],
                ['Sector Boundary', `${camera.sector} Sector`],
                ['Outpost Location', camera.site],
              ].map(([key, value]) => (
                <div key={key} className="flex justify-between gap-3 px-6 py-3 text-xs">
                  <span className="text-slate-400">{key}</span>
                  <span className="max-w-[60%] text-right font-medium text-white break-all">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">AI ACTIVITY</div>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-extrabold text-white">{camera.detections}</span>
              <span className="text-xs text-slate-400">detections / 24h</span>
            </div>
            <div className="mini-bars mt-5">
              {[25, 42, 31, 55, 42, 68, 48, 72, 63, 86, 54, 78].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <Link href="/admin/evidence" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Inspect Linked Evidence <ArrowRight size={13} />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}

function AdminIncidents() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('All');
  const [tick, setTick] = useState(Date.now());
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { const id = window.setInterval(() => setTick(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const liveIncidents = incidents.map((item, index) => ({ ...item, liveTime: liveEventTime([1, 7, 18, 31, 126][index]) }));
  const q = query.trim().toLowerCase();
  const filtered = liveIncidents.filter((item) => (severity === 'All' || item.severity === severity) && (!q || `${item.id} ${item.title} ${item.sector} ${item.camera} ${item.kind} ${item.state} ${item.evidence}`.toLowerCase().includes(q)));
  const localLogs = readTacticalLogs().slice(0, 8);
  void tick;

  return (
    <>
      <PageHeader
        eyebrow="COMMAND CONSOLE · INCIDENT MANAGEMENT"
        title="Incident Timeline &amp; Triage"
        action={
          <Button kind="secondary" testId="button-export-incidents" onClick={() => { appendTacticalLog('Exported incident log'); exportCsv(`prahari-incidents-${Date.now()}.csv`, [['ID', 'Time', 'Sector', 'Title', 'Severity', 'Camera', 'State', 'Evidence', 'Kind'], ...liveIncidents.map(i => [i.id, i.liveTime, i.sector, i.title, i.severity, i.camera, i.state, i.evidence, i.kind]), ...localLogs.map(l => [l.id, new Date(l.at).toLocaleTimeString('en-IN'), l.context, l.action, 'INFO', '-', '-', '-', 'TACTICAL LOG'])]); }}>
            <Download size={14} /> Export Log
          </Button>
        }
      />
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap gap-4 border-b border-white/10 p-5 bg-slate-900/80">
          <label className="relative min-w-[260px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="field-input !pl-10 !pr-10"
              data-testid="input-incident-search"
              placeholder="Search by ID, title, camera node, sector, threat class…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>
          <select
            className="field-input w-auto font-medium"
            data-testid="select-incident-severity"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((value) => (
              <option key={value} value={value} className="bg-slate-900 text-white">{value} Severity</option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-5 hover:bg-slate-800/30 transition-all relative group" data-testid={`row-incident-${item.id}`}>
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="hidden w-16 shrink-0 pt-0.5 text-right font-mono text-xs text-slate-400 sm:block">
                  {item.liveTime}
                </div>
                <div className="w-1 self-stretch rounded-full bg-slate-800 group-hover:bg-emerald-400 transition-colors" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-emerald-400">{item.id}</span>
                    <span className={cn('severity', `severity-${item.severity.toLowerCase()}`)}>
                      {item.severity}
                    </span>
                    <span className="rounded-md border border-white/10 bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                      {item.state}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {item.sector} Sector · {item.camera} · Classification: {item.kind}
                  </p>
                </div>
              </div>

              <div className="hidden items-end gap-2 text-right md:flex md:flex-col pr-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <ShieldCheck size={14} /> {item.evidence}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">SEALED ON EDGE</span>
              </div>

              <button
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                data-testid={`button-incident-menu-${item.id}`}
                onClick={() => setSelected(selected === item.id ? null : item.id)}
                aria-label={`Open actions for ${item.id}`}
              >
                <MoreHorizontal size={18} />
              </button>

              {selected === item.id && (
                <div className="absolute right-6 top-14 z-30 w-52 rounded-xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
                  <button className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors" onClick={() => { appendTacticalLog(`Opened incident ${item.id}`); setSelected(null); }}>
                    Open Incident Context
                  </button>
                  <button className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors" onClick={() => { appendTacticalLog(`Acknowledged ${item.id}`); setSelected(null); }}>
                    Acknowledge Threat
                  </button>
                  <button className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors" onClick={() => { appendTacticalLog(`Escalated ${item.id}`); setSelected(null); }}>
                    Escalate to Command
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!filtered.length && (
          <div className="empty-state m-8 py-10 text-center text-xs text-slate-400">
            <Search size={24} className="mx-auto mb-2 opacity-50" />
            <p>No incidents match the active filter criteria.</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700" onClick={() => { setQuery(''); setSeverity('All'); }}>
              Clear Filters
            </button>
          </div>
        )}
        <div className="border-t border-white/10 bg-slate-950/40 px-6 py-3 font-mono text-[11px] text-slate-400 flex items-center justify-between">
          <span>LIVE INCIDENT FEED · {nowISTDateTime()} IST</span>
          <span>{filtered.length} MATCHING RECORDS</span>
        </div>
      </div>
    </>
  );
}

function AdminEvidence() {
  const [tampered, setTampered] = useState(false);
  const [verified, setVerified] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="ASSURANCE · PROVENANCE"
        title="Evidence Vault &amp; Chain of Custody"
        action={
          <Button kind="secondary" testId="button-export-evidence" onClick={() => { appendTacticalLog('Exported evidence manifest', 'Evidence Vault'); exportCsv(`prahari-evidence-${Date.now()}.csv`, [['Evidence ID', 'Node', 'State'], ['EV-2417-A', 'PN-LAD-04', 'Verified'], ['EV-2416-B', 'PN-RAJ-02', 'Verified'], ['EV-2415-A', 'PN-ARP-08', 'Pending'], ['EV-2409-C', 'PN-GUJ-06', 'Compromised record']]); }}>
            <Download size={14} /> Export Manifest
          </Button>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 shadow-lg">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
        <div className="leading-relaxed">
          <strong className="text-white">Controlled Tamper Demonstration.</strong> The record below can be toggled to demonstrate cryptographic chain-break alerting. SHA-256 digests and Ed25519 signatures are verified locally within this air-gapped instance.
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
          <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">OBJECT MANIFEST · 05 RECORDS</div>
              <h2 className="mt-0.5 text-sm font-semibold text-white">Cryptographically Sealed Evidence</h2>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {[
              ['EV-2417-A', 'PN-LAD-04', '18 Jun · 14:32:21', 'Verified'],
              ['EV-2416-B', 'PN-RAJ-02', '18 Jun · 13:48:09', 'Verified'],
              ['EV-2415-A', 'PN-ARP-08', '18 Jun · 12:06:44', 'Pending'],
              ['EV-2409-C', 'PN-GUJ-06', '17 Jun · 08:11:02', tampered ? 'Tampered' : 'Compromised record'],
            ].map(([id, node, time, state]) => (
              <div className="flex flex-wrap items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors" key={id}>
                <span className={cn('grid h-9 w-9 place-items-center rounded-lg border', state === 'Tampered' || state === 'Compromised record' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400')}>
                  <FileKey2 size={16} />
                </span>
                <div className="min-w-[140px] flex-1">
                  <div className="font-mono text-xs font-semibold text-white">{id}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{node} · {time}</div>
                </div>
                <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', state === 'Verified' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : state === 'Pending' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400')}>
                  {state}
                </span>
                <button
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  data-testid={`button-verify-${id}`}
                  onClick={() => setVerified(true)}
                >
                  Verify Digest <Check size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">VERIFICATION RESULT</div>
            <div className={cn('mt-4 flex items-center gap-3.5 rounded-xl border p-4 transition-all', tampered ? 'border-rose-500/40 bg-rose-500/10' : 'border-emerald-500/30 bg-emerald-500/10')}>
              <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', tampered ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950')}>
                {tampered ? <X size={20} /> : <BadgeCheck size={20} />}
              </span>
              <div>
                <div className="text-sm font-bold text-white">{tampered ? 'Chain Break Detected' : 'Cryptographic Chain Verified'}</div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {verified ? 'EV-2417-A hash checked and matched.' : tampered ? 'EV-2409-C digest does not match its block header.' : 'Continuous verification active · 14:35:08 IST'}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              {[
                ['SHA-256 Digest', tampered ? 'MISMATCH' : 'MATCHED'],
                ['Operator Signature', 'Ed25519 · VALID'],
                ['Device Certificate', 'PN-CAM-04 · VALID'],
                ['mTLS Session', 'ESTABLISHED'],
                ['RBAC Custody Record', '2-OF-2 CONFIRMED'],
              ].map(([label, value]) => (
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5" key={label}>
                  <span className="text-slate-400">{label}</span>
                  <span className={cn('font-mono font-semibold', tampered && label === 'SHA-256 Digest' ? 'text-rose-400' : 'text-emerald-400')}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">INTEGRITY SIMULATION</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Trigger a simulated tamper event on recorded object EV-2409-C to audit how automated cryptographic alerts notify command.
            </p>
            <button
              className={cn(
                'mt-5 w-full rounded-xl border px-4 py-3 text-xs font-semibold shadow-lg transition-all',
                tampered
                  ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'border-rose-500/40 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
              )}
              data-testid="button-controlled-tamper"
              onClick={() => { setTampered(!tampered); setVerified(false); }}
            >
              {tampered ? 'Restore Verified Chain State' : 'Simulate Tamper on EV-2409-C'}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

function AdminAnalytics() {
  const [windowSize, setWindowSize] = useState('24 hours');

  return (
    <>
      <PageHeader
        eyebrow="ASSURANCE · PATTERN REVIEW"
        title="Operational Analytics"
        action={
          <select
            className="field-input w-auto font-medium"
            data-testid="select-analytics-window"
            value={windowSize}
            onChange={(event) => setWindowSize(event.target.value)}
          >
            {['24 hours', '7 days', '30 days'].map((value) => (
              <option key={value} value={value} className="bg-slate-900 text-white">Window: {value}</option>
            ))}
          </select>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Events Reviewed" value="126" detail={`Window · ${windowSize}`} icon={Eye} />
        <Metric label="Triage Rate" value="83.6%" detail="105 of 126 incidents closed" tone="good" icon={CheckCircle2} />
        <Metric label="Median Confidence" value="88.4%" detail="Across person &amp; vehicle classes" icon={Sparkles} />
        <Metric label="Detection Precision" value="76.1%" detail="Verified ground truth rate" tone="good" icon={Target} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">EVENT TREND · {windowSize.toUpperCase()}</div>
                <h2 className="mt-1 text-base font-semibold text-white">Detection Volume</h2>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">+18.2% vs prev</span>
            </div>
            <div className="line-chart mt-8 h-40">
              <div className="chart-lines" />
              {[32, 44, 40, 58, 49, 73, 62, 82, 66, 91, 77, 84, 72, 94].map((height, i) => (
                <span key={i} style={{ height: `${height}%` }}><i /></span>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-between font-mono text-[10px] text-slate-500 border-t border-white/5 pt-3">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
          <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">SECTOR BREAKDOWN</div>
            <h2 className="mt-0.5 text-sm font-semibold text-white">Events by Sector</h2>
          </div>
          <div className="space-y-4 p-6">
            {[
              ['Ladakh / Northern', '38', 86],
              ['Rajasthan / Western', '27', 66],
              ['Punjab / Border', '18', 51],
              ['Arunachal Pradesh / Eastern', '16', 44],
              ['Other Outposts', '27', 67],
            ].map(([label, value, width]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{label}</span>
                  <span className="font-mono text-emerald-400 font-semibold">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
          <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">SENSOR UPTIME MATRIX</div>
          <h2 className="mt-1 text-base font-semibold text-white">Camera Availability Grid</h2>
          <div className="mt-6 grid grid-cols-6 gap-3">
            {cameras.map((camera) => (
              <div key={camera.id} className="text-center">
                <div
                  className={cn(
                    'h-10 rounded-lg transition-all shadow-sm',
                    camera.status === 'Online'
                      ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : camera.status === 'Degraded'
                      ? 'bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                  )}
                />
                <div className="mt-2 truncate font-mono text-[10px] text-slate-400">{camera.id.replace('PN-', '')}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
          <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">CONFIDENCE DISTRIBUTION</div>
          <h2 className="mt-1 text-base font-semibold text-white">AI Detection Confidence Bands</h2>
          <div className="mt-6 space-y-4">
            {[
              ['High Confidence (90–100%)', '68%', 'w-[68%]', 'bg-emerald-400'],
              ['Review Band (70–89%)', '24%', 'w-[24%]', 'bg-amber-400'],
              ['Low Confidence (Below 70%)', '08%', 'w-[8%]', 'bg-rose-400'],
            ].map(([label, value, width, colorClass]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{label}</span>
                  <span className="font-mono text-white font-semibold">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={cn('h-full rounded-full', colorClass, width)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function AdminHealth() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [checks, setChecks] = useState<Array<{ label: string; value: string; detail: string; tone: 'good' | 'warn' | 'bad'; Icon: typeof Activity }>>([
    { label: 'Camera Mesh', value: 'CHECKING', detail: 'Testing local recording assets…', tone: 'warn', Icon: Wifi },
    { label: 'AI Inference', value: 'CHECKING', detail: 'Contacting local YOLO service…', tone: 'warn', Icon: Sparkles },
    { label: 'API Relay', value: 'CHECKING', detail: 'Contacting local backend…', tone: 'warn', Icon: Network },
    { label: 'Evidence Storage', value: 'CHECKING', detail: 'Reading browser-local storage…', tone: 'warn', Icon: Database },
    { label: 'Browser Network', value: navigator.onLine ? 'ONLINE' : 'OFFLINE', detail: navigator.onLine ? 'Browser reports network connectivity.' : 'Browser reports offline mode.', tone: navigator.onLine ? 'good' : 'bad', Icon: navigator.onLine ? Wifi : WifiOff },
  ]);
  const [latency, setLatency] = useState<number | null>(null);

  const runChecks = async () => {
    setRefreshing(true);
    const started = performance.now();
    const recordingResults = await Promise.all(cameras.map(async (camera) => {
      const src = cameraRecordings[camera.id]?.visible;
      try { const r = await fetch(src, { method: 'HEAD', cache: 'no-store' }); return r.ok; } catch { return false; }
    }));
    let aiOk = false, aiDetail = 'YOLO service unreachable';
    try { const r = await fetch('/ai-api/health', { cache: 'no-store' }); const data = await r.json(); aiOk = r.ok && data.status === 'ok'; aiDetail = aiOk ? `YOLO ${data.model} loaded · local CPU endpoint` : `AI endpoint HTTP ${r.status}`; } catch { aiDetail = 'AI service unreachable at 127.0.0.1:8000'; }
    let apiOk = false, apiDetail = 'Backend unreachable';
    try { const r = await fetch('/signal-api/api/system-health', { cache: 'no-store' }); const data = await r.json(); apiOk = r.ok && data.status === 'ok'; apiDetail = apiOk ? `PID ${data.pid} · uptime ${Math.round(data.uptime)}s · Node ${data.node}` : `Backend HTTP ${r.status}`; } catch { apiDetail = 'Backend unreachable at 127.0.0.1:3000'; }
    let storageBytes = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) ?? ''; storageBytes += (k.length + (localStorage.getItem(k) ?? '').length) * 2; } } catch { }
    const meshOk = recordingResults.filter(Boolean).length;
    const storageDetail = `${(storageBytes / 1024).toFixed(1)} KB currently used by local browser storage`;
    const elapsed = Math.round(performance.now() - started);
    setLatency(elapsed);
    setChecks([
      { label: 'Camera Mesh', value: `${meshOk} / ${cameras.length}`, detail: `${recordingResults.filter(Boolean).length} local recording assets reachable`, tone: meshOk === cameras.length ? 'good' : meshOk > 0 ? 'warn' : 'bad', Icon: Wifi },
      { label: 'AI Inference', value: aiOk ? 'OPERATIONAL' : 'OFFLINE', detail: aiDetail, tone: aiOk ? 'good' : 'bad', Icon: Sparkles },
      { label: 'API Relay', value: apiOk ? 'OPERATIONAL' : 'OFFLINE', detail: apiDetail, tone: apiOk ? 'good' : 'bad', Icon: Network },
      { label: 'Evidence Storage', value: `${(storageBytes / 1024).toFixed(1)} KB`, detail: storageDetail, tone: 'good', Icon: Database },
      { label: 'Browser Network', value: navigator.onLine ? 'ONLINE' : 'OFFLINE', detail: navigator.onLine ? 'Browser reports network connectivity.' : 'Browser reports offline mode.', tone: navigator.onLine ? 'good' : 'bad', Icon: navigator.onLine ? Wifi : WifiOff },
    ]);
    appendTacticalLog(`System health check completed in ${elapsed} ms`, 'System Health');
    setLastChecked(Date.now());
    setRefreshing(false);
  };

  useEffect(() => { runChecks(); }, []);

  return (
    <>
      <PageHeader
        eyebrow="CONTROL · HEALTH TELEMETRY"
        title="System Health &amp; Subsystem Telemetry"
        detail="Live diagnostics against browser state, local Vite assets, backend signal relay, and local YOLO engine."
        action={
          <Button kind="secondary" testId="button-refresh-health" onClick={runChecks} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Testing…' : 'Run Diagnostics'}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {checks.map(({ label, value, detail, tone, Icon }) => (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl flex items-start gap-4" key={label}>
            <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl border', tone === 'good' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : tone === 'warn' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400')}>
              <Icon size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">{label}</h2>
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border', tone === 'good' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : tone === 'warn' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400')}>
                  <StatusDot status={tone === 'good' ? 'Online' : tone === 'warn' ? 'Degraded' : 'Offline'} /> {value}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-5 py-3 font-mono text-xs text-emerald-400">
        <span>LAST DIAGNOSTIC CYCLE: {lastChecked ? new Date(lastChecked).toLocaleTimeString('en-IN') : 'RUNNING…'}</span>
        <span>LATENCY: {latency !== null ? `${latency} ms` : '—'}</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
          <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">TACTICAL DIAGNOSTIC HISTORY</div>
          <h2 className="mt-1 text-base font-semibold text-white">Recent Health Audits</h2>
          <div className="mt-5 space-y-3">
            {readTacticalLogs().filter(l => l.context === 'System Health').slice(0, 8).map(log => (
              <div className="flex items-center gap-3 text-xs" key={log.id}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="font-mono text-slate-400">{new Date(log.at).toLocaleTimeString('en-IN')}</span>
                <span className="text-slate-300">· {log.action}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
          <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">AUDIT SPECIFICATIONS</div>
          <h2 className="mt-1 text-base font-semibold text-white">Active Verification Vectors</h2>
          <div className="mt-4 space-y-2.5 text-xs text-slate-400 leading-relaxed">
            <p>• <strong className="text-slate-200">Camera Mesh:</strong> Validates HTTP HEAD reachable status for all MP4 camera streams.</p>
            <p>• <strong className="text-slate-200">AI Inference:</strong> Queries live FastAPI <code className="text-emerald-400">/health</code> endpoint and model weights state.</p>
            <p>• <strong className="text-slate-200">API Relay:</strong> Verifies Express signaling server PID, node version, and uptime.</p>
            <p>• <strong className="text-slate-200">Storage:</strong> Measures air-gapped cryptographic log byte consumption.</p>
          </div>
        </section>
      </div>
    </>
  );
}

function AdminAccess() {
  const [audit, setAudit] = useState(false);
  const users = [
    ['A. Srinivasan', 'Command Admin', 'Active', '18 Jun · 14:31'],
    ['R. Dorje', 'Ground Officer · G2', 'Active', '18 Jun · 14:28'],
    ['N. Chatterjee', 'Evidence Reviewer', 'Active', '17 Jun · 20:14'],
    ['S. Mehta', 'System Auditor', 'Suspended', '04 Jun · 11:02'],
  ];

  return (
    <>
      <PageHeader
        eyebrow="CONTROL · ROLE SEPARATION"
        title="Access Control &amp; RBAC Directory"
        action={
          <Button kind="primary" testId="button-invite-user" onClick={() => setAudit(true)}>
            <Users size={14} /> Simulate Invite
          </Button>
        }
      />
      {audit && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-xs text-emerald-300">
          <span>Operator invite flow staged locally in air-gapped simulation mode. No external network transmission occurred.</span>
          <button data-testid="button-dismiss-invite" onClick={() => setAudit(false)} className="text-emerald-400 hover:text-white"><X size={15} /></button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
          <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">IDENTITY DIRECTORY · 04 OPERATORS</div>
            <h2 className="mt-0.5 text-sm font-semibold text-white">Authorized System Operators</h2>
          </div>
          <div className="divide-y divide-white/5">
            {users.map(([name, role, status, seen], index) => (
              <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors" key={name}>
                <span className="avatar avatar-light">{name.split(' ').map((part) => part[0]).join('')}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{role} · Last active {seen}</div>
                </div>
                <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', status === 'Active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400')}>
                  {status}
                </span>
                <button className="text-slate-400 hover:text-white transition-colors" data-testid={`button-user-settings-${index}`} onClick={() => setAudit(true)}>
                  <Settings2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
          <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">PERMISSION MODEL</div>
            <h2 className="mt-0.5 text-sm font-semibold text-white">Role Boundaries &amp; Scopes</h2>
          </div>
          <div className="divide-y divide-white/5">
            {[
              ['Command Admin', 'All sectors', '14 permissions'],
              ['Evidence Reviewer', 'All sectors', '08 permissions'],
              ['Ground Officer · G2', 'Ladakh / North', '06 permissions'],
            ].map(([role, scope, count]) => (
              <div className="px-6 py-4" key={role}>
                <div className="flex justify-between text-xs font-semibold text-white">
                  <span>{role}</span>
                  <span className="font-mono text-emerald-400">{count}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">Assigned Scope: {scope}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded border border-white/10 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">READ</span>
                  <span className="rounded border border-white/10 bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">REVIEW</span>
                  {role.includes('Admin') && (
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">MANAGE ACCESS</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl mt-6">
        <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
          <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">IMMUTABLE LOCAL AUDIT TRAIL</div>
          <h2 className="mt-0.5 text-sm font-semibold text-white">Recent Operator Access Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Scope</th>
                <th>Hash Trace</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['14:31:08', 'A. Srinivasan', 'Opened incident INC-2417', 'Command', '7f2a…1d0c'],
                ['14:28:41', 'R. Dorje', 'Acknowledged alert ALT-034', 'Ladakh', '9a18…c441'],
                ['14:12:06', 'N. Chatterjee', 'Verified evidence EV-2416-B', 'Assurance', '4c90…ad12'],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, idx) => (
                    <td key={cell} className={idx === 0 || idx === 4 ? 'font-mono text-xs' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function OfficerHome() {
  const [, setLocation] = useLocation();
  return (
    <>
      <PageHeader
        eyebrow="FIELD CONSOLE · LADAKH / NORTH"
        title="Good afternoon, R. Dorje"
        action={
          <Button kind="primary" testId="button-open-officer-watch" onClick={() => setLocation('/officer/watch')}>
            <Video size={14} /> Open Camera Watch
          </Button>
        }
      />
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-xs text-emerald-300 shadow-lg">
        <ShieldCheck size={18} className="shrink-0 text-emerald-400" />
        <span>Assigned sector access active · 2 surveillance cameras reporting nominal · 1 threat alert requires acknowledgement</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Open Alerts" value="03" detail="1 high priority" tone="alert" icon={Bell} />
        <Metric label="Sector Cameras" value="02 / 02" detail="Both nodes online" tone="good" icon={Camera} />
        <Metric label="Evidence Staged" value="07" detail="Last capture 13:58 IST" icon={FileCheck2} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
          <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">ASSIGNED SECTOR</div>
            <h2 className="mt-0.5 text-sm font-semibold text-white">Ladakh / North Operational Picture</h2>
          </div>
          <IndiaMap embedded sector="Ladakh" onCamera={(id) => setLocation(`/officer/watch?camera=${id}`)} />
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
          <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">FIELD QUEUE</div>
            <h2 className="mt-0.5 text-sm font-semibold text-white">Immediate Field Actions</h2>
          </div>
          <div className="divide-y divide-white/5">
            {[
              ['Acknowledge', 'INC-2417 · Unidentified movement', 'Critical', '/officer/alerts'],
              ['Review Feed', 'PN-LAD-04 · Person detection', '94.8%', '/officer/watch'],
              ['Capture Evidence', 'Add field context to open incident', 'Optional', '/officer/evidence'],
            ].map(([action, title, detail, href]) => (
              <Link
                href={href}
                data-testid={`link-officer-action-${action.toLowerCase().replace(' ', '-')}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/40 transition-colors"
                key={title}
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-slate-800 text-emerald-400">
                  {action === 'Acknowledge' ? <Bell size={15} /> : action === 'Review Feed' ? <Eye size={15} /> : <FileCheck2 size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white">{title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{action}</div>
                </div>
                <span className="font-mono text-xs text-amber-400 font-semibold">{detail}</span>
                <ArrowRight size={14} className="text-slate-500" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function OfficerWatch() {
  const [selected, setSelected] = useState(cameras[0]);
  const [thermal, setThermal] = useState(true);
  const sectorCameras = cameras.filter((camera) => camera.sector === 'Ladakh');

  useEffect(() => {
    const payload = { online: true, name: 'R. DORJE', role: 'GROUND OFFICER · G2', path: '/officer/watch', activity: 'Monitoring assigned camera feed', camera: selected.id, mode: thermal ? 'THERMAL' : 'VISIBLE CCTV' };
    publishOfficerPresence(payload);
    fetch('/signal-api/api/officer/presence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => { });
  }, [selected.id, thermal]);

  return (
    <>
      <PageHeader
        eyebrow="FIELD CONSOLE · LIVE WATCH"
        title="Tactical Camera Watch"
        action={
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Watch Active
            </span>
            <Button kind="secondary" testId="button-watch-refresh" onClick={() => { appendTacticalLog('Refreshed assigned camera watch', 'Ladakh'); window.location.reload(); }}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/80 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              {selected.id} · {selected.site} · {thermal ? 'THERMAL IR' : 'VISIBLE CCTV'}
            </span>
            <span className="font-mono text-[11px] text-slate-400">LOCAL PLAYBACK</span>
          </div>
          <CameraFeed cameraId={selected.id} thermal={thermal} aiEnabled className="min-h-[440px] h-[480px] xl:h-[520px]" />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/60 px-5 py-3.5 text-slate-300">
            <div className="flex gap-2">
              <button
                onClick={() => setThermal(false)}
                className={cn('inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all border', !thermal ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-white/5 bg-slate-800 text-slate-400 hover:text-white')}
              >
                <Video size={14} /> Visible CCTV
              </button>
              <button
                onClick={() => setThermal(true)}
                className={cn('inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all border', thermal ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-white/5 bg-slate-800 text-slate-400 hover:text-white')}
              >
                <Crosshair size={14} /> Thermal IR
              </button>
            </div>
            <span className="font-mono text-xs text-emerald-400">AIR-GAPPED AI INFERENCE ACTIVE</span>
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl flex flex-col">
          <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">ASSIGNED SECTOR NODES</div>
            <h2 className="mt-0.5 text-sm font-semibold text-white">Select Video Feed</h2>
          </div>
          <div className="divide-y divide-white/5">
            {sectorCameras.map((camera) => (
              <button
                key={camera.id}
                onClick={() => { setSelected(camera); setThermal(true); }}
                data-testid={`button-select-watch-${camera.id}`}
                className={cn(
                  'w-full px-6 py-4 text-left transition-all hover:bg-slate-800/40',
                  selected.id === camera.id && 'bg-slate-800/60 border-l-2 border-emerald-400'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs font-semibold text-emerald-400">{camera.id}</div>
                    <div className="mt-0.5 text-xs font-semibold text-white">{camera.site}</div>
                  </div>
                  <StatusDot status={camera.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Health {camera.health}%</span>
                  <span className="text-emerald-400/90 font-mono">Thermal Available</span>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

function OfficerIncident() {
  const { id } = useParams<{ id: string }>();
  const item = incidents.find((incident) => incident.id === id) ?? incidents[0];
  const [, setLocation] = useLocation();
  const [state, setState] = useState(item.state);

  return (
    <>
      <PageHeader
        eyebrow={`FIELD INCIDENT · ${item.id}`}
        title={item.title}
        detail={`${item.sector} Sector · ${item.camera} · Detected ${item.time}`}
        action={
          <Button kind="secondary" testId="button-back-alerts" onClick={() => setLocation('/officer/alerts')}>
            <ArrowLeft size={14} /> Alert Queue
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={cn('severity', `severity-${item.severity.toLowerCase()}`)}>{item.severity}</span>
              <span className="rounded-md border border-white/10 bg-slate-800 px-2.5 py-0.5 font-mono text-xs text-white">{state}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                <ShieldCheck size={13} /> Evidence Sealed
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">DETECTION CLASS</div>
                <div className="mt-1 text-sm font-bold text-white">{item.kind}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">AI CONFIDENCE</div>
                <div className="mt-1 text-sm font-bold text-white">94.8%</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">GEOFENCE PROXIMITY</div>
                <div className="mt-1 text-sm font-bold text-white">0.42 km inside</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
            <div className="border-b border-white/10 px-6 py-4 bg-slate-900/80">
              <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">INCIDENT CHRONOLOGY</div>
              <h2 className="mt-0.5 text-sm font-semibold text-white">Sequence of Events</h2>
            </div>
            <div className="timeline p-6">
              {[
                ['14:32:19', 'Detection Generated', 'Edge AI identified PERSON + VEHICLE classes above the alerting threshold.'],
                ['14:32:28', 'Alert Dispatched', 'Assigned to Officer R. Dorje · G2 sector response.'],
                ['14:34:05', 'Evidence Sealed', 'Frame set EV-2417-A signed and appended to immutable local chain.'],
                ['Current', 'Field Action', 'Awaiting field operator confirmation.'],
              ].map(([time, title, text]) => (
                <div className="timeline-item" key={time}>
                  <span className="timeline-dot" />
                  <span className="font-mono text-xs text-emerald-400">{time}</span>
                  <h3 className="mt-1 text-xs font-semibold text-white">{title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">GEOSPATIAL CONTEXT</div>
            <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
              <IndiaMap compact sector="Ladakh" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-slate-500 font-semibold">COORDINATES</span>
                <span className="mt-0.5 block font-mono text-xs text-white">34.1154 N<br />77.5432 E</span>
              </div>
              <div>
                <span className="block text-slate-500 font-semibold">SENSOR NODE</span>
                <span className="mt-0.5 block font-mono text-xs text-emerald-400">{item.camera}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">FIELD TRIAGE ACTION</div>
            <div className="mt-4 grid gap-3">
              <Button kind="primary" testId="button-incident-acknowledge" onClick={() => setState('Acknowledged')}>
                <Check size={14} /> Acknowledge Threat
              </Button>
              <Button kind="danger" testId="button-incident-escalate" onClick={() => setState('Escalated')}>
                <Zap size={14} /> Escalate to Command
              </Button>
              <Link href="/officer/evidence" data-testid="link-capture-incident-evidence" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors">
                <FileCheck2 size={14} /> Capture Evidence
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function OfficerEvidence() {
  const [captured, setCaptured] = useState(false);
  const [verified, setVerified] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="FIELD CONSOLE · PROVENANCE"
        title="Field Evidence Capture"
        action={
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <LockKeyhole size={13} /> Local Chain Ready
          </span>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
          <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">CAPTURE WORKFLOW</div>
          <h2 className="mt-1 text-xl font-bold text-white">Seal a Field Observation</h2>
          <div className="mt-6 space-y-6">
            <div className="flex gap-4 items-start">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400">01</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Select Sensor Source</h3>
                <select className="field-input mt-2" data-testid="select-evidence-source" defaultValue="PN-LAD-04 · 14:32:19">
                  <option value="PN-LAD-04 · 14:32:19" className="bg-slate-900 text-white">PN-LAD-04 · 14:32:19 (Person Alert)</option>
                  <option value="PN-LAD-07 · 14:31:04" className="bg-slate-900 text-white">PN-LAD-07 · 14:31:04 (Vehicle Alert)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400">02</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Add Field Context</h3>
                <textarea
                  className="field-input mt-2 min-h-[95px]"
                  data-testid="textarea-evidence-context"
                  placeholder="Describe observation context objectively…"
                  defaultValue="Movement observed along the perimeter relay corridor. Frame sequence signed and sealed for review."
                />
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400">03</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Cryptographic Sealing</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  A SHA-256 digest, Ed25519 signature, device certificate, and chronological timestamp will be locked into the local tamper-evident log.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button kind="primary" testId="button-seal-evidence" onClick={() => { setCaptured(true); setVerified(false); }}>
              <Fingerprint size={16} /> Seal Evidence Object
            </Button>
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">VERIFICATION OUTPUT</div>
            {captured ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-inner">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <CheckCircle2 size={18} /> Evidence Sealed Locally
                  </div>
                  <div className="mt-3 font-mono text-xs leading-relaxed text-slate-300">
                    ID: EV-2418-A<br />
                    SHA-256: 3d7c…9a12<br />
                    ED25519: SIGNED<br />
                    CHAIN INDEX: 0126
                  </div>
                </div>
                <Button kind="secondary" testId="button-verify-captured-evidence" onClick={() => setVerified(true)}>
                  {verified ? <Check size={14} /> : <ShieldCheck size={14} />} {verified ? 'Integrity Verified' : 'Verify Integrity'}
                </Button>
              </div>
            ) : (
              <div className="empty-state min-h-[260px] py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
                <FileCheck2 size={28} className="mx-auto mb-2 opacity-50" />
                <p>Complete the workflow steps to generate an immutable evidence proof.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function OfficerMap() {
  const [, setLocation] = useLocation();
  return (
    <>
      <PageHeader
        eyebrow="FIELD CONSOLE · ASSIGNED GEOGRAPHY"
        title="Sector Tactical Radar"
        action={
          <Button kind="secondary" testId="button-officer-map-recenter">
            <Target size={14} /> Recenter Sector
          </Button>
        }
      />
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur-md shadow-xl overflow-hidden">
        <IndiaMap sector="Ladakh" onCamera={(id) => setLocation(`/officer/watch?camera=${id}`)} />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Assigned Cameras" value="02" detail="Both nodes transmitting" tone="good" icon={Camera} />
        <Metric label="Active Geofences" value="04" detail="2 active this shift" icon={Target} />
        <Metric label="Response Distance" value="0.42 km" detail="Nearest detection point" icon={Timer} />
      </div>
    </>
  );
}

function OfficerAlerts() {
  const [items, setItems] = useState(incidents.slice(0, 4));
  const [message, setMessage] = useState('');
  const act = (id: string, action: string) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, state: action } : item));
    setMessage(`${id} marked ${action.toLowerCase()} in the local field log.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="FIELD CONSOLE · RESPONSE QUEUE"
        title="Active Threat Alerts"
        action={
          <Button kind="secondary" testId="button-alert-filter">
            <SlidersHorizontal size={14} /> Filter Queue
          </Button>
        }
      />
      {message && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-xs text-emerald-300">
          <span>{message}</span>
          <button onClick={() => setMessage('')} data-testid="button-dismiss-alert-message" className="text-emerald-400 hover:text-white">
            <X size={15} />
          </button>
        </div>
      )}
      <div className="space-y-4">
        {items.map((item) => (
          <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl transition-all hover:border-white/20" key={item.id} data-testid={`card-officer-alert-${item.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4">
                <span className={cn('mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border', item.severity === 'Critical' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400')}>
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-400">{item.id}</span>
                    <span className={cn('severity', `severity-${item.severity.toLowerCase()}`)}>{item.severity}</span>
                    <span className="rounded border border-white/10 bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300">{item.state}</span>
                  </div>
                  <h2 className="mt-2 text-base font-bold text-white">{item.title}</h2>
                  <p className="mt-0.5 text-xs text-slate-400">{item.sector} Sector · {item.camera} · {item.time}</p>
                </div>
              </div>
              <Link href={`/officer/incidents/${item.id}`} data-testid={`link-investigate-${item.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                Investigate <ArrowRight size={13} />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-white/5 pt-4">
              <Button kind="secondary" testId={`button-acknowledge-${item.id}`} onClick={() => act(item.id, 'Acknowledged')}>
                <Check size={14} /> Acknowledge
              </Button>
              <Button kind="secondary" testId={`button-investigate-${item.id}`} onClick={() => act(item.id, 'Investigating')}>
                <Eye size={14} /> Mark Investigating
              </Button>
              <Button kind="danger" testId={`button-escalate-${item.id}`} onClick={() => act(item.id, 'Escalated')}>
                <Zap size={14} /> Escalate Threat
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/phone" component={PhoneSender} />
      <Route path="/admin"><AppShell mode="admin"><AdminOverview /></AppShell></Route>
      <Route path="/admin/map"><AppShell mode="admin"><AdminMap /></AppShell></Route>
      <Route path="/admin/phone"><AppShell mode="admin"><PhoneLive /></AppShell></Route>
      <Route path="/admin/cameras/:id"><AppShell mode="admin"><CameraDetail /></AppShell></Route>
      <Route path="/admin/cameras"><AppShell mode="admin"><AdminCameras /></AppShell></Route>
      <Route path="/admin/incidents"><AppShell mode="admin"><AdminIncidents /></AppShell></Route>
      <Route path="/admin/evidence"><AppShell mode="admin"><AdminEvidence /></AppShell></Route>
      <Route path="/admin/analytics"><AppShell mode="admin"><AdminAnalytics /></AppShell></Route>
      <Route path="/admin/health"><AppShell mode="admin"><AdminHealth /></AppShell></Route>
      <Route path="/admin/access"><AppShell mode="admin"><AdminAccess /></AppShell></Route>
      <Route path="/officer"><AppShell mode="officer"><OfficerHome /></AppShell></Route>
      <Route path="/officer/watch"><AppShell mode="officer"><OfficerWatch /></AppShell></Route>
      <Route path="/officer/alerts"><AppShell mode="officer"><OfficerAlerts /></AppShell></Route>
      <Route path="/officer/incidents/:id"><AppShell mode="officer"><OfficerIncident /></AppShell></Route>
      <Route path="/officer/evidence"><AppShell mode="officer"><OfficerEvidence /></AppShell></Route>
      <Route path="/officer/map"><AppShell mode="officer"><OfficerMap /></AppShell></Route>
      <Route><NotFound /></Route>
    </Switch>
  );
}

function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#070b10] text-slate-100 p-6">
      <div className="text-center max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
          SIGNAL NOT FOUND
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-white">Perimeter Boundary Exceeded</h1>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          The requested coordinate or interface route is outside the authorized air-gapped network topology.
        </p>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
          data-testid="button-return-entry"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft size={15} /> Return to Entry Station
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return <Router />;
}