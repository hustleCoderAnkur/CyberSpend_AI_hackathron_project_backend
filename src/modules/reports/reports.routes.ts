
import { Router } from "express";

import {
    createReportController,
    getReportByIdController,
    getReportsByAssessmentRunController,
} from "./reports.controller.js";

import {
    assessmentRunReportsSchema,
    createReportSchema,
    reportIdSchema,
} from "./reports.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    validateRequest({
        body: createReportSchema.shape.body,
    }),
    createReportController,
);

router.get(
    "/assessment-run/:assessmentRunId",
    validateRequest({
        params: assessmentRunReportsSchema.shape.params,
    }),
    getReportsByAssessmentRunController,
);

router.get(
    "/:reportId",
    validateRequest({
        params: reportIdSchema.shape.params,
    }),
    getReportByIdController,
);

export default router;
