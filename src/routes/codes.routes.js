import express from "express";
import { verifyToken, permit } from "../middleware/auth.js";
import { generateCodes, listCodes, assignCode, checkCodeStatus } from "../controllers/code.controller.js";

const router = express.Router();

router.post("/generate", verifyToken, permit("admin","agent"), generateCodes);
router.get("/", verifyToken, listCodes);
router.get("/check/:codeStr", checkCodeStatus);
router.put("/:id/assign", verifyToken, permit("agent","admin"), assignCode);

export default router;
