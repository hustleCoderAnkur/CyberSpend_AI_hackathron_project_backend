import { Router } from "express";

import {
    chatWithAssistantController,
} from "./assistant.controller.js";

import {
    assistantChatSchema,
} from "./assistant.schema.js";

import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

// All assistant endpoints require authentication.
router.use(authenticate);

// Chat and request assessment insights
router.post(
    "/chat",
    validateRequest({
        body: assistantChatSchema.shape.body,
    }),
    chatWithAssistantController
);

export default router;