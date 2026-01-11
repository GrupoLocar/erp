import { Router } from "express";
import Log from "../models/Log.js";

const router = Router();

/**
 * POST /api/logs
 * body: { level, message, route, method, ip, userId, meta }
 */
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.message) {
      return res.status(400).json({ message: "Campo 'message' é obrigatório." });
    }

    const doc = await Log.create({
      level: payload.level || "info",
      message: payload.message,
      route: payload.route,
      method: payload.method,
      ip: payload.ip,
      userId: payload.userId,
      meta: payload.meta
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("❌ Erro ao salvar log:", err);
    return res.status(500).json({ message: "Erro ao salvar log.", error: err.message });
  }
});

/**
 * GET /api/logs?limit=100
 */
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const logs = await Log.find().sort({ createdAt: -1 }).limit(limit);
    return res.json(logs);
  } catch (err) {
    console.error("❌ Erro ao buscar logs:", err);
    return res.status(500).json({ message: "Erro ao buscar logs.", error: err.message });
  }
});

export default router;
