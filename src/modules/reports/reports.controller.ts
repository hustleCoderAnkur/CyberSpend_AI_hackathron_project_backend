
import type { Request, Response } from "express";

import {
    createReport,
    getReportById,
    getReportsByAssessmentRun,
    ReportError,
} from "./reports.service.js";

import type { CreateReportInput } from "./reports.schema.js";

function handleError(error: unknown, res: Response) {
    if (error instanceof ReportError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    console.error("Reports error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}

export async function createReportController(
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

        const report = await createReport(
            req.body as CreateReportInput,
            userId,
        );

        return res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: report,
        });
    } catch (error) {
        return handleError(error, res);
    }
}

export async function getReportsByAssessmentRunController(
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

        const data = await getReportsByAssessmentRun(
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

export async function getReportByIdController(
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

        const reportId = req.params.reportId;

        if (typeof reportId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid report ID is required",
            });
        }

        const data = await getReportById(reportId, userId);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return handleError(error, res);
    }
}
