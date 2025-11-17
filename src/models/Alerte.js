import mongoose from "mongoose";

const alerteSchema = new mongoose.Schema({
  code: { type: Number, required: true },
  type: { type: String },
  message: { type: String },
  emitter: { type: String },
  status: { type: String, enum: ["NOUVELLE","EN_COURS","RESOLUE"], default: "NOUVELLE" },
  metadata: { type: Object }
}, { timestamps: true });

export default mongoose.model("Alerte", alerteSchema);
