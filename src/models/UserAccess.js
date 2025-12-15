import mongoose from "mongoose";

const userAccessSchema = new mongoose.Schema({
  // Référence utilisateur OU groupe (l'un des deux)
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },

  // Périodicité : daily, weekly, monthly, custom
  periodicity: {
    type: { type: String, enum: ["daily", "weekly", "monthly", "custom"], default: "daily" },
    // Pour custom : dates personnalisées
    startDate: { type: Date },
    endDate: { type: Date }
  },

  // Plages horaires (format 24h)
  schedule: {
    startHour: { type: String, default: "00:00" },  // ex: "08:00"
    endHour: { type: String, default: "23:59" }     // ex: "18:00"
  },

  // Durée en minutes (0 = illimité)
  duration: { type: Number, default: 0 },

  // Priorité
  priority: { type: String, enum: ["high", "normal"], default: "normal" },

  // Quota de données en Mo (0 = illimité)
  quotaMo: { type: Number, default: 0 },

  // Vitesse/débit en kbit/s (0 = maximum)
  speedKbps: { type: Number, default: 0 },

  // Statut actif/inactif
  active: { type: Boolean, default: true },

  // Créé par (admin/agent)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }

}, { timestamps: true });

// Index pour recherche rapide
userAccessSchema.index({ user: 1 });
userAccessSchema.index({ group: 1 });
userAccessSchema.index({ "periodicity.startDate": 1, "periodicity.endDate": 1 });

export default mongoose.model("UserAccess", userAccessSchema);
