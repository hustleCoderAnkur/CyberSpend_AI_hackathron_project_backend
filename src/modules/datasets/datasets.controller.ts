import type { Request, Response, NextFunction } from "express";

import {
    createDataset,
    getDatasetsByWorkspace,
    getDatasetById,
    updateDatasetStatus,
    DatasetError,
} from "./datasets.service.js";

import type {
    CreateDatasetInput,
    UpdateDatasetStatusInput,
} from "./datasets.schema.js";

function handleDatasetError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof DatasetError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

export async function createDatasetController(
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

        const dataset = await createDataset(
            req.body as CreateDatasetInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Dataset created successfully",
            data: dataset,
        });
    } catch (error) {
        handleDatasetError(error, res, next);
    }
}

export async function getDatasetsByWorkspaceController(
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

        const datasets = await getDatasetsByWorkspace(
            workspaceId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Datasets fetched successfully",
            data: datasets,
        });
    } catch (error) {
        handleDatasetError(error, res, next);
    }
}

export async function getDatasetController(
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

        const datasetId = req.params.datasetId;

        if (typeof datasetId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid dataset ID",
            });
            return;
        }

        const dataset = await getDatasetById(
            datasetId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Dataset fetched successfully",
            data: dataset,
        });
    } catch (error) {
        handleDatasetError(error, res, next);
    }
}

export async function updateDatasetStatusController(
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

        const datasetId = req.params.datasetId;

        if (typeof datasetId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid dataset ID",
            });
            return;
        }

        const dataset = await updateDatasetStatus(
            datasetId,
            req.body as UpdateDatasetStatusInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Dataset status updated successfully",
            data: dataset,
        });
    } catch (error) {
        handleDatasetError(error, res, next);
    }
}