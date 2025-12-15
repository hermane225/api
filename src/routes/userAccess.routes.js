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
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Toutes les routes nécessitent authentification
router.use(verifyToken);

// POST /api/user-access - Créer un accès
router.post("/", createAccess);

// GET /api/user-access - Lister tous les accès (filtres: ?userId=&groupId=&active=)
router.get("/", getAllAccess);

// GET /api/user-access/summary - Tableau récapitulatif
router.get("/summary", getAccessSummary);

// GET /api/user-access/user/:userId - Accès d'un utilisateur spécifique
router.get("/user/:userId", getAccessByUser);

// GET /api/user-access/:id - Détail d'un accès
router.get("/:id", getAccessById);

// PUT /api/user-access/:id - Mettre à jour un accès
router.put("/:id", updateAccess);

// DELETE /api/user-access/:id - Supprimer un accès
router.delete("/:id", deleteAccess);

export default router;
