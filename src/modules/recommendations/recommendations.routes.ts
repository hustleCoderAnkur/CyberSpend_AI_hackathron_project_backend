import { Router } from "express";

import {
    createRecommendationController,
    getRecommendationByIdController,
    getRecommendationsByAssessmentRunController,
    updateRecommendationStatusController,
} from "./recommendations.controller.js";

import {
    createRecommendationSchema,
    recommendationIdSchema,
    assessmentRunRecommendationsSchema,
    updateRecommendationStatusSchema,
} from "./recommendations.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    validateRequest({ body: createRecommendationSchema.shape.body }),
    createRecommendationController,
);

router.get(
    "/assessment-run/:assessmentRunId",
    validateRequest({
        params: assessmentRunRecommendationsSchema.shape.params,
    }),
    getRecommendationsByAssessmentRunController,
);

router.get(
    "/:recommendationId",
    validateRequest({
        params: recommendationIdSchema.shape.params,
    }),
    getRecommendationByIdController,
);

router.patch(
    "/:recommendationId/status",
    validateRequest({
        params: updateRecommendationStatusSchema.shape.params,
        body: updateRecommendationStatusSchema.shape.body,
    }),
    updateRecommendationStatusController,
);

export default router;