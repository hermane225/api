import mongoose from "mongoose";

const codeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  forfait: { type: mongoose.Schema.Types.ObjectId, ref: "Forfait" },
  category: { type: String },
  durationValue: { type: Number },
  price: { type: Number },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  used: { type: Boolean, default: false },
  usedBy: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model("Code", codeSchema);
