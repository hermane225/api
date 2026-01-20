import express from "express";
import { verifyToken, permit } from "../middleware/auth.js";
import { listBornes, createBorne, getBorne, updateBorne, stats, pushBorneData } from "../controllers/borne.controller.js";

const router = express.Router();

router.get("/", verifyToken, listBornes);
router.post("/", verifyToken, permit("admin"), createBorne);
router.get("/stats", verifyToken, stats);
router.get("/:id", verifyToken, getBorne);
router.put("/:id", verifyToken, permit("admin"), updateBorne);

// Route pour recevoir les données push de la borne (sans authentification)
router.post("/push/data", pushBorneData);

export default router;
