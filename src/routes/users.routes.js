import express from "express";
import { verifyToken, permit } from "../middleware/auth.js";

import { createUser, listUsers, getUser, updateUser, deleteUser ,updateUserRole } from "../controllers/user.controller.js";

const router = express.Router();
router.put("/update-role", verifyToken, permit("admin"), updateUserRole);

router.get("/", verifyToken, permit("admin","agent"), listUsers);
router.post("/", verifyToken, permit("admin"), createUser);
router.get("/:id", verifyToken, getUser);
router.put("/:id", verifyToken, permit("admin"), updateUser);
router.delete("/:id", verifyToken, permit("admin"), deleteUser);

export default router;

