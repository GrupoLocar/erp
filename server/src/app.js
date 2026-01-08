import express from "express";
import cors from "cors";

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck (evita “servidor vazio”)
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "erp-server", ts: new Date().toISOString() });
});

export default app;
