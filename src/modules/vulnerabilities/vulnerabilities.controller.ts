import type { Request, Response, NextFunction } from "express";

import {
    createVulnerability,
    getVulnerabilitiesByAsset,
    getVulnerabilityById,
    updateVulnerability,
    VulnerabilityError,
} from "./vulnerabilities.service.js";

import type {
    CreateVulnerabilityInput,
    UpdateVulnerabilityInput,
} from "./vulnerabilities.schema.js";

function handleVulnerabilityError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof VulnerabilityError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

export async function createVulnerabilityController(
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

        const vulnerability = await createVulnerability(
            req.body as CreateVulnerabilityInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Vulnerability created successfully",
            data: vulnerability,
        });
    } catch (error) {
        handleVulnerabilityError(error, res, next);
    }
}

export async function getVulnerabilitiesByAssetController(
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

        const assetId = req.params.assetId;

        if (typeof assetId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid asset ID",
            });
            return;
        }

        const vulnerabilities = await getVulnerabilitiesByAsset(
            assetId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Vulnerabilities fetched successfully",
            data: vulnerabilities,
        });
    } catch (error) {
        handleVulnerabilityError(error, res, next);
    }
}

export async function getVulnerabilityController(
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

        const vulnerabilityId = req.params.vulnerabilityId;

        if (typeof vulnerabilityId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid vulnerability ID",
            });
            return;
        }

        const vulnerability = await getVulnerabilityById(
            vulnerabilityId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Vulnerability fetched successfully",
            data: vulnerability,
        });
    } catch (error) {
        handleVulnerabilityError(error, res, next);
    }
}

export async function updateVulnerabilityController(
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

        const vulnerabilityId = req.params.vulnerabilityId;

        if (typeof vulnerabilityId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid vulnerability ID",
            });
            return;
        }

        const vulnerability = await updateVulnerability(
            vulnerabilityId,
            req.body as UpdateVulnerabilityInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Vulnerability updated successfully",
            data: vulnerability,
        });
    } catch (error) {
        handleVulnerabilityError(error, res, next);
    }
}