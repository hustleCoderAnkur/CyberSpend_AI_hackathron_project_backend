
import { Router } from "express";

import {
    createScenarioController,
    deleteScenarioController,
    getScenarioByIdController,
    getScenariosByAssessmentController,
    updateScenarioController,
} from "./scenarios.controller.js";

import {
    assessmentScenariosSchema,
    createScenarioSchema,
    scenarioIdSchema,
    updateScenarioSchema,
} from "./scenarios.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    validateRequest({
        body: createScenarioSchema.shape.body,
    }),
    createScenarioController,
);

router.get(
    "/assessment/:assessmentId",
    validateRequest({
        params: assessmentScenariosSchema.shape.params,
    }),
    getScenariosByAssessmentController,
);

router.get(
    "/:scenarioId",
    validateRequest({
        params: scenarioIdSchema.shape.params,
    }),
    getScenarioByIdController,
);

router.patch(
    "/:scenarioId",
    validateRequest({
        params: updateScenarioSchema.shape.params,
        body: updateScenarioSchema.shape.body,
    }),
    updateScenarioController,
);

router.delete(
    "/:scenarioId",
    validateRequest({
        params: scenarioIdSchema.shape.params,
    }),
    deleteScenarioController,
);

export default router;
