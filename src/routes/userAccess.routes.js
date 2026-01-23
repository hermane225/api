import express from "express";
import {
  createAccess,
  getAllAccess,
  getAccessByUser,
  getAccessById,
  updateAccess,
  deleteAccess,
  getAccessSummary
} from "../controllers/userAccess.controller.js";
import { verifyToken, permit } from "../middleware/auth.js";

const router = express.Router();

// POST /api/user-access - Créer un accès (admin uniquement)
router.post("/", verifyToken, permit("admin"), createAccess);

// GET /api/user-access - Lister tous les accès (admin uniquement)
router.get("/", verifyToken, permit("admin"), getAllAccess);

// GET /api/user-access/summary - Tableau récapitulatif (admin uniquement)
router.get("/summary", verifyToken, permit("admin"), getAccessSummary);

// GET /api/user-access/user/:userId - Accès d'un utilisateur spécifique (authentification requise)
router.get("/user/:userId", verifyToken, getAccessByUser);

// GET /api/user-access/:id - Détail d'un accès (authentification requise)
router.get("/:id", verifyToken, getAccessById);

// PUT /api/user-access/:id - Mettre à jour un accès (admin uniquement)
router.put("/:id", verifyToken, permit("admin"), updateAccess);

// DELETE /api/user-access/:id - Supprimer un accès (admin uniquement)
router.delete("/:id", verifyToken, permit("admin"), deleteAccess);

export default router;

