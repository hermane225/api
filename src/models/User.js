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
    // Profil privé de l'utilisateur
    profile: {
      photo: { type: String },
      lastName: { type: String },
      firstName: { type: String },
      contact: { type: String },
      idType: { type: String },
      idNumber: { type: String },
      region: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
