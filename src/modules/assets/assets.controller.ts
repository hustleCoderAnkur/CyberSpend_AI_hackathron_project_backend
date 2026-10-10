import type { Request, Response, NextFunction } from "express";

import {
    createAsset,
    getAssetsByOrganization,
    getAssetById,
    updateAsset,
    AssetError,
} from "./assets.service.js";

import type {
    CreateAssetInput,
    UpdateAssetInput,
} from "./assets.schema.js";

function handleAssetError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof AssetError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

export async function createAssetController(
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

        const asset = await createAsset(
            req.body as CreateAssetInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Asset created successfully",
            data: asset,
        });
    } catch (error) {
        handleAssetError(error, res, next);
    }
}

export async function getAssetsByOrganizationController(
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

        const organizationId = req.params.organizationId;

        if (typeof organizationId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
            return;
        }

        const assets = await getAssetsByOrganization(
            organizationId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Assets fetched successfully",
            data: assets,
        });
    } catch (error) {
        handleAssetError(error, res, next);
    }
}

export async function getAssetController(
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

        const asset = await getAssetById(
            assetId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Asset fetched successfully",
            data: asset,
        });
    } catch (error) {
        handleAssetError(error, res, next);
    }
}

export async function updateAssetController(
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

        const asset = await updateAsset(
            assetId,
            req.body as UpdateAssetInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Asset updated successfully",
            data: asset,
        });
    } catch (error) {
        handleAssetError(error, res, next);
    }
}