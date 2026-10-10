import { z } from "zod";

export const createAssessmentSchema = z.object({
    body: z.object({
        workspaceId: z.string().uuid(),
        name: z.string().trim().min(2).max(255),
        status: z.enum([
            "draft",
            "pending",
            "in_progress",
            "completed",
            "failed",
        ]).default("draft"),
    }),
});

export const assessmentIdSchema = z.object({
    params: z.object({
        assessmentId: z.string().uuid(),
    }),
});

export const workspaceIdSchema = z.object({
    params: z.object({
        workspaceId: z.string().uuid(),
    }),
});

export const updateAssessmentSchema = z.object({
    params: z.object({
        assessmentId: z.string().uuid(),
    }),
    body: z
        .object({
            name: z.string().trim().min(2).max(255).optional(),
            status: z
                .enum([
                    "draft",
                    "pending",
                    "in_progress",
                    "completed",
                    "failed",
                ])
                .optional(),
        })
        .refine(
            (data) => Object.values(data).some((value) => value !== undefined),
            { message: "At least one field must be provided" }
        ),
});

export type CreateAssessmentInput = z.infer<
    typeof createAssessmentSchema
>["body"];

export type AssessmentIdInput = z.infer<
    typeof assessmentIdSchema
>["params"];

export type WorkspaceIdInput = z.infer<
    typeof workspaceIdSchema
>["params"];

export type UpdateAssessmentInput = z.infer<
    typeof updateAssessmentSchema
>["body"];