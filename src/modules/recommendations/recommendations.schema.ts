import { z } from "zod";

const recommendationStatusSchema = z.enum([
    "pending",
    "accepted",
    "rejected",
    "implemented",
]);

export const createRecommendationSchema = z.object({
    body: z.object({
        assessmentRunId: z.string().uuid(),
        securityControlId: z.string().uuid().optional(),
        title: z.string().trim().min(1).max(255),
        estimatedCost: z.number().finite().min(0).optional(),
        expectedRiskReduction: z.number().finite().min(0).max(1).optional(),
        roi: z.number().finite().optional(),
    }),
});

export const recommendationIdSchema = z.object({
    params: z.object({
        recommendationId: z.string().uuid(),
    }),
});

export const assessmentRunRecommendationsSchema = z.object({
    params: z.object({
        assessmentRunId: z.string().uuid(),
    }),
});

export const updateRecommendationStatusSchema = z.object({
    params: z.object({
        recommendationId: z.string().uuid(),
    }),
    body: z.object({
        status: recommendationStatusSchema,
    }),
});

export type CreateRecommendationInput = z.infer<
    typeof createRecommendationSchema
>["body"];

export type UpdateRecommendationStatusInput = z.infer<
    typeof updateRecommendationStatusSchema
>["body"];