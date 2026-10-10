import type { Request, Response, NextFunction } from "express";

import {
    createIncident,
    getIncidentsByOrganization,
    getIncidentById,
    updateIncident,
    IncidentError,
} from "./incidents.service.js";

import type {
    CreateIncidentInput,
    UpdateIncidentInput,
} from "./incidents.schema.js";

function handleIncidentError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof IncidentError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

// Create incident
export async function createIncidentController(
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

        const incident = await createIncident(
            req.body as CreateIncidentInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Incident created successfully",
            data: incident,
        });
    } catch (error) {
        handleIncidentError(error, res, next);
    }
}

// Get incidents by organization
export async function getIncidentsByOrganizationController(
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

        const incidents = await getIncidentsByOrganization(
            organizationId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Incidents fetched successfully",
            data: incidents,
        });
    } catch (error) {
        handleIncidentError(error, res, next);
    }
}

// Get incident by ID
export async function getIncidentController(
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

        const incidentId = req.params.incidentId;

        if (typeof incidentId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
            return;
        }

        const incident = await getIncidentById(
            incidentId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Incident fetched successfully",
            data: incident,
        });
    } catch (error) {
        handleIncidentError(error, res, next);
    }
}

// Update incident
export async function updateIncidentController(
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

        const incidentId = req.params.incidentId;

        if (typeof incidentId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid incident ID",
            });
            return;
        }

        const incident = await updateIncident(
            incidentId,
            req.body as UpdateIncidentInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Incident updated successfully",
            data: incident,
        });
    } catch (error) {
        handleIncidentError(error, res, next);
    }
}