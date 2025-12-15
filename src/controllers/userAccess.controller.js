import UserAccess from "../models/UserAccess.js";
import User from "../models/User.js";
import Group from "../models/Group.js";

// Créer un accès utilisateur
export const createAccess = async (req, res, next) => {
  try {
    const {
      userId,
      groupId,
      periodicityType,
      startDate,
      endDate,
      startHour,
      endHour,
      duration,
      priority,
      quotaMo,
      speedKbps
    } = req.body;

    // Vérifier qu'on a soit un user soit un groupe
    if (!userId && !groupId) {
      return res.status(400).json({ message: "Veuillez spécifier un utilisateur ou un groupe" });
    }

    const access = await UserAccess.create({
      user: userId || null,
      group: groupId || null,
      periodicity: {
        type: periodicityType || "daily",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      },
      schedule: {
        startHour: startHour || "00:00",
        endHour: endHour || "23:59"
      },
      duration: duration || 0,
      priority: priority || "normal",
      quotaMo: quotaMo || 0,
      speedKbps: speedKbps || 0,
      createdBy: req.user?.id
    });

    const populated = await UserAccess.findById(access._id)
      .populate("user", "name email")
      .populate("group", "name")
      .populate("createdBy", "name");

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// Lister tous les accès (avec filtres optionnels)
export const getAllAccess = async (req, res, next) => {
  try {
    const { userId, groupId, active } = req.query;
    const filter = {};

    if (userId) filter.user = userId;
    if (groupId) filter.group = groupId;
    if (active !== undefined) filter.active = active === "true";

    const accesses = await UserAccess.find(filter)
      .populate("user", "name email")
      .populate("group", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(accesses);
  } catch (err) {
    next(err);
  }
};

// Récupérer les accès d'un utilisateur spécifique
export const getAccessByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Récupérer les accès directs + ceux via les groupes de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const directAccess = await UserAccess.find({ user: userId, active: true })
      .populate("user", "name email")
      .populate("createdBy", "name");

    // Si l'utilisateur appartient à des groupes, récupérer aussi ces accès
    const groupAccess = await UserAccess.find({ 
      group: { $in: user.groups || [] }, 
      active: true 
    })
      .populate("group", "name")
      .populate("createdBy", "name");

    res.status(200).json({
      direct: directAccess,
      viaGroup: groupAccess
    });
  } catch (err) {
    next(err);
  }
};

// Récupérer un accès par ID
export const getAccessById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await UserAccess.findById(id)
      .populate("user", "name email")
      .populate("group", "name")
      .populate("createdBy", "name");

    if (!access) {
      return res.status(404).json({ message: "Accès non trouvé" });
    }

    res.status(200).json(access);
  } catch (err) {
    next(err);
  }
};

// Mettre à jour un accès
export const updateAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      periodicityType,
      startDate,
      endDate,
      startHour,
      endHour,
      duration,
      priority,
      quotaMo,
      speedKbps,
      active
    } = req.body;

    const updateData = {};

    if (periodicityType) {
      updateData["periodicity.type"] = periodicityType;
    }
    if (startDate) updateData["periodicity.startDate"] = new Date(startDate);
    if (endDate) updateData["periodicity.endDate"] = new Date(endDate);
    if (startHour) updateData["schedule.startHour"] = startHour;
    if (endHour) updateData["schedule.endHour"] = endHour;
    if (duration !== undefined) updateData.duration = duration;
    if (priority) updateData.priority = priority;
    if (quotaMo !== undefined) updateData.quotaMo = quotaMo;
    if (speedKbps !== undefined) updateData.speedKbps = speedKbps;
    if (active !== undefined) updateData.active = active;

    const access = await UserAccess.findByIdAndUpdate(id, updateData, { new: true })
      .populate("user", "name email")
      .populate("group", "name")
      .populate("createdBy", "name");

    if (!access) {
      return res.status(404).json({ message: "Accès non trouvé" });
    }

    res.status(200).json(access);
  } catch (err) {
    next(err);
  }
};

// Supprimer un accès
export const deleteAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await UserAccess.findByIdAndDelete(id);

    if (!access) {
      return res.status(404).json({ message: "Accès non trouvé" });
    }

    res.status(200).json({ message: "Accès supprimé avec succès" });
  } catch (err) {
    next(err);
  }
};

// Tableau récapitulatif (liste avec détails)
export const getAccessSummary = async (req, res, next) => {
  try {
    const accesses = await UserAccess.find({ active: true })
      .populate("user", "name email")
      .populate("group", "name")
      .sort({ createdAt: -1 });

    const summary = accesses.map(a => ({
      id: a._id,
      selection: a.user ? a.user.name : (a.group ? a.group.name : "-"),
      type: a.user ? "Utilisateur" : "Groupe",
      dateDebut: a.periodicity.startDate ? a.periodicity.startDate.toISOString().split("T")[0] : "-",
      dateFin: a.periodicity.endDate ? a.periodicity.endDate.toISOString().split("T")[0] : "-",
      heureDebut: a.schedule.startHour,
      heureFin: a.schedule.endHour,
      duree: a.duration === 0 ? "Illimité" : `${a.duration} min`,
      periodicite: a.periodicity.type,
      quotaMo: a.quotaMo === 0 ? "Illimité" : `${a.quotaMo} Mo`,
      vitesseKbps: a.speedKbps === 0 ? "Maximum" : `${a.speedKbps} kbit/s`
    }));

    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};
