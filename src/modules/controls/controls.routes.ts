import { Router } from "express";

import {
    createControlController,
    getControlsByOrganizationController,
    getControlController,
    updateControlController,
} from "./controls.controller.js";

import {
    createControlSchema,
    controlIdSchema,
    organizationIdSchema,
    updateControlSchema,
} from "./controls.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All control routes require authentication.
router.use(authenticate);

// Create security control
router.post(
    "/",
    validateRequest({
        body: createControlSchema.shape.body,
    }),
    createControlController
);

// Get controls by organization
router.get(
    "/organization/:organizationId",
    validateRequest({
        params: organizationIdSchema.shape.params,
    }),
    getControlsByOrganizationController
);

// Get security control by ID
router.get(
    "/:controlId",
    validateRequest({
        params: controlIdSchema.shape.params,
    }),
    getControlController
);

// Update security control
router.patch(
    "/:controlId",
    validateRequest({
        params: updateControlSchema.shape.params,
        body: updateControlSchema.shape.body,
    }),
    updateControlController
);

export default router;