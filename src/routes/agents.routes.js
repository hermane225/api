import express from "express";
import { verifyToken, permit } from "../middleware/auth.js";
import { createAgent, listAgents, updateAgent, deleteAgent } from "../controllers/agent.controller.js";

const router = express.Router();

router.get("/", verifyToken, listAgents);
router.post("/", verifyToken, permit("admin"), createAgent);
router.put("/:id", verifyToken, permit("admin"), updateAgent);
router.delete("/:id", verifyToken, permit("admin"), deleteAgent);

export default router;
