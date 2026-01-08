import "dotenv/config";
import app from "./app.js";

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Se você tiver conexão com banco (Mongo/Mongoose etc.), conecte ANTES do listen.
// Exemplo (opcional):
// import { connectDB } from "./db.js";
// await connectDB();

app.listen(PORT, HOST, () => {
  console.log(`[ERP] Server ON: http://${HOST}:${PORT}`);
  console.log(`[ERP] Healthcheck: http://${HOST}:${PORT}/health`);
});


// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDB = require('./db');

// const authRoutes = require('./routes/auth.routes');

// dotenv.config();

// const app = express();

// // ✅ CORS correto para Vercel
// app.use(cors({
//     origin: [
//         "http://localhost:3000",
//         "http://localhost:8080",
//         "http://127.0.0.1:3000",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true
// }));

// // ✅ deixa o cors responder o OPTIONS
// app.options('*', cors());

// app.use(express.json());

// // DB
// if (process.env.MONGODB_URI) {
//     connectDB();
// }

// // Rotas
// app.use('/api/auth', authRoutes);

// // Health
// app.get('/api/health', (req, res) => {
//     res.json({ status: 'ok' });
// });

// module.exports = app;
