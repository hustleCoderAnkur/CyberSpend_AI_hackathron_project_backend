import { Router } from "express";

import {
    createAssetController,
    getAssetsByOrganizationController,
    getAssetController,
    updateAssetController,
} from "./assets.controller.js";

import {
    createAssetSchema,
    organizationIdSchema,
    assetIdSchema,
    updateAssetSchema,
} from "./assets.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All asset routes require authentication.
router.use(authenticate);

// Create an asset
router.post(
    "/",
    validateRequest({
        body: createAssetSchema.shape.body,
    }),
    createAssetController
);

// List assets belonging to an organization
router.get(
    "/organization/:organizationId",
    validateRequest({
        params: organizationIdSchema.shape.params,
    }),
    getAssetsByOrganizationController
);

// Get asset by ID
router.get(
    "/:assetId",
    validateRequest({
        params: assetIdSchema.shape.params,
    }),
    getAssetController
);

// Update asset
router.patch(
    "/:assetId",
    validateRequest({
        params: updateAssetSchema.shape.params,
        body: updateAssetSchema.shape.body,
    }),
    updateAssetController
);

export default router;