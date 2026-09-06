import { Router, type IRouter } from "express";
import { randomBytes } from "node:crypto";

type PhoneSession = {
  createdAt: number;
  offer?: RTCSessionDescriptionInitLike;
  answer?: RTCSessionDescriptionInitLike;
};

type RTCSessionDescriptionInitLike = { type: string; sdp?: string };

const sessions = new Map<string, PhoneSession>();
const router: IRouter = Router();

function makeCode() {
  return randomBytes(3).toString("hex").toUpperCase();
}

function getSession(code: string) {
  return sessions.get(code.toUpperCase());
}

router.post("/phone/session", (_req, res) => {
  let code = makeCode();
  while (sessions.has(code)) code = makeCode();
  sessions.set(code, { createdAt: Date.now() });
  res.json({ code });
});

router.get("/phone/session/:code", (req, res) => {
  const session = getSession(req.params.code);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json({ offer: session.offer ?? null, answer: session.answer ?? null });
});

router.post("/phone/session/:code/offer", (req, res) => {
  const session = getSession(req.params.code);
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (!req.body?.sdp || !req.body?.type) return res.status(400).json({ error: "Invalid offer" });
  session.offer = { type: String(req.body.type), sdp: String(req.body.sdp) };
  session.answer = undefined;
  res.json({ ok: true });
});

router.post("/phone/session/:code/answer", (req, res) => {
  const session = getSession(req.params.code);
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (!req.body?.sdp || !req.body?.type) return res.status(400).json({ error: "Invalid answer" });
  session.answer = { type: String(req.body.type), sdp: String(req.body.sdp) };
  res.json({ ok: true });
});

router.delete("/phone/session/:code", (req, res) => {
  sessions.delete(req.params.code.toUpperCase());
  res.json({ ok: true });
});

setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [code, session] of sessions) {
    if (session.createdAt < cutoff) sessions.delete(code);
  }
}, 10 * 60 * 1000).unref();

export default router;
