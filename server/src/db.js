import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Erro ao conectar no MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;


// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGODB_URI, {
//             dbName: process.env.DB_NAME,
//         });
//         console.log(`✅ Você está conectado ao MongoDB: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`❌ MongoDB Error: ${error.message}`);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;
