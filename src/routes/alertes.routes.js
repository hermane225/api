import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { listAlertes, createAlerte, updateAlerte, deleteAlerte } from "../controllers/alerte.controller.js";

const router = express.Router();

router.get("/", verifyToken, listAlertes);
router.post("/", verifyToken, createAlerte);
router.put("/:id", verifyToken, updateAlerte);
router.delete("/:id", verifyToken, deleteAlerte);

export default router;
