import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    level: { type: String, default: "info" }, // info | warn | error
    message: { type: String, required: true },

    // contexto
    route: { type: String },
    method: { type: String },
    ip: { type: String },

    // usuário (opcional)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // payload extra
    meta: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Log", logSchema);
