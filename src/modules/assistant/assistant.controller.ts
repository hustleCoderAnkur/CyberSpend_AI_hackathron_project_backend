import type { Request, Response, NextFunction } from "express";

import {
    chatWithAssistant,
    AssistantError,
} from "./assistant.service.js";

import type { AssistantChatInput } from "./assistant.schema.js";

function handleAssistantError(
    error: unknown,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof AssistantError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

// Chat with CyberSpend AI assistant
export async function chatWithAssistantController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const result = await chatWithAssistant(
            req.body as AssistantChatInput,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Assistant response generated successfully",
            data: result,
        });
    } catch (error) {
        handleAssistantError(error, res, next);
    }
}