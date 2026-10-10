import type { Request, Response, NextFunction } from "express";

import {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    OrganizationError,
} from "./organizations.service.js";

import type {
    CreateOrganizationInput,
    OrganizationIdInput,
    UpdateOrganizationInput,
} from "./organizations.schema.js";

export async function createOrganizationController(
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

        const organization = await createOrganization(
            req.body as CreateOrganizationInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Organization created successfully",
            data: organization,
        });
    } catch (error) {
        if (error instanceof OrganizationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }

        next(error);
    }
}

export async function getOrganizationController(
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

        const organization = await getOrganizationById(
            req.params as unknown as OrganizationIdInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Organization fetched successfully",
            data: organization,
        });
    } catch (error) {
        if (error instanceof OrganizationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }

        next(error);
    }
}

export async function updateOrganizationController(
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

        const organization = await updateOrganization(
            organizationId,
            req.body as UpdateOrganizationInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            data: organization,
        });
    } catch (error) {
        if (error instanceof OrganizationError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }

        next(error);
    }
}