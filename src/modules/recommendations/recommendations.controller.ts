
import type { Request, Response } from "express";

import {
    createRecommendation,
    getRecommendationById,
    getRecommendationsByAssessmentRun,
    RecommendationError,
    updateRecommendationStatus,
} from "./recommendations.service.js";

import type {
    CreateRecommendationInput,
    UpdateRecommendationStatusInput,
} from "./recommendations.schema.js";

function handleError(error: unknown, res: Response) {
    if (error instanceof RecommendationError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    console.error("Recommendations error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}

export async function createRecommendationController(
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

        const recommendation = await createRecommendation(
            req.body as CreateRecommendationInput,
            userId,
        );

        return res.status(201).json({
            success: true,
            message: "Recommendation created successfully",
            data: recommendation,
        });
    } catch (error) {
        return handleError(error, res);
    }
}

export async function getRecommendationsByAssessmentRunController(
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

        const data = await getRecommendationsByAssessmentRun(
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

export async function getRecommendationByIdController(
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

        const recommendationId = req.params.recommendationId;

        if (typeof recommendationId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid recommendation ID is required",
            });
        }

        const data = await getRecommendationById(
            recommendationId,
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

export async function updateRecommendationStatusController(
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

        const recommendationId = req.params.recommendationId;

        if (typeof recommendationId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid recommendation ID is required",
            });
        }

        const data = await updateRecommendationStatus(
            recommendationId,
            req.body as UpdateRecommendationStatusInput,
            userId,
        );

        return res.status(200).json({
            success: true,
            message: "Recommendation status updated successfully",
            data,
        });
    } catch (error) {
        return handleError(error, res);
    }
}
