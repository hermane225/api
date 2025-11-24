import mongoose from "mongoose";

const statistiqueSchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now },
  code: { type: String },
  forfait: { type: mongoose.Schema.Types.ObjectId, ref: "Forfait" },
  forfaitType: { type: String },
  user: { type: String }, // user login or identifier
}, { timestamps: true });

export default mongoose.model("Statistique", statistiqueSchema);
