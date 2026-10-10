
import type { Request, Response } from "express";

import {
    createScenario,
    deleteScenario,
    getScenarioById,
    getScenariosByAssessment,
    ScenarioError,
    updateScenario,
} from "./scenarios.service.js";

import type {
    CreateScenarioInput,
    UpdateScenarioInput,
} from "./scenarios.schema.js";

function handleError(error: unknown, res: Response) {
    if (error instanceof ScenarioError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    console.error("Scenarios error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}

export async function createScenarioController(
    req: Request,
    res: Response,
) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const scenario = await createScenario(
            req.body as CreateScenarioInput,
            userId,
        );

        return res.status(201).json({
            success: true,
            message: "Scenario created successfully",
            data: scenario,
        });
    } catch (error) {
        return handleError(error, res);
    }
}

export async function getScenariosByAssessmentController(
    req: Request,
    res: Response,
) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const assessmentId = req.params.assessmentId;

        if (typeof assessmentId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid assessment ID is required",
            });
        }

        const data = await getScenariosByAssessment(
            assessmentId,
            userId,
        );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return handleError(error, res);
    }
}

export async function getScenarioByIdController(
    req: Request,
    res: Response,
) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const scenarioId = req.params.scenarioId;

        if (typeof scenarioId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid scenario ID is required",
            });
        }

        const data = await getScenarioById(scenarioId, userId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return handleError(error, res);
    }
}

export async function updateScenarioController(
    req: Request,
    res: Response,
) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const scenarioId = req.params.scenarioId;

        if (typeof scenarioId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid scenario ID is required",
            });
        }

        const data = await updateScenario(
            scenarioId,
            req.body as UpdateScenarioInput,
            userId,
        );

        return res.status(200).json({
            success: true,
            message: "Scenario updated successfully",
            data,
        });
    } catch (error) {
        return handleError(error, res);
    }
}

export async function deleteScenarioController(
    req: Request,
    res: Response,
) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const scenarioId = req.params.scenarioId;

        if (typeof scenarioId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid scenario ID is required",
            });
        }

        await deleteScenario(scenarioId, userId);

        return res.status(200).json({
            success: true,
            message: "Scenario deleted successfully",
        });
    } catch (error) {
        return handleError(error, res);
    }
}
