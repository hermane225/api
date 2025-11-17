import express from "express";
import { verifyToken, permit } from "../middleware/auth.js";
import { generateCodes, listCodes, assignCode } from "../controllers/code.controller.js";

const router = express.Router();

router.post("/generate", verifyToken, permit("admin","agent"), generateCodes);
router.get("/", verifyToken, listCodes);
router.put("/:id/assign", verifyToken, permit("agent","admin"), assignCode);

export default router;
