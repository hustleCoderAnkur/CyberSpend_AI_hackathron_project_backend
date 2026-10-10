import type { Request, Response, NextFunction } from "express";

import {
    createControl,
    getControlsByOrganization,
    getControlById,
    updateControl,
    ControlError,
} from "./controls.service.js";

import type {
    CreateControlInput,
    UpdateControlInput,
} from "./controls.schema.js";

function handleControlError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof ControlError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

// Create security control
export async function createControlController(
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

        const control = await createControl(
            req.body as CreateControlInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Security control created successfully",
            data: control,
        });
    } catch (error) {
        handleControlError(error, res, next);
    }
}

// Get controls by organization
export async function getControlsByOrganizationController(
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

        const controls = await getControlsByOrganization(
            organizationId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Security controls fetched successfully",
            data: controls,
        });
    } catch (error) {
        handleControlError(error, res, next);
    }
}

// Get security control by ID
export async function getControlController(
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

        const controlId = req.params.controlId;

        if (typeof controlId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid control ID",
            });
            return;
        }

        const control = await getControlById(
            controlId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Security control fetched successfully",
            data: control,
        });
    } catch (error) {
        handleControlError(error, res, next);
    }
}

// Update security control
export async function updateControlController(
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

        const controlId = req.params.controlId;

        if (typeof controlId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid control ID",
            });
            return;
        }

        const control = await updateControl(
            controlId,
            req.body as UpdateControlInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Security control updated successfully",
            data: control,
        });
    } catch (error) {
        handleControlError(error, res, next);
    }
}