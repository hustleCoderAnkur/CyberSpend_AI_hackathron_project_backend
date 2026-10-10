import { Router } from "express";

import {
    createAssessmentRunController,
    getAssessmentRunsController,
    getAssessmentRunController,
    updateAssessmentRunResultController,
} from "./assessment-runs.controller.js";

import {
    createAssessmentRunSchema,
    assessmentIdSchema,
    assessmentRunIdSchema,
    updateAssessmentRunResultSchema,
} from "./assessment-runs.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

router.use(authenticate);

// Create assessment run
router.post(
    "/",
    validateRequest({
        body: createAssessmentRunSchema.shape.body,
    }),
    createAssessmentRunController
);

// List runs for an assessment
router.get(
    "/assessment/:assessmentId",
    validateRequest({
        params: assessmentIdSchema.shape.params,
    }),
    getAssessmentRunsController
);

// Get a specific run
router.get(
    "/:runId",
    validateRequest({
        params: assessmentRunIdSchema.shape.params,
    }),
    getAssessmentRunController
);

// Update calculated results
router.patch(
    "/:runId/results",
    validateRequest({
        params: updateAssessmentRunResultSchema.shape.params,
        body: updateAssessmentRunResultSchema.shape.body,
    }),
    updateAssessmentRunResultController
);

export default router;