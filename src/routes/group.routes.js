import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:id", getGroupById);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

export default router;
