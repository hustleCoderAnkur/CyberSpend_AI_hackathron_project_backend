import { Router } from "express";

import {
    createVulnerabilityController,
    getVulnerabilitiesByAssetController,
    getVulnerabilityController,
    updateVulnerabilityController,
} from "./vulnerabilities.controller.js";

import {
    createVulnerabilitySchema,
    assetIdSchema,
    vulnerabilityIdSchema,
    updateVulnerabilitySchema,
} from "./vulnerabilities.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All vulnerability routes require authentication.
router.use(authenticate);

// Create a vulnerability
router.post(
    "/",
    validateRequest({
        body: createVulnerabilitySchema.shape.body,
    }),
    createVulnerabilityController
);

// List vulnerabilities belonging to an asset
router.get(
    "/asset/:assetId",
    validateRequest({
        params: assetIdSchema.shape.params,
    }),
    getVulnerabilitiesByAssetController
);

// Get vulnerability by ID
router.get(
    "/:vulnerabilityId",
    validateRequest({
        params: vulnerabilityIdSchema.shape.params,
    }),
    getVulnerabilityController
);

// Update a vulnerability
router.patch(
    "/:vulnerabilityId",
    validateRequest({
        params: updateVulnerabilitySchema.shape.params,
        body: updateVulnerabilitySchema.shape.body,
    }),
    updateVulnerabilityController
);

export default router;