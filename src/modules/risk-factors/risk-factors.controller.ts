
import type { Request, Response } from "express";

import {
    createRiskFactor,
    getRiskFactorById,
    getRiskFactorsByAssessmentRun,
    RiskFactorError,
} from "./risk-factors.service.js";

import type { CreateRiskFactorInput } from "./risk-factors.schema.js";

function handleError(error: unknown, res: Response) {
    if (error instanceof RiskFactorError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    console.error("Risk factors error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}

export async function createRiskFactorController(
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

        const factor = await createRiskFactor(
            req.body as CreateRiskFactorInput,
            userId,
        );

        return res.status(201).json({
            success: true,
            message: "Risk factor created successfully",
            data: factor,
        });
    } catch (error) {
        return handleError(error, res);
    }
}

export async function getRiskFactorsByAssessmentRunController(
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

        const assessmentRunId = req.params.assessmentRunId;

        if (typeof assessmentRunId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid assessment run ID is required",
            });
        }

        const data = await getRiskFactorsByAssessmentRun(
            assessmentRunId,
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

export async function getRiskFactorByIdController(
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

        const riskFactorId = req.params.riskFactorId;

        if (typeof riskFactorId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid risk factor ID is required",
            });
        }

        const data = await getRiskFactorById(riskFactorId, userId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return handleError(error, res);
    }
}
