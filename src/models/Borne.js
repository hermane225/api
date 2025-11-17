import mongoose from "mongoose";

const borneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ip: { type: String },
  status: { type: String, enum: ["EN_SERVICE","HORS_LIGNE","INSTABLE"], default: "EN_SERVICE" },
  traffic: { type: Number, default: 0 }, // en bytes
  temperature: { type: Number },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Borne", borneSchema);
