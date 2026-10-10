import type { Request, Response, NextFunction } from "express";

import {
    createAssessment,
    getAssessmentsByWorkspace,
    getAssessmentById,
    updateAssessment,
    AssessmentError,
} from "./assessments.service.js";

import type {
    CreateAssessmentInput,
    UpdateAssessmentInput,
} from "./assessments.schema.js";

function handleAssessmentError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof AssessmentError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

// Create assessment
export async function createAssessmentController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const assessment = await createAssessment(
            req.body as CreateAssessmentInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Assessment created successfully",
            data: assessment,
        });
    } catch (error) {
        handleAssessmentError(error, res, next);
    }
}

// Get assessments by workspace
export async function getAssessmentsByWorkspaceController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const workspaceId = req.params.workspaceId;

        if (typeof workspaceId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid workspace ID",
            });
            return;
        }

        const assessments = await getAssessmentsByWorkspace(
            workspaceId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Assessments fetched successfully",
            data: assessments,
        });
    } catch (error) {
        handleAssessmentError(error, res, next);
    }
}

// Get assessment by ID
export async function getAssessmentController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const assessmentId = req.params.assessmentId;

        if (typeof assessmentId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid assessment ID",
            });
            return;
        }

        const assessment = await getAssessmentById(
            assessmentId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Assessment fetched successfully",
            data: assessment,
        });
    } catch (error) {
        handleAssessmentError(error, res, next);
    }
}

// Update assessment
export async function updateAssessmentController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const assessmentId = req.params.assessmentId;

        if (typeof assessmentId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid assessment ID",
            });
            return;
        }

        const assessment = await updateAssessment(
            assessmentId,
            req.body as UpdateAssessmentInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Assessment updated successfully",
            data: assessment,
        });
    } catch (error) {
        handleAssessmentError(error, res, next);
    }
}