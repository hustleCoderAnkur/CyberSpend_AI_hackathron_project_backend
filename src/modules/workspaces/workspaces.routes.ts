import { Router } from "express";

import {
    createWorkspaceController,
    getOrganizationWorkspacesController,
    getWorkspaceController,
    updateWorkspaceController,
} from "./workspaces.controller.js";

import {
    createWorkspaceSchema,
    organizationIdSchema,
    workspaceIdSchema,
    updateWorkspaceSchema,
} from "./workspaces.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All workspace routes require authentication.
router.use(authenticate);

// Create a workspace
router.post(
    "/",
    validateRequest({
        body: createWorkspaceSchema.shape.body,
    }),
    createWorkspaceController
);

// List workspaces belonging to an organization
router.get(
    "/organization/:organizationId",
    validateRequest({
        params: organizationIdSchema.shape.params,
    }),
    getOrganizationWorkspacesController
);

// Get workspace by ID
router.get(
    "/:workspaceId",
    validateRequest({
        params: workspaceIdSchema.shape.params,
    }),
    getWorkspaceController
);

// Update workspace
router.patch(
    "/:workspaceId",
    validateRequest({
        params: updateWorkspaceSchema.shape.params,
        body: updateWorkspaceSchema.shape.body,
    }),
    updateWorkspaceController
);

export default router;