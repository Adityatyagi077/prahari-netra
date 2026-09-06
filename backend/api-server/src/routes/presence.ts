import { Router, type IRouter } from "express";

export type OfficerPresence = {
  online: boolean;
  name: string;
  role: string;
  path: string;
  activity: string;
  camera?: string;
  mode?: string;
  lastSeen: number;
};

let presence: OfficerPresence | null = null;
const router: IRouter = Router();

router.post("/officer/presence", (req, res) => {
  const body = req.body ?? {};
  presence = {
    online: true,
    name: String(body.name ?? "GROUND OFFICER"),
    role: String(body.role ?? "GROUND OFFICER"),
    path: String(body.path ?? "/officer"),
    activity: String(body.activity ?? "Working in field console"),
    camera: body.camera ? String(body.camera) : undefined,
    mode: body.mode ? String(body.mode) : undefined,
    lastSeen: Date.now(),
  };
  res.json({ ok: true, presence });
});

router.get("/officer/presence", (_req, res) => {
  const current = presence && Date.now() - presence.lastSeen < 15000 ? presence : presence ? { ...presence, online: false } : null;
  res.json({ presence: current });
});

router.delete("/officer/presence", (_req, res) => {
  if (presence) presence = { ...presence, online: false, lastSeen: Date.now() };
  res.json({ ok: true });
});

export default router;
