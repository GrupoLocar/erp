// server/src/routes/sync.js
import { Router } from "express";
import syncFuncionarios from "../scripts/syncFuncionarios.js";

const router = Router();

/**
 * POST /api/sync/funcionarios
 * Executa a sincronização Atlas -> Local (coleção funcionarios).
 */
router.post("/funcionarios", async (req, res) => {
  try {
    const result = await syncFuncionarios(); // seu script não recebe parâmetros
    return res.json({
      ok: true,
      message: "Sincronização executada com sucesso.",
      result: result ?? null
    });
  } catch (err) {
    console.error("❌ Erro ao executar syncFuncionarios:", err);
    return res.status(500).json({
      ok: false,
      message: "Erro ao executar sincronização de funcionários.",
      error: err.message || String(err)
    });
  }
});

export default router;
