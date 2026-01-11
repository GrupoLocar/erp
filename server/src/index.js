// server/src/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { exec } from "child_process";

// Rotas
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/auth.routes.js";
import logRoutes from "./routes/logs.js";
import funcionarioRoutes from "./routes/funcionarioRoutes.js";
import syncRouter from "./routes/sync.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import fornecedorRoutes from "./routes/fornecedorRoutes.js";
import filialRoutes from "./routes/filialRoutes.js";
import pslRoutes from "./routes/pslRoutes.js";
import tipoFornecedorRoutes from "./routes/tipoFornecedorRoutes.js";

// Middlewares / controllers específicos
import uploadDropbox from "./middlewares/uploadDropbox.js";
import { criarFuncionarioComAnexos } from "./controllers/funcionarioController.js";

// Fallback Filiais
import {
  listar as listarFiliais,
  criar as criarFilial,
  atualizar as atualizarFilial
} from "./controllers/filialController.js";

// Modelo para estatísticas (models ficam em src/models)
import Funcionario from "./models/funcionario.js";

// __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Raiz do projeto "server" (onde fica o .env): server/src -> server
const SERVER_ROOT = path.resolve(__dirname, "..");

// ✅ Garantir que o dotenv enxergue server\.env (e não server\src\.env)
const ENV_PATH = path.join(SERVER_ROOT, ".env");

// Carrega o .env explicitamente da raiz do server
if (fs.existsSync(ENV_PATH)) {
  dotenv.config({ path: ENV_PATH });
} else {
  // fallback: comportamento padrão do dotenv (procura no cwd)
  dotenv.config();
  console.warn(`⚠️ .env não encontrado em ${ENV_PATH}. Usando dotenv.config() padrão.`);
}

const app = express();
const PORT = Number(process.env.PORT) || 5001;
const HOST = process.env.HOST || "0.0.0.0";

/* ========= Instrumentação leve para depurar rotas ========= */
const __mountedPrefixes = [];
const __origUse = app.use.bind(app);
app.use = (...args) => {
  if (typeof args[0] === "string") __mountedPrefixes.push(args[0]);
  return __origUse(...args);
};

const getPathFromRegexp = (regexp) => {
  try {
    const src = String(regexp);
    const m = src.match(/^\/\^\\\/(.+?)\\\/\?\(\?=\\\/\|\$\)\/[im]*$/);
    if (m && m[1]) return "/" + m[1].replace(/\\\//g, "/");
  } catch { }
  return "";
};

const collectRoutes = () => {
  const endpoints = [];
  const root = app._router;
  if (!root?.stack) return { prefixes: [...new Set(__mountedPrefixes)], endpoints };

  const walk = (prefix, layer) => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods)
        .map((x) => x.toUpperCase())
        .join(",");
      endpoints.push(`${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === "router" && layer.handle?.stack) {
      const subPrefix = layer.regexp ? getPathFromRegexp(layer.regexp) : "";
      layer.handle.stack.forEach((h) => walk(`${prefix}${subPrefix}`, h));
    }
  };

  root.stack.forEach((l) => walk("", l));
  return { prefixes: [...new Set(__mountedPrefixes)], endpoints };
};

app.get("/__routes", (req, res) => res.json(collectRoutes()));
/* ========================================================= */

/**
 * Static de uploads
 */
const UPLOADS_DIR = process.env.UPLOADS_DIR || "C:/Users/tigru/Dropbox/uploads";
app.use("/uploads", express.static(UPLOADS_DIR));

/**
 * Middlewares globais
 */
app.use(cors({ origin: "*" }));
app.options("*", cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/**
 * Mongo URI (aceita MONGO_URI ou MONGODB_URI)
 */
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ Defina MONGO_URI (ou MONGODB_URI) no .env");
  process.exit(1);
}

/**
 * Conectar no Mongo e (opcional) rodar script Python na inicialização
 */
const connectMongoAndBootstrap = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB conectado");

    const runSync = (process.env.RUN_STARTUP_SYNC ?? "true").toLowerCase() === "true";
    if (runSync) {
      const scriptPath = path.resolve(__dirname, "scripts", "sync_atlas_to_local.py");

      if (fs.existsSync(scriptPath)) {
        console.log(`Executando script de sincronização da base de dados: ${scriptPath}`);

        exec(
          `python -X utf8 "${scriptPath}"`,
          {
            // ✅ Executa o Python a partir da raiz do server, onde está o server\.env
            cwd: SERVER_ROOT,
            env: {
              ...process.env,
              PYTHONIOENCODING: "utf-8",
              // ✅ Ajuda o Python (se ele suportar) a localizar o .env correto
              DOTENV_PATH: ENV_PATH
            }
          },
          (error, stdout, stderr) => {
            if (error) {
              console.error("❌ Erro ao executar script Python na inicialização:", error.message);
              console.error("stderr:", stderr);
              return;
            }
            console.log("✅ Script de sincronização executado com sucesso na inicialização");
            if (stdout) console.log("stdout:", stdout);
            if (stderr) console.log("stderr:", stderr);
          }
        );
      } else {
        console.warn("⚠️ Script de sync não encontrado em:", scriptPath);
      }
    }
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  }
};

/**
 * Upload específico (mantido)
 */
app.post("/api/funcionarios/com-anexos", uploadDropbox, criarFuncionarioComAnexos);

/**
 * Rotas principais
 */
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/sync", syncRouter);

app.use("/api/clientes", clienteRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/tipoFornecedor", tipoFornecedorRoutes);
app.use("/api/psl", pslRoutes);

/* =================== FILIAIS (3 camadas) =================== */
app.use("/api/filiais", (req, res, next) => {
  try {
    const p = (req.path || "").replace(/\/+$/, "");
    if (req.method === "GET" && (p === "" || p === "/")) {
      return listarFiliais(req, res);
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use("/api/filiais", filialRoutes);

app.get("/api/filiais", listarFiliais);
app.post("/api/filiais", criarFilial);
app.put("/api/filiais/:id", atualizarFilial);

app.get("/api/filiais/__ping", (req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);
/* =========================================================== */

/**
 * Estatísticas de situação (mantido)
 */
app.get("/api/funcionarios/estatisticas/situacao", async (req, res) => {
  try {
    const estatisticas = await Funcionario.aggregate([
      { $group: { _id: "$situacao", total: { $sum: 1 } } }
    ]);
    res.json(estatisticas);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ erro: "Erro ao buscar estatísticas." });
  }
});

/**
 * Health/root
 */
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.send("API GrupoLocar está funcionando"));

/**
 * 404 + error handler
 */
app.use((req, res) => {
  console.warn("404 não tratado:", req.method, req.originalUrl);
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error("❌ Erro não tratado:", err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

/**
 * Bootstrap
 */
await connectMongoAndBootstrap();

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  const { prefixes, endpoints } = collectRoutes();
  console.log("🔧 Prefixos montados via app.use:", prefixes.length ? prefixes : "(nenhum)");
  console.log("🔧 Endpoints detectados:", endpoints.length ? endpoints : "(nenhum)");
});
