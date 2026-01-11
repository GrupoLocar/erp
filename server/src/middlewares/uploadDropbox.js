import fs from "fs";
import path from "path";
import multer from "multer";

/**
 * Middleware de upload de anexos – padrão Locar
 *
 * - Salva diretamente em UPLOADS_DIR (sem pasta tmp).
 * - Renomeia arquivos: <timestamp>_<NomeCompleto>-<campo>.<ext>
 * - Remove acentos / sanitiza nome.
 * - Preserva anexos existentes quando não houver novo upload.
 * - Remove do disco anexos antigos quando houver substituição.
 * - Preenche req.body.arquivos no formato esperado pelo controller.
 */

const pastaDestino = process.env.UPLOADS_DIR || "C:/Users/tigru/Dropbox/uploads";

if (!fs.existsSync(pastaDestino)) {
  fs.mkdirSync(pastaDestino, { recursive: true });
}

const camposArquivos = [
  "cnh_arquivo",
  "comprovante_residencia",
  "nada_consta",
  "comprovante_mei",
  "curriculo"
];

const removerAcentos = (texto) => {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C");
};

const formatarNomeArquivo = (nomeCompleto, campo, originalName) => {
  const timestamp = Date.now();
  const ext = path.extname(originalName || "");
  const nomeSemAcentos = removerAcentos(nomeCompleto || "Sem_Nome");
  const nomeSanitizado = nomeSemAcentos
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/gi, "")
    .replace(/\s/g, "_");

  // Se por algum motivo ficar vazio
  const nomeFinalSeguro = nomeSanitizado || "Sem_Nome";
  return `${timestamp}_${nomeFinalSeguro}-${campo}${ext}`;
};

/**
 * Tenta obter "nome" do body (casos comuns no frontend):
 * - req.body.nome
 * - req.body.funcionario (JSON string)
 * - req.body.data (JSON string)
 * - req.body (caso venha string JSON)
 */
const obterNomeCompleto = (req) => {
  if (req?.body?.nome) return req.body.nome;

  // Alguns frontends enviam um campo JSON com dados do funcionário
  const candidatos = ["funcionario", "data", "payload", "form"];
  for (const key of candidatos) {
    const val = req?.body?.[key];
    if (typeof val === "string") {
      try {
        const obj = JSON.parse(val);
        if (obj?.nome) return obj.nome;
      } catch {
        // ignora
      }
    }
  }

  // Caso extremo: body inteiro seja string JSON
  if (typeof req.body === "string") {
    try {
      const obj = JSON.parse(req.body);
      if (obj?.nome) return obj.nome;
    } catch {
      // ignora
    }
  }

  return "";
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaDestino);
  },
  filename: (req, file, cb) => {
    const nomeCompleto = obterNomeCompleto(req);
    const campo = file.fieldname;
    const nomeFinal = formatarNomeArquivo(nomeCompleto, campo, file.originalname);
    cb(null, nomeFinal);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  }
});

function normalizarCampoExistente(req, campo) {
  // Aceita <campo>_existente e <campo>_existente[]
  const a = req.body?.[`${campo}_existente[]`];
  const b = req.body?.[`${campo}_existente`];

  const val = a ?? b;

  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function deletarArquivoSeLocal(nome) {
  if (!nome) return;
  if (typeof nome !== "string") return;

  // Não apaga links (Dropbox etc.)
  if (nome.startsWith("http://") || nome.startsWith("https://")) return;

  const caminho = path.join(pastaDestino, nome);
  if (fs.existsSync(caminho)) {
    try {
      fs.unlinkSync(caminho);
    } catch (e) {
      console.warn(`Não foi possível remover o arquivo antigo: ${caminho}`, e);
    }
  }
}

export default function uploadDropbox(req, res, next) {
  const middleware = upload.fields(
    camposArquivos.map((campo) => ({ name: campo, maxCount: 1 }))
  );

  middleware(req, res, (err) => {
    if (err) {
      // MulterError -> 400 (payload/formato)
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          erro: "Erro ao fazer upload dos arquivos.",
          code: err.code,
          message: err.message
        });
      }

      console.error("Erro ao processar upload:", err);
      return res.status(500).json({ erro: "Erro ao fazer upload dos arquivos." });
    }

    const arquivos = {};

    for (const campo of camposArquivos) {
      arquivos[campo] = [];

      const novoArquivo = req.files?.[campo]?.[0];

      if (novoArquivo) {
        // Novo upload: salvar filename
        arquivos[campo].push(novoArquivo.filename);

        // Se havia arquivos antigos, remover do disco (somente locais)
        const antigosArray = normalizarCampoExistente(req, campo);
        for (const nomeAntigo of antigosArray) {
          // não remove o mesmo nome (edge case)
          if (nomeAntigo && nomeAntigo !== novoArquivo.filename) {
            deletarArquivoSeLocal(nomeAntigo);
          }
        }
      } else {
        // Sem novo upload: preservar existentes
        const existentesArray = normalizarCampoExistente(req, campo);
        arquivos[campo] = existentesArray;
      }
    }

    // O controller do Locar espera isso
    req.body.arquivos = arquivos;

    next();
  });
}
