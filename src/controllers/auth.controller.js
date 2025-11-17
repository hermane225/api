import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

//  REGISTER 
export const register = async (req, res, next) => {
  try {
    const { login, password, name } = req.body;

    const existing = await User.findOne({ login });
    if (existing) return res.status(400).json({ message: "Login déjà utilisé" });

    const hash = await bcrypt.hash(password, 10);

    // Par défaut, tout nouveau compte est "user"
    const user = await User.create({
      login,
      password: hash,
      name,
      role: "user",
    });

    res.status(201).json({
      message: "✅ Utilisateur créé avec succès",
      user: { id: user._id, login: user.login, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

//  LOGIN
export const login = async (req, res, next) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ login });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Mot de passe incorrect" });

    // Le rôle est lu directement depuis la base ici 
    const token = jwt.sign(
      { id: user._id, role: user.role, login: user.login },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30m" }
    );

    res.json({
      message: "Connexion réussie",
      user: { id: user._id, login: user.login, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
};

//  FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  try {
    const { login } = req.body;
    const user = await User.findOne({ login });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({
      message: "✅ Lien de réinitialisation généré",
      resetToken,
    });
  } catch (err) {
    next(err);
  }
};

//  RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token invalide ou expiré" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "✅ Mot de passe réinitialisé avec succès" });
  } catch (err) {
    next(err);
  }
};
