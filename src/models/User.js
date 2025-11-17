import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["admin", "agent", "user"],
      default: "user", 
    },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
