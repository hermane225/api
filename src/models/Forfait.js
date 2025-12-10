import mongoose from "mongoose";

const forfaitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  durationValue: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String }
}, { timestamps: true });

export default mongoose.model("Forfait", forfaitSchema);
