
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import organizationsRoutes from "./modules/organizations/organizations.routes.js";
import workspacesRoutes from "./modules/workspaces/workspaces.routes.js";
import datasetsRoutes from "./modules/datasets/datasets.routes.js";
import assetsRoutes from "./modules/assets/assets.routes.js";
import vulnerabilitiesRoutes from "./modules/vulnerabilities/vulnerabilities.routes.js";
import incidentsRoutes from "./modules/incidents/incidents.routes.js";
import controlsRoutes from "./modules/controls/controls.routes.js";
import complianceRoutes from "./modules/compliance/compliance.routes.js";
import assessmentsRoutes from "./modules/assessments/assessments.routes.js";
import assessmentRunsRoutes from "./modules/assessment-runs/assessment-runs.routes.js";
import recommendationsRoutes from "./modules/recommendations/recommendations.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import riskFactorsRoutes from "./modules/risk-factors/risk-factors.routes.js";
import scenariosRoutes from "./modules/scenarios/scenarios.routes.js";
import assistantRoutes from "./modules/assistant/assistant.routes.js";

import { errorHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "CyberSpend AI backend is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api/workspaces", workspacesRoutes);

app.use("/api/datasets", datasetsRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/vulnerabilities", vulnerabilitiesRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/controls", controlsRoutes);
app.use("/api/compliance", complianceRoutes);

app.use("/api/assessments", assessmentsRoutes);
app.use("/api/assessment-runs", assessmentRunsRoutes);
app.use("/api/risk-factors", riskFactorsRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/scenarios", scenariosRoutes);
app.use("/api/reports", reportsRoutes);

app.use("/api/assistant", assistantRoutes);

app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use(errorHandler);
