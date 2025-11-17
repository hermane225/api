import express from "express";
import { verifyToken, permit } from "../middleware/auth.js";
import { listBornes, createBorne, getBorne, updateBorne, stats } from "../controllers/borne.controller.js";

const router = express.Router();

router.get("/", verifyToken, listBornes);
router.post("/", verifyToken, permit("admin"), createBorne);
router.get("/stats", verifyToken, stats);
router.get("/:id", verifyToken, getBorne);
router.put("/:id", verifyToken, permit("admin"), updateBorne);

export default router;
