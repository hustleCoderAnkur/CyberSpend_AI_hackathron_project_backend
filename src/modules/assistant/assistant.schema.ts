import { z } from "zod";

export const assistantChatSchema = z.object({
    body: z.object({
        message: z.string().trim().min(1).max(10000),
        assessmentId: z.string().uuid().optional(),
        conversationId: z.string().uuid().optional(),
        useWeb: z.boolean().default(false),
    }),
});

export type AssistantChatInput = z.infer<
    typeof assistantChatSchema
>["body"];