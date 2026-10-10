import { Router } from "express";

import {
    createDatasetController,
    getDatasetsByWorkspaceController,
    getDatasetController,
    updateDatasetStatusController,
} from "./datasets.controller.js";

import {
    createDatasetSchema,
    workspaceIdSchema,
    datasetIdSchema,
    updateDatasetStatusSchema,
} from "./datasets.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All dataset routes require authentication.
router.use(authenticate);

// Create dataset metadata
router.post(
    "/",
    validateRequest({
        body: createDatasetSchema.shape.body,
    }),
    createDatasetController
);

// List datasets belonging to a workspace
router.get(
    "/workspace/:workspaceId",
    validateRequest({
        params: workspaceIdSchema.shape.params,
    }),
    getDatasetsByWorkspaceController
);

// Get dataset by ID
router.get(
    "/:datasetId",
    validateRequest({
        params: datasetIdSchema.shape.params,
    }),
    getDatasetController
);

// Update dataset processing status
router.patch(
    "/:datasetId/status",
    validateRequest({
        params: updateDatasetStatusSchema.shape.params,
        body: updateDatasetStatusSchema.shape.body,
    }),
    updateDatasetStatusController
);

export default router;