import { Router } from "express";

import {
    createAssessmentController,
    getAssessmentsByWorkspaceController,
    getAssessmentController,
    updateAssessmentController,
} from "./assessments.controller.js";

import {
    createAssessmentSchema,
    assessmentIdSchema,
    workspaceIdSchema,
    updateAssessmentSchema,
} from "./assessments.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All assessment routes require authentication.
router.use(authenticate);

// Create assessment
router.post(
    "/",
    validateRequest({
        body: createAssessmentSchema.shape.body,
    }),
    createAssessmentController
);

// Get assessments by workspace
router.get(
    "/workspace/:workspaceId",
    validateRequest({
        params: workspaceIdSchema.shape.params,
    }),
    getAssessmentsByWorkspaceController
);

// Get assessment by ID
router.get(
    "/:assessmentId",
    validateRequest({
        params: assessmentIdSchema.shape.params,
    }),
    getAssessmentController
);

// Update assessment
router.patch(
    "/:assessmentId",
    validateRequest({
        params: updateAssessmentSchema.shape.params,
        body: updateAssessmentSchema.shape.body,
    }),
    updateAssessmentController
);

export default router;