import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { createTransaction, listTransactions, summary } from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/", verifyToken, listTransactions);
router.post("/", verifyToken, createTransaction);
router.get("/summary", verifyToken, summary);

export default router;
