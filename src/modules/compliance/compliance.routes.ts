import { Router } from "express";

import {
    createComplianceMappingController,
    getComplianceMappingsByOrganizationController,
    getComplianceMappingController,
    updateComplianceMappingController,
} from "./compliance.controller.js";

import {
    createComplianceMappingSchema,
    complianceMappingIdSchema,
    organizationIdSchema,
    updateComplianceMappingSchema,
} from "./compliance.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All compliance routes require authentication.
router.use(authenticate);

// Create compliance mapping
router.post(
    "/",
    validateRequest({
        body: createComplianceMappingSchema.shape.body,
    }),
    createComplianceMappingController
);

// Get compliance mappings by organization
router.get(
    "/organization/:organizationId",
    validateRequest({
        params: organizationIdSchema.shape.params,
    }),
    getComplianceMappingsByOrganizationController
);

// Get compliance mapping by ID
router.get(
    "/:mappingId",
    validateRequest({
        params: complianceMappingIdSchema.shape.params,
    }),
    getComplianceMappingController
);

// Update compliance mapping
router.patch(
    "/:mappingId",
    validateRequest({
        params: updateComplianceMappingSchema.shape.params,
        body: updateComplianceMappingSchema.shape.body,
    }),
    updateComplianceMappingController
);

export default router;