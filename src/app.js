import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import bornesRoutes from "./routes/bornes.routes.js";
import alertesRoutes from "./routes/alertes.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import forfaitsRoutes from "./routes/forfaits.routes.js";
import codesRoutes from "./routes/codes.routes.js";
import agentsRoutes from "./routes/agents.routes.js";
import groupRoutes from "./routes/group.routes.js";
import statistiquesRoutes from "./routes/statistiques.routes.js";

import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes API prefixées
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/bornes", bornesRoutes);  
app.use("/api/alertes", alertesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/forfaits", forfaitsRoutes);
app.use("/api/codes", codesRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/statistiques", statistiquesRoutes);

// health check
app.get("/api/health", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "dev" }));

// gestion erreurs
app.use(errorHandler);

export default app;
