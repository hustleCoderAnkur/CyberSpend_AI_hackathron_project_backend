import type { Request, Response, NextFunction } from "express";

import {
    createWorkspace,
    getOrganizationWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    WorkspaceError,
} from "./workspaces.service.js";

import type {
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
} from "./workspaces.schema.js";

function handleWorkspaceError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof WorkspaceError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

export async function createWorkspaceController(
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

        const workspace = await createWorkspace(
            req.body as CreateWorkspaceInput,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Workspace created successfully",
            data: workspace,
        });
    } catch (error) {
        handleWorkspaceError(error, res, next);
    }
}

export async function getOrganizationWorkspacesController(
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

        const workspaces = await getOrganizationWorkspaces(
            organizationId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Workspaces fetched successfully",
            data: workspaces,
        });
    } catch (error) {
        handleWorkspaceError(error, res, next);
    }
}

export async function getWorkspaceController(
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

        const workspace = await getWorkspaceById(
            workspaceId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Workspace fetched successfully",
            data: workspace,
        });
    } catch (error) {
        handleWorkspaceError(error, res, next);
    }
}

export async function updateWorkspaceController(
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

        const workspace = await updateWorkspace(
            workspaceId,
            req.body as UpdateWorkspaceInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Workspace updated successfully",
            data: workspace,
        });
    } catch (error) {
        handleWorkspaceError(error, res, next);
    }
}