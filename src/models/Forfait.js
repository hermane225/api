import mongoose from "mongoose";

const forfaitSchema = new mongoose.Schema({
  category: { type: String },
  name: { type: String, required: true },
  description: { type: String },
  durationValue: { type: Number, required: true }, // ex 7
  durationUnit: { type: String, enum: ["minutes","hours","days"], default: "days" },
  price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Forfait", forfaitSchema);
