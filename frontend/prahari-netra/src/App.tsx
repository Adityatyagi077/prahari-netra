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
  { id: 'PN-LAD-04', sector: 'Ladakh', site: 'Khardung La approach', status: 'Online' as CameraStatus, health: 98, heartbeat: '12 sec ago', detections: 14, coord: [21, 21], accent: 'amber' },
  { id: 'PN-LAD-07', sector: 'Ladakh', site: 'Chushul relay', status: 'Online' as CameraStatus, health: 96, heartbeat: '18 sec ago', detections: 8, coord: [25, 28], accent: 'sage' },
  { id: 'PN-RAJ-02', sector: 'Rajasthan', site: 'Longewala west', status: 'Online' as CameraStatus, health: 100, heartbeat: '06 sec ago', detections: 22, coord: [15, 45], accent: 'sage' },
  { id: 'PN-RAJ-09', sector: 'Rajasthan', site: 'Ghotaru post', status: 'Degraded' as CameraStatus, health: 71, heartbeat: '2 min ago', detections: 3, coord: [23, 48], accent: 'terra' },
  { id: 'PN-PUN-01', sector: 'Punjab', site: 'Ferozepur north', status: 'Online' as CameraStatus, health: 99, heartbeat: '09 sec ago', detections: 17, coord: [30, 34], accent: 'sage' },
  { id: 'PN-GUJ-06', sector: 'Gujarat', site: 'Rann east sector', status: 'Offline' as CameraStatus, health: 0, heartbeat: '43 min ago', detections: 0, coord: [24, 59], accent: 'terra' },
  { id: 'PN-WBE-03', sector: 'West Bengal', site: 'Siliguri corridor', status: 'Online' as CameraStatus, health: 97, heartbeat: '15 sec ago', detections: 11, coord: [59, 52], accent: 'sage' },
  { id: 'PN-SIK-02', sector: 'Sikkim', site: 'Nathu La ridge', status: 'Online' as CameraStatus, health: 94, heartbeat: '24 sec ago', detections: 9, coord: [65, 40], accent: 'amber' },
  { id: 'PN-ARP-05', sector: 'Arunachal Pradesh', site: 'Tawang north', status: 'Online' as CameraStatus, health: 91, heartbeat: '31 sec ago', detections: 6, coord: [78, 31], accent: 'sage' },
  { id: 'PN-ARP-08', sector: 'Arunachal Pradesh', site: 'Walong pass', status: 'Degraded' as CameraStatus, health: 64, heartbeat: '4 min ago', detections: 2, coord: [84, 38], accent: 'terra' },
  { id: 'PN-ASM-04', sector: 'Assam', site: 'Dhubri riverine', status: 'Online' as CameraStatus, health: 98, heartbeat: '08 sec ago', detections: 12, coord: [73, 60], accent: 'sage' },
  { id: 'PN-ASM-07', sector: 'Assam', site: 'Karimganj east', status: 'Online' as CameraStatus, health: 95, heartbeat: '20 sec ago', detections: 7, coord: [80, 64], accent: 'sage' },
];

const incidents = [
  { id: 'INC-2417', time: '18 Jun · 14:32', sector: 'Ladakh', title: 'Unidentified movement near relay corridor', severity: 'Critical' as Severity, camera: 'PN-LAD-04', state: 'Under review', evidence: 'Verified', kind: 'PERSON · VEHICLE' },
  { id: 'INC-2416', time: '18 Jun · 13:48', sector: 'Rajasthan', title: 'Vehicle pattern outside geofence', severity: 'High' as Severity, camera: 'PN-RAJ-02', state: 'Acknowledged', evidence: 'Verified', kind: 'VEHICLE' },
  { id: 'INC-2415', time: '18 Jun · 12:06', sector: 'Arunachal Pradesh', title: 'Optical obstruction on ridge camera', severity: 'Medium' as Severity, camera: 'PN-ARP-08', state: 'Investigating', evidence: 'Pending', kind: 'ENVIRONMENT' },
  { id: 'INC-2414', time: '18 Jun · 10:19', sector: 'Gujarat', title: 'Camera heartbeat missed threshold', severity: 'Low' as Severity, camera: 'PN-GUJ-06', state: 'Open', evidence: 'Not applicable', kind: 'SYSTEM' },
  { id: 'INC-2413', time: '17 Jun · 21:44', sector: 'West Bengal', title: 'Loitering event at service road', severity: 'High' as Severity, camera: 'PN-WBE-03', state: 'Closed', evidence: 'Verified', kind: 'PERSON' },
];

const detections = [
  ['14:32:19', 'PERSON', '94.8%', 'PN-LAD-04', 'Critical'],
  ['14:31:58', 'VEHICLE', '88.2%', 'PN-LAD-04', 'High'],
  ['13:48:06', 'VEHICLE', '91.6%', 'PN-RAJ-02', 'High'],
  ['12:06:42', 'OBSTRUCTION', '76.4%', 'PN-ARP-08', 'Medium'],
  ['11:53:21', 'PERSON', '82.1%', 'PN-PUN-01', 'Medium'],
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
  const isOnline = status === 'Online' || status === 'Verified';
  const isWarn = status === 'Degraded' || status === 'Pending';
  const color = isOnline
    ? 'bg-[#22c55e] shadow-[0_0_6px_#22c55e]'
    : isWarn
      ? 'bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]'
      : 'bg-[#ef4444] shadow-[0_0_6px_#ef4444]';
  return <span className={cn('inline-block h-2 w-2 rounded-full', color)} />;
}

function Wordmark({ light = true }: { light?: boolean }) {
  return <div className="flex items-center gap-3 text-[#f8fafc]">
    <span className="grid h-9 w-9 place-items-center border border-[#22c55e]/60 bg-[#0e2417] text-[#4ade80] shadow-[0_0_12px_rgba(34,197,94,0.35)]">
      <Hexagon size={20} strokeWidth={2} />
    </span>
    <span>
      <span className="block font-mono text-[9px] font-bold tracking-[.25em] text-[#86efac]">DEFENSE COMMAND NETWORK</span>
      <span className="block font-mono text-[16px] font-extrabold tracking-[.18em] text-[#f8fafc]">PRAHARI NETRA</span>
    </span>
  </div>;
}

function LocalStatus() {
  return <span className="inline-flex items-center gap-2 border border-[#1f3827] bg-[#0c1811] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#86efac]">
    <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_5px_#22c55e]" />
    AIR-GAPPED · SECURE TELEMETRY
  </span>;
}



const cameraRecordings: Record<string, { visible: string; thermal: string }> = {
  'PN-LAD-04': { visible: '/recordings/frost-path.mp4', thermal: '/recordings/frost-path.mp4' },
  'PN-LAD-07': { visible: '/recordings/city-traffic.mp4', thermal: '/recordings/city-traffic.mp4' },
  'PN-RAJ-02': { visible: '/recordings/vehicle-highway.mp4', thermal: '/recordings/vehicle-highway.mp4' },
  'PN-RAJ-09': { visible: '/recordings/pedestrian-corridor.mp4', thermal: '/recordings/pedestrian-corridor.mp4' },
  'PN-PUN-01': { visible: '/recordings/crowd-overhead.mp4', thermal: '/recordings/crowd-overhead.mp4' },
  'PN-GUJ-06': { visible: '/recordings/vehicle-highway.mp4', thermal: '/recordings/vehicle-highway.mp4' },
  'PN-WBE-03': { visible: '/recordings/crowd-overhead.mp4', thermal: '/recordings/crowd-overhead.mp4' },
  'PN-SIK-02': { visible: '/recordings/frost-path.mp4', thermal: '/recordings/frost-path.mp4' },
  'PN-ARP-05': { visible: '/recordings/frost-path.mp4', thermal: '/recordings/frost-path.mp4' },
  'PN-ARP-08': { visible: '/recordings/pedestrian-corridor.mp4', thermal: '/recordings/pedestrian-corridor.mp4' },
  'PN-ASM-04': { visible: '/recordings/city-traffic.mp4', thermal: '/recordings/city-traffic.mp4' },
  'PN-ASM-07': { visible: '/recordings/vehicle-highway.mp4', thermal: '/recordings/vehicle-highway.mp4' },
};
const defaultRecording = { visible: '/recordings/city-traffic.mp4', thermal: '/recordings/city-traffic.mp4' };

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

function CameraFeed({ cameraId, thermal = false, night = false, stream, aiEnabled = true, className = '' }: { cameraId?: string; thermal?: boolean; night?: boolean; stream?: MediaStream | null; aiEnabled?: boolean; className?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [detections, setDetections] = useState<LiveDetection[]>([]);
  const [plateCandidates, setPlateCandidates] = useState<LiveDetection[]>([]);
  const [stats, setStats] = useState<LiveStats>({ person: 0, vehicle: 0, car: 0, plate_candidates: 0 });
  const [aiState, setAiState] = useState<'connecting' | 'active' | 'error' | 'off'>('connecting');
  const [aiMessage, setAiMessage] = useState('Connecting to local inference service');
  const [sourceError, setSourceError] = useState(false);
  const recording = cameraRecordings[cameraId ?? ''] ?? defaultRecording;
  const source = thermal ? recording.thermal : recording.visible;
  const isLive = Boolean(stream);

  useEffect(() => {
    setSourceError(false); setDetections([]); setPlateCandidates([]); setStats({ person: 0, vehicle: 0, car: 0, plate_candidates: 0 }); setAiState(aiEnabled ? 'connecting' : 'off');
    setAiMessage('Connecting to local inference service');
    if (!stream) videoRef.current?.load();
  }, [source, aiEnabled, stream]);

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
    if (!aiEnabled) return;
    let cancelled = false;
    let timer: number | null = null;
    let running = false;
    const frame = document.createElement('canvas');
    const sendFrame = async () => {
      if (cancelled || running) return;
      const video = videoRef.current;
      if (!video || video.paused || video.ended || video.readyState < 2 || !video.videoWidth) return schedule();
      running = true;
      try {
        frame.width = 640;
        frame.height = Math.max(1, Math.round(640 * video.videoHeight / video.videoWidth));
        const ctx = frame.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        ctx.drawImage(video, 0, 0, frame.width, frame.height);
        const blob = await new Promise<Blob | null>((resolve) => frame.toBlob(resolve, 'image/jpeg', 0.72));
        if (!blob) throw new Error('Frame encoding failed');
        const body = new FormData(); body.append('file', blob, 'frame.jpg');
        body.append('mode', night || thermal ? 'night' : 'visible');
        const response = await fetch(`${CAMERA_API}/detect`, { method: 'POST', body });
        if (!response.ok) throw new Error(`AI service returned ${response.status}`);
        const data = await response.json();
        if (!cancelled) { setDetections(data.detections ?? []); setPlateCandidates(data.plate_candidates ?? []); setStats(data.counts ?? { person: 0, vehicle: 0, car: 0, plate_candidates: 0 }); setAiState('active'); setAiMessage('Local YOLO inference active'); }
      } catch (error) {
        if (!cancelled) { setAiState('error'); setAiMessage(error instanceof Error ? error.message : 'Inference service unavailable'); setDetections([]); setPlateCandidates([]); setStats({ person: 0, vehicle: 0, car: 0, plate_candidates: 0 }); }
      } finally { running = false; schedule(); }
    };
    const schedule = () => { if (!cancelled) timer = window.setTimeout(sendFrame, 350); };
    schedule();
    return () => { cancelled = true; if (timer !== null) window.clearTimeout(timer); };
  }, [aiEnabled, source, stream, night, thermal]);

  useEffect(() => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas) return;
    const draw = () => {
      const rect = video.getBoundingClientRect();
      if (!video.videoWidth || !rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (!aiEnabled) return;
      const scale = Math.max(rect.width / video.videoWidth, rect.height / video.videoHeight);
      const rw = video.videoWidth * scale, rh = video.videoHeight * scale;
      const ox = (rect.width - rw) / 2, oy = (rect.height - rh) / 2;
      const ratio = rw / 640;
      detections.forEach((d) => {
        const [x, y, w, h] = d.bbox;
        const bx = x * ratio + ox, by = y * ratio + oy, bw = w * ratio, bh = h * ratio;
        ctx.strokeStyle = d.class === 'PERSON' ? '#c7d890' : '#d5af6c';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        const label = `${d.label ? d.label.toUpperCase() : d.class} ${(d.confidence * 100).toFixed(1)}%`;
        ctx.font = '10px monospace';
        const tw = ctx.measureText(label).width + 10;
        const ly = Math.max(16, by);
        ctx.fillStyle = d.class === 'PERSON' ? '#314931' : '#57462f';
        ctx.fillRect(bx, ly - 16, tw, 16);
        ctx.fillStyle = '#eef2dc';
        ctx.fillText(label, bx + 5, ly - 5);
      });
      plateCandidates.forEach((d) => {
        const [x, y, w, h] = d.bbox;
        const bx = x * ratio + ox, by = y * ratio + oy, bw = w * ratio, bh = h * ratio;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#0c2833';
        ctx.fillRect(bx, Math.max(13, by) - 13, 42, 13);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillText('PLATE?', bx + 4, Math.max(13, by) - 4);
      });
    };
    const observer = new ResizeObserver(draw);
    observer.observe(video);
    video.addEventListener('loadedmetadata', draw);
    video.addEventListener('play', draw);
    const id = window.setInterval(draw, 100);
    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', draw);
      video.removeEventListener('play', draw);
      window.clearInterval(id);
    };
  }, [detections, plateCandidates, aiEnabled]);

  return <div className={cn('camera-feed-shell relative overflow-hidden', className)}>
    {!sourceError ? (
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          className={cn('camera-recording', thermal && 'camera-recording-thermal', night && 'camera-recording-night')}
          controls
          autoPlay
          muted
          loop
          playsInline
          onError={() => !stream && setSourceError(true)}
        >
          {!stream && <source src={source} type="video/mp4" />}
        </video>
        <canvas ref={canvasRef} className="ai-detection-canvas pointer-events-none absolute inset-0 z-[5] h-full w-full" />
      </div>
    ) : (
      <div className="camera-recording-fallback">
        <Video size={28} />
        <strong>Camera recording unavailable</strong>
        <span>Check the recording in public/recordings.</span>
      </div>
    )}
    {aiEnabled && <div className={cn('pointer-events-none absolute left-4 top-4 z-10 border px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider', aiState === 'active' ? 'border-[#22c55e]/70 bg-[#081e10]/90 text-[#4ade80] shadow-[0_0_10px_rgba(34,197,94,0.3)]' : aiState === 'connecting' ? 'border-[#f59e0b]/70 bg-[#211708]/90 text-[#fbbf24]' : 'border-[#ef4444]/70 bg-[#210908]/90 text-[#fca5a5]')}>LOCAL YOLO · {aiState === 'active' ? 'NOMINAL ACTIVE' : aiState === 'connecting' ? 'CONNECTING...' : aiState === 'error' ? 'OFFLINE' : 'OFF'}</div>}
    {aiEnabled && aiState === 'error' && <div className="pointer-events-none absolute left-4 bottom-4 z-10 max-w-[80%] border border-[#ef4444]/60 bg-[#1f0a09]/95 px-3 py-1.5 font-mono text-[10px] font-semibold text-[#fca5a5] shadow-[0_0_12px_rgba(239,68,68,0.35)]">{aiMessage}</div>}
    {aiEnabled && aiState === 'active' && <div className="pointer-events-none absolute right-4 top-4 z-10 grid grid-cols-4 gap-1.5">{[['PERSON', stats.person], ['VEHICLE', stats.vehicle], ['CAR', stats.car], ['PLATE', stats.plate_candidates]].map(([label, value]) => <div key={String(label)} className="min-w-[58px] border border-[#22c55e]/60 bg-[#081e10]/90 px-2 py-1 text-center shadow-[0_0_10px_rgba(34,197,94,0.18)]"><div className="font-mono text-[8px] text-[#86efac]">{label}</div><div className="font-mono text-sm font-extrabold text-[#dcfce7]">{value}</div></div>)}</div>}
    {thermal && <div className="pointer-events-none absolute bottom-4 right-4 z-10 border border-[#06b6d4]/70 bg-[#081b21]/90 px-2.5 py-1 font-mono text-[10px] font-bold text-[#38bdf8] shadow-[0_0_10px_rgba(6,182,212,0.3)]">IR THERMAL SENSOR</div>}
  </div>;
}

function IndiaMap({ compact = false, sector = 'All sectors', onCamera }: { compact?: boolean; sector?: string; onCamera?: (id: string) => void }) {
  const activeCameras = sector === 'All sectors' ? cameras : cameras.filter((camera) => camera.sector === sector);
  const activeSectors = new Set(activeCameras.map((camera) => camera.sector));
  return <div className={cn('map-frame relative overflow-hidden', compact ? 'min-h-[340px]' : 'min-h-[580px]')}>
    <div className="absolute inset-0 map-grid opacity-70" />
    <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-3">
      <span className="eyebrow flex items-center gap-1.5"><Crosshair size={12} /> RADAR C4ISR MESH</span>
      <span className="font-mono text-[10px] font-bold text-[#86efac]">28 STATES · 8 UTs · ORBAT BOUNDARIES</span>
    </div>
    <div className="absolute right-4 top-4 z-20 flex gap-2">
      <span className="map-control"><Layers3 size={14} className="text-[#4ade80]" /> SENSOR OVERLAY ACTIVE</span>
    </div>
    <div className="absolute inset-x-[8%] bottom-[9%] top-[12%] z-10">
      <svg viewBox={indiaMap.viewBox} className="h-full w-full" role="img" aria-label="India map with state and union territory boundaries">
        <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
        {indiaMap.locations.map((location: { id: string; name: string; path: string }) => { const stateCamera = cameras.find((camera) => camera.sector.toLowerCase() === location.name.toLowerCase()); return <path key={location.id} d={location.path} className={cn('india-state-path', stateCamera && 'india-state-clickable')} aria-label={location.name} tabIndex={stateCamera ? 0 : -1} onClick={() => stateCamera && onCamera?.(stateCamera.id)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && stateCamera) onCamera?.(stateCamera.id); }}><title>{stateCamera ? `${location.name} · Open border camera ${stateCamera.id}` : location.name}</title></path>; })}
      </svg>
      <div className="pointer-events-none absolute inset-0">
        {activeCameras.map((camera) => <button key={camera.id} type="button" aria-label={`${camera.id} · ${camera.site}`} className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${camera.coord[0]}%`, top: `${camera.coord[1]}%` }} onClick={() => onCamera?.(camera.id)}>
          <span className={cn('node-halo block h-5 w-5 rounded-full', camera.status === 'Offline' ? 'offline' : camera.status === 'Degraded' ? 'degraded' : '')}><span className="node-core absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" /></span>
          <span className="mt-1 block whitespace-nowrap border border-[#22c55e]/60 bg-[#06120a]/95 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#86efac] shadow-[0_0_8px_rgba(0,0,0,0.8)]">{camera.id}</span>
        </button>)}
        {borderPoints.filter((point) => activeSectors.has(point.label)).map((point) => <span key={point.id} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#22c55e]/50 bg-[#07130b]/90 px-2 py-0.5 font-mono text-[9px] font-bold text-[#4ade80]" style={{ left: `${point.x}%`, top: `${point.y}%` }}>{point.label}</span>)}
      </div>
    </div>
    <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-4 border border-[#1b2f21] bg-[#07110c]/95 px-3.5 py-2 font-mono text-[11px] text-[#cbd5e1]"><span className="flex items-center gap-2"><StatusDot /> Online {cameras.filter((c) => c.status === 'Online').length}</span><span className="flex items-center gap-2"><StatusDot status="Degraded" /> Degraded {cameras.filter((c) => c.status === 'Degraded').length}</span><span className="flex items-center gap-2"><StatusDot status="Offline" /> Offline {cameras.filter((c) => c.status === 'Offline').length}</span></div>
    {!compact && <div className="absolute bottom-4 right-4 z-20 border border-[#1b2f21] bg-[#07110c]/95 px-3 py-2 font-mono text-[10px] font-bold text-[#86efac]">12 NODES · 08 BORDER SECTORS · AIR-GAPPED</div>}
  </div>;
}
function Button({ children, kind = 'secondary', onClick, testId, disabled = false, type = 'button' }: { children: ReactNode; kind?: 'primary' | 'secondary' | 'danger' | 'quiet'; onClick?: () => void; testId: string; disabled?: boolean; type?: 'button' | 'submit' | 'reset' }) {
  return <button type={type} data-testid={testId} onClick={onClick ?? (() => { })} disabled={disabled} className={cn('action-button', `action-${kind}`, disabled && 'cursor-not-allowed opacity-50')}>{children}</button>;
}

function PageHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#1a2d1f] pb-5">
    <div>
      <div className="eyebrow mb-2 flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
        {eyebrow}
      </div>
      <h1 className="page-title">{title}</h1>
      {detail && <p className="mt-1.5 max-w-3xl font-mono text-xs text-[#94a3b8] leading-relaxed">{detail}</p>}
    </div>
    {action}
  </div>;
}

function Metric({ label, value, detail, tone = 'default', icon: Icon }: { label: string; value: string; detail: string; tone?: 'default' | 'alert' | 'good'; icon: typeof Activity }) {
  const toneClass = tone === 'alert' ? 'tactical-corner-red border-[#3f1917]' : tone === 'good' ? 'tactical-corner border-[#1c3323]' : 'tactical-corner border-[#1e3324]';
  const iconColor = tone === 'alert' ? 'text-[#ef4444] bg-[#2a1110] border-[#ef4444]/40 shadow-[0_0_8px_rgba(239,68,68,0.35)]' : tone === 'good' ? 'text-[#4ade80] bg-[#0c2415] border-[#22c55e]/40 shadow-[0_0_8px_rgba(34,197,94,0.35)]' : 'text-[#f59e0b] bg-[#22180c] border-[#f59e0b]/40 shadow-[0_0_8px_rgba(245,158,11,0.35)]';
  return <div className={cn('metric-panel tactical-corner', toneClass)}>
    <div className="flex items-start justify-between">
      <span className="font-mono text-[10px] font-bold tracking-[.16em] uppercase text-[#86efac]">{label}</span>
      <span className={cn('grid h-7 w-7 place-items-center border', iconColor)}>
        <Icon size={14} />
      </span>
    </div>
    <div className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-[#f8fafc]">{value}</div>
    <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-[#94a3b8]">
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', tone === 'alert' ? 'bg-[#ef4444]' : tone === 'good' ? 'bg-[#22c55e]' : 'bg-[#f59e0b]')} />
      {detail}
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
  return <div className={cn('min-h-[100dvh] bg-background text-foreground', isAdmin ? 'shell-admin' : 'shell-officer')}>
    <aside className={cn('fixed inset-y-0 left-0 z-40 w-[252px] border-r border-[#142418] bg-[#050a06] text-sidebar-foreground transition-transform duration-300 md:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
      <div className="flex h-full flex-col">
        <div className="border-b border-[#142418] px-5 py-5"><Wordmark light /></div>
        <div className="mx-3 mt-4 border border-[#22442d] bg-[#0c1811] px-3.5 py-3 tactical-corner">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.14em] text-[#86efac]">
              <StatusDot /> {isAdmin ? 'DEFCON 2 · ADMIN' : 'DEFCON 3 · OFFICER'}
            </span>
            <span className="border border-[#22c55e]/40 bg-[#14331e] px-1.5 py-0.5 font-mono text-[8px] font-extrabold text-[#4ade80]">COP-ACTIVE</span>
          </div>
          <div className="mt-2 font-mono text-[10px] text-[#94a3b8]">{isAdmin ? 'NATIONAL C4ISR OPERATIONS DESK' : 'ASSIGNED · LADAKH / NORTH'}</div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 font-mono text-[9px] font-bold tracking-[.22em] text-[#52795d] uppercase">{isAdmin ? 'COMMAND CHANNELS' : 'FIELD CHANNELS'}</div>
          {nav.map(({ href, label, Icon, group }) => <div key={href}>
            {isAdmin && nav.findIndex((n) => n.group === group && n.href === href) === nav.findIndex((n) => n.group === group) && (
              <div className="mb-1 mt-4 px-3 font-mono text-[9px] font-bold tracking-[.22em] text-[#3e5f48] uppercase">{group}</div>
            )}
            <Link href={href} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, '-')}`} className={cn('nav-link', location === href && 'nav-link-active')}>
              <Icon size={16} strokeWidth={1.8} className={location === href ? 'text-[#4ade80]' : 'text-[#64748b]'} />
              <span>{label}</span>
              {label === 'Alert queue' && <span className="ml-auto border border-[#ef4444] bg-[#2a100f] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#fca5a5] shadow-[0_0_8px_rgba(239,68,68,0.4)]">03</span>}
            </Link>
          </div>)}
        </nav>
        <div className="border-t border-[#142418] bg-[#070e08] p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="avatar">AS</span>
            <div className="min-w-0">
              <div className="truncate font-mono text-xs font-bold text-[#f1f5f9]">{isAdmin ? 'A. SRINIVASAN' : 'R. DORJE'}</div>
              <div className="font-mono text-[9px] text-[#86efac]">{isAdmin ? 'CLEARANCE: LEVEL-5 (TOP SECRET)' : 'FIELD OPERATOR · G2'}</div>
            </div>
          </div>
          <Link href="/login" data-testid="link-switch-role" className="flex items-center gap-2 font-mono text-[11px] font-semibold text-[#8b9d90] hover:text-[#4ade80]">
            <LogOut size={13} /> Switch operational role
          </Link>
        </div>
      </div>
    </aside>
    {mobileOpen && <button aria-label="Close navigation" data-testid="button-close-navigation" className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs md:hidden" onClick={() => setMobileOpen(false)} />}
    <main className="md:pl-[252px]">
      <header className="sticky top-0 z-20 flex min-h-[64px] items-center justify-between border-b border-[#1a2d1f] bg-[#080f0a]/95 px-4 backdrop-blur-md md:px-8">
        <button className="mr-3 md:hidden text-[#4ade80]" data-testid="button-open-navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <div className="flex items-center gap-3">
          <LocalStatus />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block font-mono">
            <div className="text-xs font-bold text-[#f8fafc]">{isAdmin ? 'NATIONAL COMMAND CENTER · ORBAT' : 'LADAKH SECTOR · NORTH WATCH'}</div>
            <div className="text-[10px] text-[#86efac]">STATION: PRAHARI-HQ · AIR-GAPPED · <span className="text-[#f8fafc]">{clock} IST</span></div>
          </div>
          <span className="avatar avatar-light">{isAdmin ? 'AS' : 'RD'}</span>
        </div>
      </header>
      <div className="mx-auto max-w-[1540px] px-4 py-7 md:px-8 lg:px-10">{children}</div>
    </main>
  </div>;
}

function Home() {
  const [, setLocation] = useLocation();
  return (
    <div className="entry-screen min-h-[100dvh] overflow-hidden bg-[#0c1a10] text-[#efe8d5]">
      <div className="entry-grain" />
      <div className="absolute inset-0 opacity-25"><div className="entry-grid h-full w-full" /></div>
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* Header */}
        <header className="flex items-start justify-between px-6 py-6 md:px-10">
          <Wordmark light />
        </header>

        {/* Main hero area with map */}
        <div className="flex-1 relative flex flex-col items-center justify-center px-6 pb-4">
          {/* Radar rings + converging border scan */}
          <div className="entry-radar-container">
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
                <Satellite size={22} strokeWidth={1.7} />
              </div>
            </div>
            {/* Border sector labels */}
            <div className="entry-map-label" style={{ top: '8%', left: '50%', transform: 'translateX(-50%)' }}>
              <span className="entry-map-dot" /> LOC · NORTHERN SECTOR
            </div>
            <div className="entry-map-label" style={{ top: '32%', right: '5%' }}>
              <span className="entry-map-dot" /> COMMAND
            </div>
            <div className="entry-map-label" style={{ top: '55%', left: '5%' }}>
              <span className="entry-map-dot" /> WESTERN FRONTIER
            </div>
          </div>

          {/* Hero text overlay */}
          <div className="relative z-20 text-center max-w-4xl mx-auto">
            <div className="eyebrow mb-5 flex items-center justify-center gap-2 text-[#4ade80]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
              TRUSTED BORDER INTELLIGENCE
            </div>
            <h1 className="entry-title">SEE THE LINE:<br /><em>GUARD THE FRONTIER.</em></h1>
            <div className="mt-10 flex flex-col items-center gap-5">
              <button className="entry-cta" data-testid="button-enter-system" onClick={() => setLocation('/login')}>
                ENTER WORKSPACE <ArrowRight size={16} />
              </button>
              <button
                className="font-mono text-[11px] font-bold tracking-[.18em] text-[#86efac] uppercase hover:text-[#bbf7d0]"
                data-testid="button-read-brief"
                onClick={() => document.getElementById('entry-brief')?.scrollIntoView({ behavior: 'smooth' })}
              >
                SYSTEM BRIEF
              </button>
            </div>
          </div>
        </div>

        {/* Bottom stats section */}
        <div id="entry-brief" className="relative z-20 px-6 pb-5 md:px-10">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.2em] text-[#4ade80]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
            SYSTEM CONDITION
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[['48', 'RECORDED NODES ACTIVE'], ['08', 'BORDER SECTORS MONITORED'], ['SHA-256', 'CRYPTOGRAPHIC CHAIN']].map(([val, label]) => (
              <div key={label} className="entry-stat-card tactical-corner">
                <span className="block font-mono text-2xl font-extrabold text-[#f0fdf4]">{val}</span>
                <span className="block mt-1 font-mono text-[9px] font-bold tracking-[.12em] text-[#6b8a72] uppercase">{label}</span>
              </div>
            ))}
            <div className="entry-stat-card tactical-corner">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
                <span className="font-mono text-sm font-extrabold text-[#f0fdf4] uppercase">ALL OUTPOSTS NOMINAL</span>
              </div>
              <span className="block mt-1 font-mono text-[9px] font-bold tracking-[.12em] text-[#6b8a72] uppercase">AIR-GAP VERIFIED</span>
            </div>
          </div>
          {/* 4-pointed star decorative element */}
          <svg className="absolute right-10 bottom-16 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="#4b6350" aria-hidden="true">
            <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
          </svg>
          <footer className="mt-6 flex flex-wrap items-end justify-between gap-5 border-t border-[#1c3022] pt-4 font-mono text-[10px] font-bold tracking-[.12em] text-[#4b6350]">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
              SEC-STATUS: SOVEREIGN DEFENSE ENVIRONMENT
            </span>
            <span>BUILD 0.8.14</span>
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
      setNotice('ACCESS DENIED · INVALID OPERATOR OR ACCESS VECTOR');
      return;
    }
    setNotice('AUTHENTICATION SUCCESSFUL · SESSION ESTABLISHED');
    try {
      sessionStorage.setItem('prahari-role', account.role);
      sessionStorage.setItem('prahari-authenticated', 'true');
      sessionStorage.setItem('prahari-operator-id', key);
    } catch { }
    appendTacticalLog(`Authenticated ${account.role === 'admin' ? 'admin command' : 'ground officer'}`, 'Login');
    window.setTimeout(() => setLocation(account.role === 'admin' ? '/admin' : '/officer'), 500);
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

  return <div className="command-login-page">
    <div className="command-login-grid" aria-hidden="true" />
    <div className="command-login-scan command-login-scan-one" aria-hidden="true" />
    <div className="command-login-scan command-login-scan-two" aria-hidden="true" />

    <main className="command-login-main">
      <header className="command-login-header">
        <div className="command-login-emblem"><Hexagon size={24} strokeWidth={1.7} /></div>
        <div className="command-login-network">DEFENSE COMMAND NETWORK</div>
        <h1>PRAHARI NETRA</h1>
        <div className="command-login-subtitle">AI-POWERED BORDER SURVEILLANCE SYSTEM</div>
      </header>

      <section className="command-login-card">
        <div className="command-login-corners" aria-hidden="true" />
        <div className="command-login-card-head">
          <div>
            <div className="command-login-kicker">SECURE INSTANCE</div>
            <h2>Enter the secure instance</h2>
          </div>
          <span className="command-login-status"><span /> LOCAL</span>
        </div>

        <form onSubmit={submit} className="command-login-form">
          <label className="command-login-password-label command-login-operator-label">
            OPERATOR ID
            <input
              data-testid="input-operator-id"
              className="command-login-password"
              type="text"
              value={operatorId}
              onChange={(event) => { setOperatorId(event.target.value); setNotice(''); }}
              autoComplete="username"
              placeholder="OPERATOR.ADMIN"
              autoFocus
              spellCheck={false}
            />
          </label>

          <label className="command-login-password-label">
            ACCESS VECTOR
            <input
              data-testid="input-access-password"
              className="command-login-password"
              type="password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setNotice(''); }}
              autoComplete="current-password"
              placeholder="ENTER ACCESS VECTOR"
            />
          </label>

          {notice && <div className={cn('command-login-notice', notice.startsWith('ACCESS DENIED') && 'command-login-notice-error')} role="status">
            {notice.startsWith('ACCESS DENIED') ? <X size={15} /> : <CheckCircle2 size={15} />}
            <span>{notice}</span>
          </div>}

          <button className="command-login-submit" type="submit" data-testid="button-authenticate">
            <span>AUTHENTICATE</span><ArrowRight size={17} />
          </button>
        </form>

        <div className="command-login-security">
          <span><LockKeyhole size={12} /> Browser-local session</span>
          <span><ShieldCheck size={12} /> Role-scoped access</span>
          <span><Network size={12} /> Air-gapped telemetry</span>
        </div>
      </section>

      <button type="button" className="command-login-exit" data-testid="button-exit-system" onClick={exitSystem} aria-label="Exit Prahari Netra system">
        <LogOut size={12} />
        <span>EXIT SYSTEM</span>
      </button>

      <footer className="command-login-footer">
        <span>PN-LOCAL · AIR-GAPPED INSTANCE</span>
        <span>SECURITY PROTOCOL · ROLE ELEVATION LOGGED</span>
        <span>BUILD 0.8.14</span>
      </footer>
    </main>
  </div>;
}

function RoleCard({ mode, selected, onClick, onEnter }: { mode: Mode; selected: boolean; onClick: () => void; onEnter: () => void }) {
  const admin = mode === 'admin';
  return <div className={cn('role-card tactical-corner', selected && 'role-card-selected')} onClick={onClick} data-testid={`card-role-${mode}`}>
    <div className="flex items-start justify-between">
      <span className={cn('role-icon', admin ? 'role-icon-admin' : 'role-icon-officer')}>
        {admin ? <MonitorCog size={25} /> : <Crosshair size={25} />}
      </span>
      <span className={cn('h-4 w-4 rounded-full border-2', selected ? 'border-[#22c55e] bg-[#22c55e] shadow-[0_0_8px_#22c55e]' : 'border-[#2d4734]')} />
    </div>
    <div className="mt-8">
      <div className="eyebrow">{admin ? 'DEFENSE C4ISR COMMAND' : 'BORDER SECTOR POST'}</div>
      <h2 className="mt-2 text-2xl font-extrabold uppercase text-[#f8fafc]">{admin ? 'Admin Command' : 'Ground Officer'}</h2>
      <p className="mt-3 min-h-[48px] font-mono text-xs leading-relaxed text-[#94a3b8]">
        {admin ? 'Full multi-sector surveillance, incident review, health diagnostics, and evidentiary proof verification.' : 'Sector camera telemetry, alert acknowledgment, field evidence recording, and incident escalation.'}
      </p>
    </div>
    <button className="mt-7 flex items-center gap-2 font-mono text-xs font-bold text-[#4ade80] hover:text-[#86efac]" data-testid={`button-enter-role-${mode}`} onClick={(event) => { event.stopPropagation(); onEnter(); }}>
      Enter Station <ArrowRight size={14} />
    </button>
  </div>;
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
  return <><PageHeader eyebrow="COMMAND CONSOLE · MOBILE SENSOR" title="Phone live camera" action={<span className="status-label status-good"><Radio size={12} /> LOCAL WEBRTC</span>} />
    <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <section className="feed-panel">
        <div className="feed-top"><span className="flex items-center gap-2"><span className="signal-pulse" /> PHONE SENSOR · {remoteStream ? 'CONNECTED' : 'WAITING'}</span><span className="font-mono">{mode === 'visible' ? 'OPTICAL' : mode === 'night' ? 'NIGHT VISION' : 'IR PALETTE'}</span></div>
        <CameraFeed stream={remoteStream} night={mode === 'night'} thermal={mode === 'thermal'} aiEnabled className="min-h-[440px] h-[520px]" />
        <div className="flex flex-wrap gap-2 border-t border-[#4c6449] bg-[#18271e] p-4">
          {([['visible', 'Visible'], ['night', 'Night Vision'], ['thermal', 'Thermal']] as const).map(([value, label]) => <button key={value} onClick={() => setMode(value)} className={cn('action-button action-quiet', mode === value && 'bg-[#40543d]')}>{value === 'night' ? <Moon size={14} /> : value === 'thermal' ? <Crosshair size={14} /> : <Video size={14} />} {label}</button>)}
        </div>
      </section>
      <aside className="space-y-5">
        <section className="panel p-5">
          <div className="eyebrow">PAIR PHONE</div>
          <div className="mt-3 text-xs text-muted-foreground">Open the phone page on the same Wi-Fi, enter this room code, then allow camera access.</div>
          <div className="mt-5 border border-[#22c55e]/40 bg-[#07130b] p-5 text-center"><div className="font-mono text-[9px] tracking-[.22em] text-[#86efac]">ROOM CODE</div><div className="mt-2 font-mono text-4xl font-black tracking-[.25em] text-[#dcfce7]">{code || '------'}</div></div>
          <div className="mt-4 break-all border border-border bg-[#0b120d] p-3 font-mono text-[10px] text-[#94a3b8]">{phoneUrl}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="action-button action-secondary" onClick={() => navigator.clipboard?.writeText(phoneUrl)}><Check size={13} /> Copy phone link</button>
            {window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && <a className="action-button action-quiet" href={phoneUrl} target="_blank" rel="noreferrer"><ArrowRight size={13} /> Open</a>}
          </div>
          <div className="mt-2 text-[9px] text-muted-foreground">If this admin page is on localhost, replace &lt;LAPTOP-IP&gt; with the Vite Network IP shown in the terminal.</div>
          <div className="mt-3 text-[10px] text-[#86efac]">{status}</div>
        </section>
        <section className="panel p-5"><div className="eyebrow">NIGHT OPERATION</div><p className="mt-3 text-xs leading-5 text-muted-foreground">Night mode enhances low-light frames before YOLO inference while the display applies a night-vision treatment. Thermal mode is a visual IR-style palette; it does not turn a normal phone camera into a true thermal sensor.</p></section>
      </aside>
    </div>
  </>;
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
  return <div className="min-h-[100dvh] bg-[#050a06] p-4 text-[#f8fafc] sm:p-6"><div className="mx-auto max-w-3xl"><Wordmark /><section className="panel mt-6 p-5 sm:p-7"><div className="eyebrow">MOBILE SENSOR TRANSMITTER</div><h1 className="mt-2 text-2xl font-semibold">Phone live camera</h1><p className="mt-2 text-xs leading-5 text-[#94a3b8]">Keep this page open while the phone is transmitting. Use the rear camera for the best field view.</p><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"><input className="field-input" placeholder="ROOM CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /><button className="action-button action-primary" onClick={start}><Radio size={14} /> Start live</button></div><div className="mt-4 relative overflow-hidden border border-[#1f3827] bg-black"><video ref={videoRef} muted playsInline className={cn('w-full aspect-video object-cover', filter)} />{!stream && <div className="absolute inset-0 grid place-items-center p-8 text-center text-xs text-[#64748b]">Camera preview will appear here after permission is granted.</div>}</div><div className="mt-4 flex flex-wrap gap-2">{([['visible', 'Visible'], ['night', 'Night Vision'], ['thermal', 'Thermal']] as const).map(([value, label]) => <button key={value} onClick={() => setMode(value)} className={cn('action-button action-quiet', mode === value && 'bg-[#40543d]')}>{label}</button>)}</div><div className="mt-4 border border-[#22c55e]/30 bg-[#07130b] p-3 font-mono text-[10px] text-[#86efac]">{status}</div></section></div></div>;
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
  return <section className="panel tactical-corner mt-6 overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2e22] bg-[#09120d] px-5 py-3.5">
      <div><div className="eyebrow flex items-center gap-1.5"><Eye size={13} /> FIELD OFFICER LIVE ACTIVITY</div><h2 className="mt-0.5 font-mono text-sm font-bold tracking-wide text-[#f8fafc]">Ground Officer command visibility</h2></div>
      <span className={cn('status-label', online ? 'status-good' : 'status-bad')}><span className="signal-pulse" /> {online ? 'OFFICER ONLINE' : 'OFFICER OFFLINE'}</span>
    </div>
    <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><div className="eyebrow">OPERATOR</div><div className="mt-2 text-sm font-semibold">{presence?.name ?? 'R. DORJE'}</div><div className="mt-1 text-[10px] text-muted-foreground">{presence?.role ?? 'GROUND OFFICER · G2'}</div></div>
        <div><div className="eyebrow">CURRENT ACTIVITY</div><div className="mt-2 text-sm font-semibold">{online ? presence?.activity : 'No active field session'}</div></div>
        <div><div className="eyebrow">CURRENT VIEW</div><div className="mt-2 font-mono text-xs text-[#86efac]">{online ? presence?.path : '—'}</div>{online && presence?.camera && <div className="mt-1 text-[10px] text-muted-foreground">{presence.camera} · {presence.mode ?? 'LIVE'}</div>}</div>
        <div><div className="eyebrow">LAST HEARTBEAT</div><div className="mt-2 font-mono text-xs">{presence?.lastSeen ? new Date(presence.lastSeen).toLocaleTimeString() : '—'}</div><div className="mt-1 text-[10px] text-muted-foreground">Backend heartbeat · {presence?.lastSeen ? `${Math.max(0, Math.round((Date.now() - presence.lastSeen) / 1000))}s ago` : "—"}</div></div>
      </div>
      <div className="flex items-center"><span className="border border-[#22c55e]/30 bg-[#07130b] px-4 py-3 font-mono text-[10px] leading-5 text-[#86efac]">ADMIN VISIBILITY<br />LIVE FIELD STATUS<br />BACKEND SESSION · LIVE</span></div>
    </div>
  </section>;
}

function AdminOverview() {
  const [, setLocation] = useLocation();
  return <>
    {/* Military Status Ribbon */}
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-[#22442d] bg-[#0b1610] px-4 py-2.5 font-mono text-[11px] tactical-corner">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 font-bold text-[#4ade80]">
          <span className="signal-pulse" /> GRID COP: SECTOR 43R-VQ
        </span>
        <span className="text-[#36533d]">|</span>
        <span className="text-[#cbd5e1]">ACTIVE SENSORS: <strong className="text-[#86efac]">12 NODES</strong></span>
        <span className="text-[#36533d]">|</span>
        <span className="text-[#cbd5e1]">EDGE AI: <strong className="text-[#86efac]">YOLO-v11 ACTIVE</strong></span>
      </div>
      <div className="flex items-center gap-2.5 text-[10px]">
        <span className="border border-[#22c55e]/40 bg-[#122e1b] px-2 py-0.5 font-bold text-[#4ade80]">DEFCON 2</span>
        <span className="font-semibold text-[#94a3b8]">{nowISTTime()} IST (UTC+05:30)</span>
      </div>
    </div>

    <PageHeader
      eyebrow="C4ISR BORDER INTELLIGENCE · ORBAT COP"
      title="Tactical Command Overview"
      action={
        <div className="flex flex-wrap gap-2.5">
          <Button kind="secondary" testId="button-system-telemetry" onClick={() => { appendTacticalLog('Opened telemetry log'); setLocation('/admin/health'); }}>
            <SlidersHorizontal size={14} /> Telemetry log
          </Button>
          <Button kind="primary" testId="button-open-command-map" onClick={() => setLocation('/admin/map')}>
            <MapIcon size={14} /> Deploy radar map
          </Button>
        </div>
      }
    />

    <div className="overview-kpi-row">
      <Metric label="Active Threats" value="04" detail="02 critical · immediate command action" tone="alert" icon={AlertTriangle} />
      <Metric label="Sensor Mesh" value="11 / 12" detail="91.7% optical / thermal nodes reporting" tone="good" icon={Camera} />
    </div>

    <OfficerPresencePanel />

    {/* Main Radar Map & Threat Queue */}
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_.85fr]">
      <section className="panel tactical-corner overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2e22] bg-[#09120d] px-5 py-3.5">
          <div>
            <div className="eyebrow flex items-center gap-1.5">
              <Crosshair size={13} /> GEOSPATIAL INTELLIGENCE
            </div>
            <h2 className="mt-0.5 font-mono text-sm font-bold tracking-wide text-[#f8fafc]">Border Sensor Network Radar Frame</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] text-[#86efac]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_4px_#22c55e]" /> 8 BORDER SECTORS
            </span>
            <Link href="/admin/map" data-testid="link-view-full-map" className="font-mono text-xs font-bold text-[#4ade80] hover:text-[#86efac]">
              Expand Radar HUD <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          </div>
        </div>
        <IndiaMap compact onCamera={(id) => setLocation(`/admin/cameras/${id}`)} />
      </section>

      <section className="panel tactical-corner flex flex-col">
        <div className="flex items-center justify-between border-b border-[#1c2e22] bg-[#09120d] px-5 py-3.5">
          <div>
            <div className="eyebrow flex items-center gap-1.5">
              <Flag size={13} /> COMMAND ATTENTION
            </div>
            <h2 className="mt-0.5 font-mono text-sm font-bold tracking-wide text-[#f8fafc]">Priority Threat Queue</h2>
          </div>
          <span className="border border-[#ef4444]/40 bg-[#2b100f] px-2 py-0.5 font-mono text-[10px] font-bold text-[#fca5a5]">
            4 ELEVATED
          </span>
        </div>
        <div className="divide-y divide-[#17261c] flex-1">
          {incidents.slice(0, 4).map((incident) => (
            <Link
              href={`/admin/incidents?focus=${incident.id}`}
              key={incident.id}
              data-testid={`row-priority-${incident.id}`}
              className="block px-5 py-3.5 transition-colors hover:bg-[#112015] border-l-2 border-transparent hover:border-l-[#22c55e]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cn('severity', `severity-${incident.severity.toLowerCase()}`)}>
                  {incident.severity} · THREAT
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#86efac]">{incident.time.split(' · ')[1]} HRS</span>
              </div>
              <div className="mt-2 text-sm font-bold text-[#f8fafc]">{incident.title}</div>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-[#94a3b8]">
                <span>{incident.sector} SECTOR · {incident.camera}</span>
                <span className="border border-[#233f2c] bg-[#0e1a12] px-1.5 py-0.5 text-[#86efac]">{incident.state}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="border-t border-[#1c2e22] bg-[#080f0a] p-3 text-center">
          <Link href="/admin/incidents" className="font-mono text-xs font-bold text-[#4ade80] hover:text-[#86efac]">
            View All Incident Records (5 Total) <ArrowRight size={13} className="ml-1 inline" />
          </Link>
        </div>
      </section>
    </div>

    {/* Bottom Grid: Recent Detections & System Readiness */}
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <RecentDetections />
      <SystemReadiness />
    </div>
  </>;
}

function RecentDetections() {
  return <section className="panel tactical-corner">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2e22] bg-[#09120d] px-5 py-3.5">
      <div>
        <div className="eyebrow flex items-center gap-1.5">
          <Target size={13} /> AI INFERENCE STREAM
        </div>
        <h2 className="mt-0.5 font-mono text-sm font-bold tracking-wide text-[#f8fafc]">Target Classification Log</h2>
      </div>
      <Link href="/admin/analytics" data-testid="link-detections-analytics" className="font-mono text-xs font-bold text-[#4ade80] hover:text-[#86efac]">
        Inference Analytics <ArrowRight size={13} className="ml-1 inline" />
      </Link>
    </div>
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Time (IST)</th>
            <th>Target Class</th>
            <th>Confidence</th>
            <th>Sensor Node</th>
            <th>Threat</th>
          </tr>
        </thead>
        <tbody>
          {detections.map(([time, type, confidence, camera, threat]) => (
            <tr key={time}>
              <td className="font-mono text-[11px] font-bold text-[#cbd5e1]">{time}</td>
              <td>
                <span className={cn('class-chip', type === 'PERSON' ? 'border-[#22c55e]/50 text-[#4ade80] bg-[#0f2416]' : type === 'VEHICLE' ? 'border-[#f59e0b]/50 text-[#fbbf24] bg-[#241a0d]' : 'border-[#06b6d4]/50 text-[#38bdf8] bg-[#0c1f24]')}>
                  [{type}]
                </span>
              </td>
              <td className="font-mono text-[11px] font-semibold text-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <span>{confidence}</span>
                  <div className="h-1.5 w-16 bg-[#18291d] rounded-full overflow-hidden">
                    <div className="h-full bg-[#22c55e]" style={{ width: confidence }} />
                  </div>
                </div>
              </td>
              <td className="font-mono text-[11px] font-bold text-[#86efac]">{camera}</td>
              <td>
                <span className={cn('font-mono text-[10px] font-bold', threat === 'Critical' ? 'text-[#ef4444]' : threat === 'High' ? 'text-[#f59e0b]' : 'text-[#86efac]')}>
                  {threat}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>;
}

function SystemReadiness() {
  const readinessItems = [
    { label: 'Tactical Camera Mesh', value: '98.4%', tone: 'good', segments: 10, active: 10, note: '11 of 12 sensor nodes active' },
    { label: 'Local YOLO AI Latency', value: '184 ms', tone: 'good', segments: 10, active: 9, note: 'Inference queue nominal' },
    { label: 'Evidence Cryptographic Storage', value: '68.2%', tone: 'good', segments: 10, active: 7, note: 'Tamper-evident SHA-256 stream' },
    { label: 'Gujarat Sector Uplink', value: 'OFFLINE', tone: 'alert', segments: 10, active: 2, note: 'Heartbeat threshold exceeded' },
  ];

  return <section className="panel tactical-corner">
    <div className="flex items-center justify-between border-b border-[#1c2e22] bg-[#09120d] px-5 py-3.5">
      <div>
        <div className="eyebrow flex items-center gap-1.5">
          <Activity size={13} /> SUBSYSTEM READINESS
        </div>
        <h2 className="mt-0.5 font-mono text-sm font-bold tracking-wide text-[#f8fafc]">Hardware & Uplink Diagnostics</h2>
      </div>
      <span className="border border-[#22c55e]/40 bg-[#122e1b] px-2 py-0.5 font-mono text-[10px] font-bold text-[#4ade80]">
        MESH: 94.2%
      </span>
    </div>
    <div className="space-y-4 p-5">
      {readinessItems.map((item) => (
        <div key={item.label} className="border border-[#17281d] bg-[#08100b] p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-[#f1f5f9]">{item.label}</span>
            <span className={cn('font-bold tracking-wide', item.tone === 'alert' ? 'text-[#ef4444]' : 'text-[#4ade80]')}>
              {item.value}
            </span>
          </div>
          {/* Segmented Military LED Bar */}
          <div className="flex gap-1 h-2 my-2">
            {Array.from({ length: item.segments }).map((_, i) => {
              const isFilled = i < item.active;
              const segColor = item.tone === 'alert'
                ? 'bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.7)]'
                : 'bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.7)]';
              return (
                <span
                  key={i}
                  className={cn(
                    'flex-1 rounded-[1px] transition-all',
                    isFilled ? segColor : 'bg-[#142318]'
                  )}
                />
              );
            })}
          </div>
          <div className="flex justify-between font-mono text-[10px] text-[#8fa087]">
            <span>{item.note}</span>
            <span className={cn('uppercase font-bold', item.tone === 'alert' ? 'text-[#ef4444]' : 'text-[#86efac]')}>
              {item.tone === 'alert' ? 'UPLINK LOST' : 'CHANNEL NOMINAL'}
            </span>
          </div>
        </div>
      ))}
      <Link
        href="/admin/health"
        data-testid="link-open-health"
        className="mt-2 flex items-center justify-between border-t border-[#1c2e22] pt-3 font-mono text-xs font-bold text-[#4ade80] hover:text-[#86efac]"
      >
        <span>Open Advanced Health Diagnostics</span>
        <ArrowRight size={13} className="ml-1 inline" />
      </Link>
    </div>
  </section>;
}

function AdminMap() {
  const [, setLocation] = useLocation();
  const [sector, setSector] = useState('All sectors');
  const [selected, setSelected] = useState('');
  const sectors = ['All sectors', ...Array.from(new Set(cameras.map((camera) => camera.sector)))];
  const camera = cameras.find((item) => item.id === selected);
  return <><PageHeader eyebrow="COMMAND CONSOLE · GEOSPATIAL" title="Operations map" action={<div className="flex gap-2"><Button kind="secondary" testId="button-recenter-map" onClick={() => setSelected('')}><Target size={14} /> Recenter</Button><Button kind="primary" testId="button-map-export" onClick={() => { appendTacticalLog('Exported operations map view'); exportCsv(`prahari-map-${Date.now()}.csv`, [['Camera', 'Sector', 'Site', 'Status', 'Health'], ...cameras.map(c => [c.id, c.sector, c.site, c.status, String(c.health)])]); }}><Download size={14} /> Export view</Button></div>} /><div className="grid gap-5 xl:grid-cols-[1fr_300px]"><div className="panel p-2"><IndiaMap sector={sector} onCamera={setSelected} /></div><aside className="panel p-5"><div className="eyebrow">FILTER NETWORK</div><label className="field-label mt-5">Sector<select className="field-input" data-testid="select-map-sector" value={sector} onChange={(event) => setSector(event.target.value)}>{sectors.map((item) => <option key={item}>{item}</option>)}</select></label><div className="my-6 border-y border-border py-5"><div className="eyebrow mb-3">LEGEND</div><div className="space-y-3 text-xs"><div className="flex justify-between"><span className="flex items-center gap-2"><StatusDot /> Online</span><span>09</span></div><div className="flex justify-between"><span className="flex items-center gap-2"><StatusDot status="Degraded" /> Degraded</span><span>02</span></div><div className="flex justify-between"><span className="flex items-center gap-2"><StatusDot status="Offline" /> Offline</span><span>01</span></div></div></div>{camera ? <div className="border border-[#b4b596] bg-[#e8e5d3] p-4"><div className="flex items-center justify-between"><span className="class-chip">{camera.id}</span><StatusDot status={camera.status} /></div><h3 className="mt-3 text-sm font-semibold">{camera.site}</h3><p className="mt-1 text-xs text-muted-foreground">{camera.sector}</p><button className="mt-4 text-xs font-semibold text-[#71885b]" data-testid="button-open-selected-camera" onClick={() => setLocation(`/admin/cameras/${camera.id}`)}>Open camera <ArrowRight size={13} className="ml-1 inline" /></button></div> : <div className="empty-state"><MapIcon size={24} /><p>Select a node on the map to inspect its sector context.</p></div>}</aside></div></>;
}

function AdminCameras() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const filtered = cameras.filter((camera) => (filter === 'All' || camera.status === filter) && `${camera.id} ${camera.sector} ${camera.site}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeader eyebrow="COMMAND CONSOLE · SENSOR NETWORK" title="Camera explorer" action={<Button kind="secondary" testId="button-camera-refresh" onClick={() => { appendTacticalLog('Refreshed camera mesh'); window.location.reload(); }}><RefreshCw size={14} /> Refresh mesh</Button>} /><div className="panel"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><label className="relative block min-w-[240px] flex-1"><Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" /><input data-testid="input-camera-search" className="field-input pl-9" placeholder="Search node, sector, or site" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="flex gap-1">{['All', 'Online', 'Degraded', 'Offline'].map((item) => <button key={item} onClick={() => setFilter(item)} className={cn('filter-button', filter === item && 'filter-button-active')}>{item}</button>)}</div></div><div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((camera) => <button key={camera.id} onClick={() => setLocation(`/admin/cameras/${camera.id}`)} className="camera-card overflow-hidden text-left"><div className="relative"><CameraFeed cameraId={camera.id} thermal aiEnabled className="pointer-events-none h-[210px]" /><div className="absolute left-3 top-3 z-10 border border-[#c2d39a]/70 bg-[#18271e]/80 px-2 py-1 font-mono text-[9px] text-[#deebc1]">RECORDED FEED</div><span className="absolute bottom-3 right-3 z-10 flex items-center gap-1 font-mono text-[9px] text-[#d7dfc2]"><span className="signal-pulse" /> {camera.status}</span></div><div className="p-4"><div className="flex justify-between gap-3"><div><div className="font-mono text-[10px] text-muted-foreground">{camera.id}</div><h3 className="mt-1 text-sm font-semibold">{camera.site}</h3></div><StatusDot status={camera.status} /></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[10px]"><span><span className="block text-muted-foreground">SECTOR</span><span className="mt-1 block">{camera.sector}</span></span><span><span className="block text-muted-foreground">HEALTH</span><span className="mt-1 block">{camera.health || '—'}%</span></span><span><span className="block text-muted-foreground">AI / 24H</span><span className="mt-1 block">{camera.detections}</span></span></div></div></button>)}</div></div></>;
}

function CameraDetail() {
  const { id } = useParams<{ id: string }>();
  const camera = cameras.find((item) => item.id === id) ?? cameras[0];
  const [, setLocation] = useLocation();
  const [thermal, setThermal] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [note, setNote] = useState('');
  return <><PageHeader eyebrow={`CAMERA NODE · ${camera.id}`} title={camera.site} action={<div className="flex gap-2"><Button kind="secondary" testId="button-camera-back" onClick={() => setLocation('/admin/cameras')}><ArrowLeft size={14} /> All cameras</Button><Button kind="primary" testId="button-create-incident" onClick={() => { appendTacticalLog(`Created incident from ${camera.id}`, camera.sector); setNote('Incident record created from camera context. Added to local tactical log.'); }}>Create incident <Flag size={14} /></Button></div>} />{note && <div className="mb-5 flex items-center justify-between border border-[#71885b]/30 bg-[#71885b]/10 px-4 py-3 text-xs text-[#526c43]">{note}<button onClick={() => setNote('')}><X size={14} /></button></div>}<div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><div className="space-y-6"><section className="feed-panel"><div className="feed-top"><span className="flex items-center gap-2"><span className="signal-pulse" /> {camera.id} · {thermal ? 'THERMAL' : 'VISIBLE CCTV'}</span><span className="font-mono">LOCAL PLAYBACK · {thermal ? 'IR PALETTE' : 'OPTICAL'}</span></div><CameraFeed cameraId={camera.id} thermal={thermal} aiEnabled={aiEnabled} className="min-h-[440px] h-[480px] xl:h-[520px]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#4c6449] bg-[#18271e] px-4 py-3 text-[#b9c9a1]"><div className="flex gap-2"><button onClick={() => setThermal(false)} className={cn('action-button action-quiet', !thermal && 'bg-[#40543d]')}><Video size={14} /> Visible CCTV</button><button onClick={() => setThermal(true)} className={cn('action-button action-quiet', thermal && 'bg-[#40543d]')}><Crosshair size={14} /> Thermal</button><button onClick={() => setAiEnabled(!aiEnabled)} className={cn('action-button action-quiet', aiEnabled && 'bg-[#40543d]')}>{aiEnabled ? 'AI overlay ON' : 'AI overlay OFF'}</button></div><span className="font-mono text-[10px]">LOCAL RECORDING · AI INFERENCE</span></div></section><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">EVENT TIMELINE</div><h2 className="mt-1 text-base font-semibold">Detection and operator activity</h2></div><div className="timeline p-5">{[['14:32:19', 'AI detection', 'Person class above confidence threshold', 'AI ENGINE'], ['14:31:58', 'AI detection', 'Vehicle class entered geofence corridor', 'AI ENGINE'], ['14:30:44', 'Heartbeat', 'Node reported nominal health at 98%', 'SYSTEM'], ['13:48:10', 'Operator note', 'Camera context opened', 'COMMAND']].map(([time, title, text, actor]) => <div className="timeline-item" key={time}><span className="timeline-dot" /><div className="flex flex-wrap justify-between gap-2"><span className="text-xs font-semibold">{title}</span><span className="font-mono text-[10px] text-muted-foreground">{time} · {actor}</span></div><p className="mt-1 text-xs text-muted-foreground">{text}</p></div>)}</div></section></div><aside className="space-y-6"><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">NODE METADATA</div><h2 className="mt-1 text-base font-semibold">Trust and connectivity</h2></div><div className="divide-y divide-border">{[['Status', camera.status], ['Visible source', cameraRecordings[camera.id]?.visible ?? 'Unavailable'], ['Thermal mode', 'Derived IR palette · same camera recording'], ['Device certificate', 'Valid · 41 days'], ['mTLS channel', 'Established'], ['Firmware', 'PN-CAM 3.14.2'], ['Last heartbeat', camera.heartbeat]].map(([key, value]) => <div key={key} className="flex justify-between gap-3 px-5 py-3 text-xs"><span className="text-muted-foreground">{key}</span><span className="max-w-[60%] text-right font-medium break-all">{value}</span></div>)}</div></section><section className="panel p-5"><div className="eyebrow">AI ACTIVITY</div><div className="mt-4 flex items-end justify-between"><span className="text-3xl font-semibold">{camera.detections}</span><span className="text-xs text-muted-foreground">events / last 24h</span></div><div className="mini-bars mt-5">{[25, 42, 31, 55, 42, 68, 48, 72, 63, 86, 54, 78].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div><Link href="/admin/evidence" className="mt-5 block text-xs font-semibold text-[#71885b]">Inspect linked evidence <ArrowRight size={13} className="ml-1 inline" /></Link></section></aside></div></>;
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
  return <><PageHeader eyebrow="COMMAND CONSOLE · INCIDENT MANAGEMENT" title="Incident timeline" action={<Button kind="secondary" testId="button-export-incidents" onClick={() => { appendTacticalLog('Exported incident log'); exportCsv(`prahari-incidents-${Date.now()}.csv`, [['ID', 'Time', 'Sector', 'Title', 'Severity', 'Camera', 'State', 'Evidence', 'Kind'], ...liveIncidents.map(i => [i.id, i.liveTime, i.sector, i.title, i.severity, i.camera, i.state, i.evidence, i.kind]), ...localLogs.map(l => [l.id, new Date(l.at).toLocaleTimeString('en-IN'), l.context, l.action, 'INFO', '-', '-', '-', 'TACTICAL LOG'])]); }}><Download size={14} /> Export log</Button>} />
    <div className="panel">
      <div className="flex flex-wrap gap-3 border-b border-border p-4">
        <label className="relative min-w-[240px] flex-1"><Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" /><input className="field-input pl-9 pr-9" data-testid="input-incident-search" placeholder="Search ID, title, camera, sector, class, state…" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button type="button" className="absolute right-2 top-2 text-muted-foreground hover:text-foreground" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</label>
        <select className="field-input w-auto" data-testid="select-incident-severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>{['All', 'Critical', 'High', 'Medium', 'Low'].map((value) => <option key={value}>{value}</option>)}</select>
      </div>
      <div className="divide-y divide-border">
        {filtered.map((item) => <div key={item.id} className="incident-row relative" data-testid={`row-incident-${item.id}`}>
          <div className="flex min-w-0 flex-1 gap-4"><div className="hidden w-14 shrink-0 pt-1 text-right font-mono text-[10px] text-muted-foreground sm:block">{item.liveTime}</div><div className="incident-line" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">{item.id}</span><span className={cn('severity', `severity-${item.severity.toLowerCase()}`)}>{item.severity}</span></div><h3 className="mt-2 text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground">{item.sector} · {item.camera} · {item.kind}</p></div></div>
          <div className="hidden items-end gap-3 text-right md:flex md:flex-col"><span className="status-label">{item.state}</span><span className="flex items-center gap-1 text-[10px] text-[#71885b]"><ShieldCheck size={12} /> {item.evidence}</span></div>
          <button className="self-center text-muted-foreground hover:text-foreground" data-testid={`button-incident-menu-${item.id}`} onClick={() => setSelected(selected === item.id ? null : item.id)} aria-label={`Open actions for ${item.id}`}><MoreHorizontal size={17} /></button>
          {selected === item.id && <div className="absolute right-5 z-20 mt-24 w-48 border border-[#1f3827] bg-[#08120c] p-2 shadow-2xl"><button className="block w-full px-3 py-2 text-left text-xs hover:bg-[#102216]" onClick={() => { appendTacticalLog(`Opened incident ${item.id}`); setSelected(null); }}>Open incident</button><button className="block w-full px-3 py-2 text-left text-xs hover:bg-[#102216]" onClick={() => { appendTacticalLog(`Acknowledged ${item.id}`); setSelected(null); }}>Acknowledge</button><button className="block w-full px-3 py-2 text-left text-xs hover:bg-[#102216]" onClick={() => { appendTacticalLog(`Escalated ${item.id}`); setSelected(null); }}>Escalate to command</button></div>}
        </div>)}
      </div>
      {!filtered.length && <div className="empty-state m-5"><Search size={23} /><p>No incidents match the current view.</p><button className="action-button action-secondary" onClick={() => { setQuery(''); setSeverity('All'); }}>Clear filters</button></div>}
      <div className="border-t border-border px-5 py-3 font-mono text-[10px] text-muted-foreground">LIVE STREAM · {nowISTDateTime()} IST · {filtered.length} matching records · {localLogs.length} operator log entries</div>
    </div></>;
}

function AdminEvidence() {
  const [tampered, setTampered] = useState(false);
  const [verified, setVerified] = useState(false);
  return <><PageHeader eyebrow="ASSURANCE · PROVENANCE" title="Evidence vault" action={<Button kind="secondary" testId="button-export-evidence" onClick={() => { appendTacticalLog('Exported evidence manifest', 'Evidence Vault'); exportCsv(`prahari-evidence-${Date.now()}.csv`, [['Evidence ID', 'Node', 'State'], ['EV-2417-A', 'PN-LAD-04', 'Verified'], ['EV-2416-B', 'PN-RAJ-02', 'Verified'], ['EV-2415-A', 'PN-ARP-08', 'Pending'], ['EV-2409-C', 'PN-GUJ-06', 'Compromised record']]); }}><Download size={14} /> Export manifest</Button>} /><div className="mb-5 flex items-start gap-3 border border-[#b27a3d]/35 bg-[#b27a3d]/10 p-4 text-xs text-[#76562e]"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><div><strong>Controlled tamper localnstration.</strong> One fictional object below can be marked tampered to show how the verification workflow surfaces a chain break. No files leave this browser.</div></div><div className="grid gap-6 xl:grid-cols-[1fr_360px]"><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">OBJECT MANIFEST · 05 RECORDS</div><h2 className="mt-1 text-base font-semibold">Evidence objects</h2></div><div className="divide-y divide-border">{[['EV-2417-A', 'PN-LAD-04', '18 Jun · 14:32:21', 'Verified'], ['EV-2416-B', 'PN-RAJ-02', '18 Jun · 13:48:09', 'Verified'], ['EV-2415-A', 'PN-ARP-08', '18 Jun · 12:06:44', 'Pending'], ['EV-2409-C', 'PN-GUJ-06', '17 Jun · 08:11:02', tampered ? 'Tampered' : 'Compromised record']].map(([id, node, time, state]) => <div className="flex flex-wrap items-center gap-4 px-5 py-4" key={id}><span className={cn('grid h-8 w-8 place-items-center border', state === 'Tampered' || state === 'Compromised record' ? 'border-[#a34e42]/40 text-[#a34e42]' : 'border-[#71885b]/40 text-[#71885b]')}><FileKey2 size={15} /></span><div className="min-w-[130px] flex-1"><div className="font-mono text-[10px]">{id}</div><div className="mt-1 text-xs text-muted-foreground">{node} · {time}</div></div><span className={cn('status-label', state === 'Verified' ? 'status-good' : state === 'Pending' ? 'status-warn' : 'status-bad')}>{state}</span><button className="text-xs font-semibold text-[#71885b]" data-testid={`button-verify-${id}`} onClick={() => setVerified(true)}>Verify <Check size={13} className="ml-1 inline" /></button></div>)}</div></section><section className="space-y-5"><div className="panel p-5"><div className="eyebrow">VERIFICATION RESULT</div><div className={cn('mt-4 flex items-center gap-3 border p-4', tampered ? 'border-[#a34e42]/50 bg-[#a34e42]/10' : 'border-[#71885b]/40 bg-[#71885b]/10')}><span className={cn('grid h-9 w-9 place-items-center rounded-full', tampered ? 'bg-[#a34e42] text-[#f8ead9]' : 'bg-[#71885b] text-[#eff2dc]')}>{tampered ? <X size={18} /> : <BadgeCheck size={18} />}</span><div><div className="text-sm font-semibold">{tampered ? 'Chain break detected' : 'Chain verified'}</div><div className="mt-1 text-xs text-muted-foreground">{verified ? 'EV-2417-A checked just now.' : tampered ? 'EV-2409-C does not match its signed digest.' : 'Last full verification · 14:35:08 IST'}</div></div></div><div className="mt-5 space-y-3 text-xs">{[['SHA-256 digest', tampered ? 'Mismatch' : 'Matched'], ['Operator signature', 'Ed25519 · valid'], ['Device certificate', 'PN-CAM-04 · valid'], ['mTLS session', 'Established'], ['RBAC custody', '2-of-2 recorded']].map(([label, value]) => <div className="flex items-center justify-between border-b border-border pb-2" key={label}><span className="text-muted-foreground">{label}</span><span className={tampered && label === 'SHA-256 digest' ? 'text-[#a34e42]' : 'text-[#526c43]'}>{value}</span></div>)}</div></div><div className="panel p-5"><div className="eyebrow">EVIDENCE CONTROL</div><p className="mt-3 text-xs leading-5 text-muted-foreground">Toggle a fictional compromised object to localnstrate chain-of-custody alerting.</p><button className={cn('mt-4 w-full border px-3 py-2.5 text-xs font-semibold', tampered ? 'border-[#71885b] text-[#526c43]' : 'border-[#a34e42]/50 text-[#a34e42]')} data-testid="button-controlled-tamper" onClick={() => { setTampered(!tampered); setVerified(false); }}>{tampered ? 'Restore verified local state' : 'Mark EV-2409-C as tampered'}</button></div></section></div></>;
}

function AdminAnalytics() {
  const [windowSize, setWindowSize] = useState('24 hours');
  return <><PageHeader eyebrow="ASSURANCE · PATTERN REVIEW" title="Operational analytics" action={<select className="field-input w-auto" data-testid="select-analytics-window" value={windowSize} onChange={(event) => setWindowSize(event.target.value)}>{['24 hours', '7 days', '30 days'].map((value) => <option key={value}>{value}</option>)}</select>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Events reviewed" value="126" detail={`Window · ${windowSize}`} icon={Eye} /><Metric label="Review completion" value="83.6%" detail="105 of 126 triaged" tone="good" icon={CheckCircle2} /><Metric label="Median confidence" value="88.4%" detail="Across person / vehicle" icon={Sparkles} /><Metric label="Alert precision" value="76.1%" detail="Based on reviewed events" tone="good" icon={Target} /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><section className="panel p-5"><div className="eyebrow">EVENT TREND · {windowSize.toUpperCase()}</div><div className="mt-2 flex items-end justify-between"><h2 className="text-base font-semibold">Detection volume</h2><span className="text-xs text-[#71885b]">+18.2%</span></div><div className="line-chart mt-7"><div className="chart-lines" />{[32, 44, 40, 58, 49, 73, 62, 82, 66, 91, 77, 84, 72, 94].map((height, i) => <span key={i} style={{ height: `${height}%` }}><i /></span>)}</div><div className="mt-3 flex justify-between font-mono text-[9px] text-muted-foreground"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span></div></section><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">SECTOR ACTIVITY</div><h2 className="mt-1 text-base font-semibold">Events by sector</h2></div><div className="space-y-4 p-5">{[['Ladakh', '38', 86], ['Rajasthan', '27', 66], ['Punjab', '18', 51], ['Arunachal Pradesh', '16', 44], ['Other sectors', '27', 67]].map(([label, value, width]) => <div key={label}><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span className="font-mono text-[10px] text-muted-foreground">{value}</span></div><div className="h-2 bg-[#d7d5c1]"><div className="h-full bg-[#71885b]" style={{ width: `${width}%` }} /></div></div>)}</div></section></div><div className="mt-6 grid gap-6 md:grid-cols-2"><section className="panel p-5"><div className="eyebrow">UPTIME</div><h2 className="mt-1 text-base font-semibold">Camera availability</h2><div className="mt-6 grid grid-cols-6 gap-2">{cameras.map((camera) => <div key={camera.id} className="text-center"><div className={cn('uptime-block', camera.status === 'Online' ? 'bg-[#71885b]' : camera.status === 'Degraded' ? 'bg-[#b27a3d]' : 'bg-[#a34e42]')} /><div className="mt-2 truncate font-mono text-[8px] text-muted-foreground">{camera.id.replace('PN-', '')}</div></div>)}</div></section><section className="panel p-5"><div className="eyebrow">REVIEW QUEUE</div><h2 className="mt-1 text-base font-semibold">AI confidence bands</h2><div className="mt-6 space-y-4">{[['High confidence · 90–100%', '68%', 'w-[68%]'], ['Review band · 70–89%', '24%', 'w-[24%]'], ['Low confidence · below 70%', '08%', 'w-[8%]']].map(([label, value, width], i) => <div key={label}><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span>{value}</span></div><div className="h-2 bg-[#d7d5c1]"><div className={cn('h-full', i === 0 ? 'bg-[#71885b]' : i === 1 ? 'bg-[#b27a3d]' : 'bg-[#a34e42]', width)} /></div></div>)}</div></section></div></>;
}

function AdminHealth() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [checks, setChecks] = useState<Array<{ label: string; value: string; detail: string; tone: 'good' | 'warn' | 'bad'; Icon: typeof Activity }>>([
    { label: 'Camera mesh', value: 'CHECKING', detail: 'Testing local recording assets…', tone: 'warn', Icon: Wifi },
    { label: 'AI inference', value: 'CHECKING', detail: 'Contacting local YOLO service…', tone: 'warn', Icon: Sparkles },
    { label: 'API relay', value: 'CHECKING', detail: 'Contacting local backend…', tone: 'warn', Icon: Network },
    { label: 'Evidence storage', value: 'CHECKING', detail: 'Reading browser-local storage…', tone: 'warn', Icon: Database },
    { label: 'Browser network', value: navigator.onLine ? 'ONLINE' : 'OFFLINE', detail: navigator.onLine ? 'Browser reports network connectivity.' : 'Browser reports offline mode.', tone: navigator.onLine ? 'good' : 'bad', Icon: navigator.onLine ? Wifi : WifiOff },
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
    const storageDetail = `${(storageBytes / 1024).toFixed(1)} KB currently used by local browser data`;
    const elapsed = Math.round(performance.now() - started);
    setLatency(elapsed);
    setChecks([
      { label: 'Camera mesh', value: `${meshOk} / ${cameras.length}`, detail: `${recordingResults.filter(Boolean).length} local recording assets reachable`, tone: meshOk === cameras.length ? 'good' : meshOk > 0 ? 'warn' : 'bad', Icon: Wifi },
      { label: 'AI inference', value: aiOk ? 'OPERATIONAL' : 'OFFLINE', detail: aiDetail, tone: aiOk ? 'good' : 'bad', Icon: Sparkles },
      { label: 'API relay', value: apiOk ? 'OPERATIONAL' : 'OFFLINE', detail: apiDetail, tone: apiOk ? 'good' : 'bad', Icon: Network },
      { label: 'Evidence storage', value: `${(storageBytes / 1024).toFixed(1)} KB`, detail: storageDetail, tone: 'good', Icon: Database },
      { label: 'Browser network', value: navigator.onLine ? 'ONLINE' : 'OFFLINE', detail: navigator.onLine ? 'Browser reports network connectivity.' : 'Browser reports offline mode.', tone: navigator.onLine ? 'good' : 'bad', Icon: navigator.onLine ? Wifi : WifiOff },
    ]);
    appendTacticalLog(`System health check completed in ${elapsed} ms`, 'System Health');
    setLastChecked(Date.now());
    setRefreshing(false);
  };
  useEffect(() => { runChecks(); }, []);
  return <><PageHeader eyebrow="CONTROL · HEALTH TELEMETRY" title="System health" detail="Live diagnostics against this browser, local Vite assets, backend relay, and local YOLO service. No fabricated health values." action={<Button kind="secondary" testId="button-refresh-health" onClick={runChecks} disabled={refreshing}><RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Checking…' : 'Run checks'}</Button>} />
    <div className="grid gap-4 md:grid-cols-2">{checks.map(({ label, value, detail, tone, Icon }) => <div className="health-card" key={label}><div className={cn('health-icon', tone !== 'good' && 'health-icon-warn')}><Icon size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">{label}</h2><span className={cn('status-label', tone === 'good' ? 'status-good' : tone === 'warn' ? 'status-warn' : 'status-bad')}><StatusDot status={tone === 'good' ? 'Online' : tone === 'warn' ? 'Degraded' : 'Offline'} /> {value}</span></div><p className="mt-2 text-xs text-muted-foreground">{detail}</p></div></div>)}</div>
    <div className="mt-4 flex flex-wrap items-center justify-between border border-[#1c3323] bg-[#08120c] px-4 py-3 font-mono text-[10px] text-[#86efac]"><span>LAST DIAGNOSTIC · {lastChecked ? new Date(lastChecked).toLocaleTimeString('en-IN') : 'RUNNING'}</span><span>{latency !== null ? `CHECK CYCLE · ${latency} ms` : 'CHECK CYCLE · —'}</span></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="panel p-5"><div className="eyebrow">LIVE DIAGNOSTIC HISTORY</div><h2 className="mt-1 text-base font-semibold">Recent health checks</h2><div className="mt-5 space-y-3">{readTacticalLogs().filter(l => l.context === 'System Health').slice(0, 8).map(log => <div className="flex gap-3 text-xs" key={log.id}><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" /><span><span className="font-mono text-[10px] text-muted-foreground">{new Date(log.at).toLocaleTimeString('en-IN')}</span> · {log.action}</span></div>)}</div></section><section className="panel p-5"><div className="eyebrow">OPERATIONAL NOTE</div><h2 className="mt-1 text-base font-semibold">What this check actually tests</h2><div className="mt-4 space-y-3 text-xs text-muted-foreground"><p>• Camera mesh: each configured MP4 is requested from the running Vite server.</p><p>• AI inference: the live FastAPI /health endpoint is queried.</p><p>• API relay: the Express process reports its real uptime and Node version.</p><p>• Evidence storage: current browser-local storage usage is measured.</p></div></section></div></>;
}

function AdminAccess() {
  const [audit, setAudit] = useState(false);
  const users = [['A. Srinivasan', 'Command Admin', 'Active', '18 Jun · 14:31'], ['R. Dorje', 'Ground Officer · G2', 'Active', '18 Jun · 14:28'], ['N. Chatterjee', 'Evidence Reviewer', 'Active', '17 Jun · 20:14'], ['S. Mehta', 'System Auditor', 'Suspended', '04 Jun · 11:02']];
  return <><PageHeader eyebrow="CONTROL · ROLE SEPARATION" title="Access & audit" action={<Button kind="primary" testId="button-invite-user" onClick={() => setAudit(true)}><Users size={14} /> Simulate invite</Button>} />{audit && <div className="mb-5 flex items-center justify-between border border-[#71885b]/30 bg-[#71885b]/10 px-4 py-3 text-xs text-[#526c43]">Invite flow staged locally. No message was sent.<button data-testid="button-dismiss-invite" onClick={() => setAudit(false)}><X size={14} /></button></div>}<div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">IDENTITY DIRECTORY · 04</div><h2 className="mt-1 text-base font-semibold">Authorized operators</h2></div><div className="divide-y divide-border">{users.map(([name, role, status, seen], index) => <div className="flex items-center gap-3 px-5 py-4" key={name}><span className="avatar avatar-light">{name.split(' ').map((part) => part[0]).join('')}</span><div className="min-w-0 flex-1"><div className="text-sm font-semibold">{name}</div><div className="mt-1 text-[10px] text-muted-foreground">{role} · Last seen {seen}</div></div><span className={cn('status-label', status === 'Active' ? 'status-good' : 'status-bad')}>{status}</span><button className="text-muted-foreground" data-testid={`button-user-settings-${index}`} onClick={() => setAudit(true)}><Settings2 size={15} /></button></div>)}</div></section><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">PERMISSION MODEL</div><h2 className="mt-1 text-base font-semibold">Role boundaries</h2></div><div className="divide-y divide-border">{[['Command Admin', 'All sectors', '14 permissions'], ['Evidence Reviewer', 'All sectors', '08 permissions'], ['Ground Officer · G2', 'Ladakh / North', '06 permissions']].map(([role, scope, count]) => <div className="px-5 py-4" key={role}><div className="flex justify-between text-xs font-semibold"><span>{role}</span><span className="font-mono text-[10px] text-muted-foreground">{count}</span></div><div className="mt-2 text-[10px] text-muted-foreground">{scope}</div><div className="mt-3 flex flex-wrap gap-1.5"><span className="permission-chip">READ</span><span className="permission-chip">REVIEW</span>{role.includes('Admin') && <span className="permission-chip">MANAGE ACCESS</span>}</div></div>)}</div></section></div><section className="panel mt-6"><div className="border-b border-border px-5 py-4"><div className="eyebrow">AUDIT LOG · IMMUTABLE LOCAL STREAM</div><h2 className="mt-1 text-base font-semibold">Recent access events</h2></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Context</th><th>Trace</th></tr></thead><tbody>{[['14:31:08', 'A. Srinivasan', 'Opened incident INC-2417', 'Command', '7f2a…1d0c'], ['14:28:41', 'R. Dorje', 'Acknowledged alert ALT-034', 'Ladakh', '9a18…c441'], ['14:12:06', 'N. Chatterjee', 'Verified evidence EV-2416-B', 'Assurance', '4c90…ad12']].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section></>;
}

function OfficerHome() {
  const [, setLocation] = useLocation();
  return <><PageHeader eyebrow="FIELD CONSOLE · LADAKH / NORTH" title="Good afternoon, R." action={<Button kind="primary" testId="button-open-officer-watch" onClick={() => setLocation('/officer/watch')}><Video size={14} /> Open camera watch</Button>} /><div className="mb-6 flex items-center gap-3 border border-[#71885b]/30 bg-[#71885b]/10 px-4 py-3 text-xs text-[#526c43]"><ShieldCheck size={16} /> Assigned-sector access active · 2 cameras reporting · 1 alert requires acknowledgement</div><div className="grid gap-3 sm:grid-cols-3"><Metric label="Open alerts" value="03" detail="1 high priority" tone="alert" icon={Bell} /><Metric label="Sector cameras" value="02 / 02" detail="Both online" tone="good" icon={Camera} /><Metric label="Evidence staged" value="07" detail="Last capture 13:58 IST" icon={FileCheck2} /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">ASSIGNED SECTOR</div><h2 className="mt-1 text-base font-semibold">Ladakh / North operational picture</h2></div><IndiaMap compact sector="Ladakh" onCamera={(id) => setLocation(`/officer/watch?camera=${id}`)} /></section><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">NEXT ACTIONS</div><h2 className="mt-1 text-base font-semibold">Field queue</h2></div><div className="divide-y divide-border">{[['Acknowledge', 'INC-2417 · Unidentified movement', 'Critical', '/officer/alerts'], ['Review feed', 'PN-LAD-04 · Person detection', '94.8%', '/officer/watch'], ['Capture evidence', 'Add context to open incident', 'Optional', '/officer/evidence']].map(([action, title, detail, href]) => <Link href={href} data-testid={`link-officer-action-${action.toLowerCase().replace(' ', '-')}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#e8e5d3]" key={title}><span className="grid h-8 w-8 place-items-center border border-[#b4b596] text-[#71885b]">{action === 'Acknowledge' ? <Bell size={14} /> : action === 'Review feed' ? <Eye size={14} /> : <FileCheck2 size={14} />}</span><div className="min-w-0 flex-1"><div className="text-xs font-semibold">{title}</div><div className="mt-1 text-[10px] text-muted-foreground">{action}</div></div><span className="font-mono text-[10px] text-[#a47840]">{detail}</span><ArrowRight size={14} className="text-muted-foreground" /></Link>)}</div></section></div></>;
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
  return <><PageHeader eyebrow="FIELD CONSOLE · LIVE INSTANCE" title="Camera watch" action={<div className="flex items-center gap-2"><span className="status-label status-good"><span className="signal-pulse" /> Watch active</span><Button kind="secondary" testId="button-watch-refresh" onClick={() => { appendTacticalLog('Refreshed assigned camera watch', 'Ladakh'); window.location.reload(); }}><RefreshCw size={14} /> Refresh</Button></div>} /><div className="grid gap-5 xl:grid-cols-[1fr_310px]"><section className="feed-panel"><div className="feed-top"><span className="flex items-center gap-2"><span className="signal-pulse" /> {selected.id} · {selected.site} · {thermal ? 'THERMAL' : 'VISIBLE CCTV'}</span><span className="font-mono">LOCAL PLAYBACK · {thermal ? 'IR PALETTE' : 'OPTICAL'}</span></div><CameraFeed cameraId={selected.id} thermal={thermal} aiEnabled className="min-h-[440px] h-[480px] xl:h-[520px]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#4c6449] bg-[#18271e] px-4 py-3 text-[#b9c9a1]"><div className="flex gap-2"><button onClick={() => setThermal(false)} className={cn('action-button action-quiet', !thermal && 'bg-[#40543d]')}><Video size={14} /> Visible CCTV</button><button onClick={() => setThermal(true)} className={cn('action-button action-quiet', thermal && 'bg-[#40543d]')}><Crosshair size={14} /> Thermal</button></div><span className="font-mono text-[10px]">LOCAL RECORDING · AI INFERENCE ACTIVE</span></div></section><aside className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">ASSIGNED NODES</div><h2 className="mt-1 text-base font-semibold">Select a feed</h2></div><div className="divide-y divide-border">{sectorCameras.map((camera) => <button key={camera.id} onClick={() => { setSelected(camera); setThermal(true); }} data-testid={`button-select-watch-${camera.id}`} className={cn('w-full px-5 py-4 text-left hover:bg-[#e8e5d3]', selected.id === camera.id && 'bg-[#e3e0c9]')}><div className="flex items-center justify-between gap-3"><div><div className="font-mono text-[10px] text-muted-foreground">{camera.id}</div><div className="mt-1 text-xs font-semibold">{camera.site}</div></div><StatusDot status={camera.status} /></div><div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground"><span>Health {camera.health}%</span><span>Thermal available</span></div></button>)}</div></aside></div></>;
}
function OfficerIncident() {
  const { id } = useParams<{ id: string }>();
  const item = incidents.find((incident) => incident.id === id) ?? incidents[0];
  const [, setLocation] = useLocation();
  const [state, setState] = useState(item.state);
  return <><PageHeader eyebrow={`FIELD INCIDENT · ${item.id}`} title={item.title} detail={`${item.sector} · ${item.camera} · Detected ${item.time}`} action={<Button kind="secondary" testId="button-back-alerts" onClick={() => setLocation('/officer/alerts')}><ArrowLeft size={14} /> Alert queue</Button>} /><div className="grid gap-6 xl:grid-cols-[1fr_350px]"><div className="space-y-6"><section className="panel p-5"><div className="flex flex-wrap items-center gap-2"><span className={cn('severity', `severity-${item.severity.toLowerCase()}`)}>{item.severity}</span><span className="status-label">{state}</span><span className="status-label status-good"><ShieldCheck size={12} /> Evidence verified</span></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><div><div className="eyebrow">DETECTION CLASS</div><div className="mt-2 text-sm font-semibold">{item.kind}</div></div><div><div className="eyebrow">CONFIDENCE</div><div className="mt-2 text-sm font-semibold">94.8%</div></div><div><div className="eyebrow">GEOFENCE</div><div className="mt-2 text-sm font-semibold">0.42 km inside</div></div></div></section><section className="panel"><div className="border-b border-border px-5 py-4"><div className="eyebrow">EVENT CHRONOLOGY</div><h2 className="mt-1 text-base font-semibold">What happened</h2></div><div className="timeline p-5">{[['14:32:19', 'Detection generated', 'AI engine identified PERSON + VEHICLE classes above review threshold.'], ['14:32:28', 'Alert routed', 'Assigned to R. Dorje · G2 field response.'], ['14:34:05', 'Evidence sealed', 'Frame set EV-2417-A signed and added to the local chain.'], ['Now', 'Field action', 'Current status is controlled by the officer workspace.']].map(([time, title, text]) => <div className="timeline-item" key={time}><span className="timeline-dot" /><span className="font-mono text-[10px] text-muted-foreground">{time}</span><h3 className="mt-1 text-xs font-semibold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{text}</p></div>)}</div></section></div><aside className="space-y-6"><div className="panel p-5"><div className="eyebrow">LOCATION CONTEXT</div><IndiaMap compact sector="Ladakh" /><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><span className="block text-muted-foreground">COORDINATES</span><span className="mt-1 block font-mono text-[10px]">34.1154 N<br />77.5432 E</span></div><div><span className="block text-muted-foreground">CAMERA</span><span className="mt-1 block font-mono text-[10px]">{item.camera}</span></div></div></div><div className="panel p-5"><div className="eyebrow">FIELD ACTION</div><div className="mt-4 grid gap-2"><Button kind="primary" testId="button-incident-acknowledge" onClick={() => setState('Acknowledged')}><Check size={14} /> Acknowledge</Button><Button kind="danger" testId="button-incident-escalate" onClick={() => setState('Escalated')}><Zap size={14} /> Escalate to command</Button><Link href="/officer/evidence" data-testid="link-capture-incident-evidence" className="action-button action-secondary justify-center"><FileCheck2 size={14} /> Capture evidence</Link></div></div></aside></div></>;
}

function OfficerEvidence() {
  const [captured, setCaptured] = useState(false);
  const [verified, setVerified] = useState(false);
  return <><PageHeader eyebrow="FIELD CONSOLE · PROVENANCE" title="Capture evidence" action={<span className="status-label status-good"><LockKeyhole size={12} /> Local chain available</span>} /><div className="grid gap-6 xl:grid-cols-[1fr_380px]"><section className="panel p-5"><div className="eyebrow">CAPTURE WORKFLOW</div><h2 className="mt-2 text-lg font-semibold">Seal a field observation</h2><div className="mt-6 space-y-5"><div className="workflow-step"><span className="workflow-number">01</span><div><h3 className="text-sm font-semibold">Select source</h3><select className="field-input mt-3" data-testid="select-evidence-source" defaultValue="PN-LAD-04 · 14:32:19"><option>PN-LAD-04 · 14:32:19</option><option>PN-LAD-07 · 14:31:04</option></select></div></div><div className="workflow-step"><span className="workflow-number">02</span><div className="flex-1"><h3 className="text-sm font-semibold">Add field context</h3><textarea className="field-input mt-3 min-h-[95px]" data-testid="textarea-evidence-context" placeholder="Describe what you observed, without inference." defaultValue="Movement observed along the relay corridor. Frame set retained for command review." /></div></div><div className="workflow-step"><span className="workflow-number">03</span><div><h3 className="text-sm font-semibold">Seal and sign</h3><p className="mt-2 text-xs text-muted-foreground">A SHA-256 digest, operator signature, device certificate, and custody record will be processed locally.</p></div></div></div><Button kind="primary" testId="button-seal-evidence" onClick={() => { setCaptured(true); setVerified(false); }}><Fingerprint size={15} /> Seal evidence object</Button></section><aside className="panel p-5"><div className="eyebrow">VERIFICATION OUTPUT</div>{captured ? <div className="mt-5"><div className="border border-[#71885b]/40 bg-[#71885b]/10 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-[#526c43]"><CheckCircle2 size={17} /> Evidence sealed locally</div><div className="mt-3 font-mono text-[10px] leading-5 text-muted-foreground">EV-2418-A<br />SHA-256 · 3d7c…9a12<br />ED25519 · SIGNED<br />CHAIN INDEX · 0126</div></div><Button kind="secondary" testId="button-verify-captured-evidence" onClick={() => setVerified(true)}>{verified ? <Check size={14} /> : <ShieldCheck size={14} />} {verified ? 'Integrity verified' : 'Verify integrity'}</Button></div> : <div className="empty-state min-h-[270px]"><FileCheck2 size={28} /><p>Complete the capture steps to generate a verifiable object.</p></div>}</aside></div></>;
}

function OfficerMap() {
  const [, setLocation] = useLocation();
  return <><PageHeader eyebrow="FIELD CONSOLE · ASSIGNED GEOGRAPHY" title="Sector map" action={<Button kind="secondary" testId="button-officer-map-recenter"><Target size={14} /> Recenter assignment</Button>} /><div className="panel p-2"><IndiaMap sector="Ladakh" onCamera={(id) => setLocation(`/officer/watch?camera=${id}`)} /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Assigned cameras" value="02" detail="Both reporting" tone="good" icon={Camera} /><Metric label="Open geofences" value="04" detail="2 active this shift" icon={Target} /><Metric label="Response distance" value="0.42 km" detail="Nearest detection" icon={Timer} /></div></>;
}

function OfficerAlerts() {
  const [items, setItems] = useState(incidents.slice(0, 4));
  const [message, setMessage] = useState('');
  const act = (id: string, action: string) => { setItems((current) => current.map((item) => item.id === id ? { ...item, state: action } : item)); setMessage(`${id} marked ${action.toLowerCase()} in the local field log.`); };
  return <><PageHeader eyebrow="FIELD CONSOLE · RESPONSE QUEUE" title="Alert queue" action={<Button kind="secondary" testId="button-alert-filter"><SlidersHorizontal size={14} /> Filter queue</Button>} />{message && <div className="mb-5 flex justify-between border border-[#71885b]/30 bg-[#71885b]/10 px-4 py-3 text-xs text-[#526c43]">{message}<button onClick={() => setMessage('')} data-testid="button-dismiss-alert-message"><X size={14} /></button></div>}<div className="space-y-3">{items.map((item) => <article className="panel p-5" key={item.id} data-testid={`card-officer-alert-${item.id}`}><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className={cn('mt-1 grid h-9 w-9 place-items-center border', item.severity === 'Critical' ? 'border-[#a34e42]/50 text-[#a34e42]' : 'border-[#b27a3d]/50 text-[#a47840]')}><AlertTriangle size={17} /></span><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">{item.id}</span><span className={cn('severity', `severity-${item.severity.toLowerCase()}`)}>{item.severity}</span><span className="status-label">{item.state}</span></div><h2 className="mt-2 text-sm font-semibold">{item.title}</h2><p className="mt-2 text-xs text-muted-foreground">{item.sector} · {item.camera} · {item.time}</p></div></div><Link href={`/officer/incidents/${item.id}`} data-testid={`link-investigate-${item.id}`} className="text-xs font-semibold text-[#71885b]">Investigate <ArrowRight size={13} className="ml-1 inline" /></Link></div><div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4"><Button kind="secondary" testId={`button-acknowledge-${item.id}`} onClick={() => act(item.id, 'Acknowledged')}><Check size={14} /> Acknowledge</Button><Button kind="secondary" testId={`button-investigate-${item.id}`} onClick={() => act(item.id, 'Investigating')}><Eye size={14} /> Investigate</Button><Button kind="danger" testId={`button-escalate-${item.id}`} onClick={() => act(item.id, 'Escalated')}><Zap size={14} /> Escalate</Button></div></article>)}</div></>;
}


function Router() {
  return <Switch>
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
  </Switch>;
}

function NotFound() {
  const [, setLocation] = useLocation();
  return <div className="grid min-h-[100dvh] place-items-center bg-[#e7e3cf] p-6"><div className="text-center"><div className="eyebrow">SIGNAL NOT FOUND</div><h1 className="mt-3 text-4xl font-semibold">This route is outside the configured perimeter.</h1><button className="action-button action-primary mt-6" data-testid="button-return-entry" onClick={() => setLocation('/')}>Return to entry <ArrowLeft size={15} /></button></div></div>;
}

export default function App() {
  return <Router />;
}