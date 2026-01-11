import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = Router();

function requireMongoConnection(req, res, next) {
  const state = mongoose.connection?.readyState ?? 0;
  if (state !== 1) {
    return res.status(503).json({
      message: "Banco de dados indisponível (MongoDB não conectado).",
      mongoReadyState: state
    });
  }
  return next();
}

function getBearerToken(req) {
  const header = req.headers?.authorization || "";
  const [type, token] = header.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ message: "Token ausente." });

  try {
    const secret = process.env.JWT_SECRET || "segredo";
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

router.post("/login", requireMongoConnection, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username e senha são obrigatórios" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Usuário ou senha inválidos" });

    const passwordHash = user.password || user.senha_hash;
    if (!passwordHash) {
      return res.status(500).json({ message: "Usuário inválido (senha não configurada)" });
    }

    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) return res.status(401).json({ message: "Usuário ou senha inválidos" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "segredo",
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      usuario: {
        _id: user._id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("🔥 Erro no login:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
});

router.get("/me", requireMongoConnection, requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select("_id username nome email role");
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
    return res.json({ usuario: user });
  } catch (err) {
    console.error("🔥 Erro em /me:", err);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
});

export default router;
