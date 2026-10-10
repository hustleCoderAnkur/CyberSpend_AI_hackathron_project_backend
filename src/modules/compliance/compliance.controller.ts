import type { Request, Response, NextFunction } from "express";

import {
    createComplianceMapping,
    getComplianceMappingsByOrganization,
    getComplianceMappingById,
    updateComplianceMapping,
    ComplianceError,
} from "./compliance.service.js";

import type {
    CreateComplianceMappingInput,
    UpdateComplianceMappingInput,
} from "./compliance.schema.js";

function handleComplianceError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof ComplianceError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

// Create compliance mapping
export async function createComplianceMappingController(
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

        const mapping = await createComplianceMapping(
            req.body as CreateComplianceMappingInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Compliance mapping created successfully",
            data: mapping,
        });
    } catch (error) {
        handleComplianceError(error, res, next);
    }
}

// Get compliance mappings by organization
export async function getComplianceMappingsByOrganizationController(
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

        const mappings = await getComplianceMappingsByOrganization(
            organizationId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Compliance mappings fetched successfully",
            data: mappings,
        });
    } catch (error) {
        handleComplianceError(error, res, next);
    }
}

// Get compliance mapping by ID
export async function getComplianceMappingController(
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

        const mappingId = req.params.mappingId;

        if (typeof mappingId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid compliance mapping ID",
            });
            return;
        }

        const mapping = await getComplianceMappingById(
            mappingId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Compliance mapping fetched successfully",
            data: mapping,
        });
    } catch (error) {
        handleComplianceError(error, res, next);
    }
}

// Update compliance mapping
export async function updateComplianceMappingController(
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

        const mappingId = req.params.mappingId;

        if (typeof mappingId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid compliance mapping ID",
            });
            return;
        }

        const mapping = await updateComplianceMapping(
            mappingId,
            req.body as UpdateComplianceMappingInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Compliance mapping updated successfully",
            data: mapping,
        });
    } catch (error) {
        handleComplianceError(error, res, next);
    }
}