import express from "express";
import { verifyToken, permit } from "../middleware/auth.js";
import { createForfait, listForfaits, updateForfait, deleteForfait } from "../controllers/forfait.controller.js";

const router = express.Router();

router.get("/", verifyToken, listForfaits);
router.post("/", verifyToken, permit("admin"), createForfait);
router.put("/:id", verifyToken, permit("admin"), updateForfait);
router.delete("/:id", verifyToken, permit("admin"), deleteForfait);

export default router;
