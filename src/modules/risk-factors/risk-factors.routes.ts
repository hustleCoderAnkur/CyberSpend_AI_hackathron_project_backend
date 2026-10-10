
import { Router } from "express";

import {
    createRiskFactorController,
    getRiskFactorByIdController,
    getRiskFactorsByAssessmentRunController,
} from "./risk-factors.controller.js";

import {
    assessmentRunRiskFactorsSchema,
    createRiskFactorSchema,
    riskFactorIdSchema,
} from "./risk-factors.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    validateRequest({
        body: createRiskFactorSchema.shape.body,
    }),
    createRiskFactorController,
);

router.get(
    "/assessment-run/:assessmentRunId",
    validateRequest({
        params: assessmentRunRiskFactorsSchema.shape.params,
    }),
    getRiskFactorsByAssessmentRunController,
);

router.get(
    "/:riskFactorId",
    validateRequest({
        params: riskFactorIdSchema.shape.params,
    }),
    getRiskFactorByIdController,
);

export default router;
