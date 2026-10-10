import { Router } from "express";

import {
    createOrganizationController,
    getOrganizationController,
    updateOrganizationController,
} from "./organizations.controller.js";

import {
    createOrganizationSchema,
    organizationIdSchema,
    updateOrganizationSchema,
} from "./organizations.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// Create organization
router.post(
    "/",
    authenticate,
    validateRequest({
        body: createOrganizationSchema.shape.body,
    }),
    createOrganizationController
);

// Get organization by ID
router.get(
    "/:organizationId",
    authenticate,
    validateRequest({
        params: organizationIdSchema.shape.params,
    }),
    getOrganizationController
);

// Update organization
router.patch(
    "/:organizationId",
    authenticate,
    validateRequest({
        params: updateOrganizationSchema.shape.params,
        body: updateOrganizationSchema.shape.body,
    }),
    updateOrganizationController
);

export default router;