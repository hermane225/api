import express from "express";
import { createStatistique, getByDate } from "../controllers/statistiques.controller.js";

const router = express.Router();

// POST /api/statistiques  -> créer une entrée
router.post("/", createStatistique);

// GET /api/statistiques?date=YYYY-MM-DD -> obtenir le récapitulatif du jour
router.get("/", getByDate);

export default router;
