import type { Request, Response, NextFunction } from "express";

import {
    createAssessmentRun,
    getAssessmentRuns,
    getAssessmentRunById,
    updateAssessmentRunResult,
    AssessmentRunError,
} from "./assessment-runs.service.js";

import type {
    CreateAssessmentRunInput,
    UpdateAssessmentRunResultInput,
} from "./assessment-runs.schema.js";

function handleAssessmentRunError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof AssessmentRunError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

// Create assessment run
export async function createAssessmentRunController(
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

        const run = await createAssessmentRun(
            req.body as CreateAssessmentRunInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Assessment run created successfully",
            data: run,
        });
    } catch (error) {
        handleAssessmentRunError(error, res, next);
    }
}

// List assessment runs
export async function getAssessmentRunsController(
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

        const runs = await getAssessmentRuns(
            assessmentId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Assessment runs fetched successfully",
            data: runs,
        });
    } catch (error) {
        handleAssessmentRunError(error, res, next);
    }
}

// Get assessment run by ID
export async function getAssessmentRunController(
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

        const runId = req.params.runId;

        if (typeof runId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid assessment run ID",
            });
            return;
        }

        const run = await getAssessmentRunById(
            runId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Assessment run fetched successfully",
            data: run,
        });
    } catch (error) {
        handleAssessmentRunError(error, res, next);
    }
}

// Update assessment run results
export async function updateAssessmentRunResultController(
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

        const runId = req.params.runId;

        if (typeof runId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid assessment run ID",
            });
            return;
        }

        const run = await updateAssessmentRunResult(
            runId,
            req.body as UpdateAssessmentRunResultInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Assessment run results updated successfully",
            data: run,
        });
    } catch (error) {
        handleAssessmentRunError(error, res, next);
    }
}