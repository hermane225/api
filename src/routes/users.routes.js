import express from "express";
import { verifyToken, permit } from "../middleware/auth.js";

import { createUser, listUsers, getUser, updateUser, deleteUser ,updateUserRole, getMyProfile, updateMyProfile } from "../controllers/user.controller.js";

const router = express.Router();

// Profil personnel : récupération et mise à jour
router.get("/profile/me", verifyToken, getMyProfile);
router.put("/profile/me", verifyToken, updateMyProfile);

// Modification de rôle : réservée au super_admin et admin pour ses agents
router.put("/update-role", verifyToken, permit("super_admin", "admin"), updateUserRole);

// Liste des utilisateurs : filtrée selon le rôle
router.get("/", verifyToken, permit("super_admin", "admin", "agent"), listUsers);

// Création d'utilisateur : admin et super_admin uniquement
router.post("/", verifyToken, permit("super_admin", "admin"), createUser);

// Récupération d'un utilisateur : avec vérification d'accès dans le contrôleur
router.get("/:id", verifyToken, getUser);

// Modification d'un utilisateur : avec vérification d'accès dans le contrôleur
router.put("/:id", verifyToken, updateUser);

// Suppression d'un utilisateur : avec vérification d'accès dans le contrôleur
router.delete("/:id", verifyToken, deleteUser);

export default router;

