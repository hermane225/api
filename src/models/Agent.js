import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  photo: { type: String },
  lastName: { type: String },
  firstName: { type: String },
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String },
  idType: { type: String },
  idNumber: { type: String },
  region: { type: String }
}, { timestamps: true });

export default mongoose.model("Agent", agentSchema);
