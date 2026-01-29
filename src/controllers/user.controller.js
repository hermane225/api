import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Group from "../models/Group.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate("group");
    res.json(users);
  } catch (err) { next(err); }
};

export const createUser = async (req, res, next) => {
  try {
    const { login, password, name, role, group } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ login, password: hashed, name, role, group });
    res.status(201).json(user);
  } catch (err) { next(err); }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("group");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(user);
  } catch (err) { next(err); }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) { next(err); }
};

// Modifier le rôle d’un utilisateur (réservé à l’admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    // Vérifie que le rôle demandé est valide
    const allowedRoles = ["admin", "agent", "user"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    // Trouve et met à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      message: "Rôle mis à jour avec succès",
      user: { id: user._id, login: user.login, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// Obtenir le profil personnel de l'utilisateur connecté
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("group");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    
    res.json({
      id: user._id,
      login: user.login,
      name: user.name,
      role: user.role,
      group: user.group,
      profile: user.profile || {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    next(err);
  }
};

// Mettre à jour le profil personnel de l'utilisateur connecté
export const updateMyProfile = async (req, res, next) => {
  try {
    const { profile, name } = req.body;
    
    const updates = {
      ...(name && { name }),
      ...(profile && { profile: { ...profile } })
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).populate("group");

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json({
      message: "✅ Profil mis à jour avec succès",
      user: {
        id: user._id,
        login: user.login,
        name: user.name,
        role: user.role,
        group: user.group,
        profile: user.profile || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};
