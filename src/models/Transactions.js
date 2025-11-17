import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  codeAgent: { type: String },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  userLogin: { type: String },
  duration: { type: Number }, // en minutes
  forfait: { type: mongoose.Schema.Types.ObjectId, ref: "Forfait" },
  amount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
