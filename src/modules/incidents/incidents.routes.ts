import { Router } from "express";

import {
    createIncidentController,
    getIncidentsByOrganizationController,
    getIncidentController,
    updateIncidentController,
} from "./incidents.controller.js";

import {
    createIncidentSchema,
    incidentIdSchema,
    organizationIdSchema,
    updateIncidentSchema,
} from "./incidents.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All incident routes require authentication.
router.use(authenticate);

// Create incident
router.post(
    "/",
    validateRequest({
        body: createIncidentSchema.shape.body,
    }),
    createIncidentController
);

// Get incidents by organization
router.get(
    "/organization/:organizationId",
    validateRequest({
        params: organizationIdSchema.shape.params,
    }),
    getIncidentsByOrganizationController
);

// Get incident by ID
router.get(
    "/:incidentId",
    validateRequest({
        params: incidentIdSchema.shape.params,
    }),
    getIncidentController
);

// Update incident
router.patch(
    "/:incidentId",
    validateRequest({
        params: updateIncidentSchema.shape.params,
        body: updateIncidentSchema.shape.body,
    }),
    updateIncidentController
);

export default router;