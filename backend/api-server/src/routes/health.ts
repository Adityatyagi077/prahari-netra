import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/system-health", (_req, res) => {
  res.json({ status: "ok", pid: process.pid, uptime: process.uptime(), node: process.version, memory: process.memoryUsage(), timestamp: new Date().toISOString() });
});

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
