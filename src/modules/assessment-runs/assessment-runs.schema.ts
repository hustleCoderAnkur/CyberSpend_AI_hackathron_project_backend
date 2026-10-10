import { z } from "zod";

export const createAssessmentRunSchema = z.object({
    body: z.object({
        assessmentId: z.string().uuid(),
        runNumber: z.number().int().positive(),
        modelVersion: z.string().trim().min(1).max(100),
        inputSnapshot: z.record(z.string(), z.unknown()),
    }),
});

export const assessmentRunIdSchema = z.object({
    params: z.object({
        runId: z.string().uuid(),
    }),
});

export const assessmentIdSchema = z.object({
    params: z.object({
        assessmentId: z.string().uuid(),
    }),
});

export const updateAssessmentRunResultSchema = z.object({
    params: z.object({
        runId: z.string().uuid(),
    }),
    body: z.object({
        riskScore: z.number().finite().min(0).nullable().optional(),
        expectedAnnualLoss: z.number().finite().min(0).nullable().optional(),
        result: z.record(z.string(), z.unknown()).nullable().optional(),
    }).refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "At least one result field must be provided" }
    ),
});

export type CreateAssessmentRunInput = z.infer<
    typeof createAssessmentRunSchema
>["body"];

export type AssessmentRunIdInput = z.infer<
    typeof assessmentRunIdSchema
>["params"];

export type AssessmentIdInput = z.infer<
    typeof assessmentIdSchema
>["params"];

export type UpdateAssessmentRunResultInput = z.infer<
    typeof updateAssessmentRunResultSchema
>["body"];