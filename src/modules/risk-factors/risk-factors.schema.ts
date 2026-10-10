
import { z } from "zod";

export const createRiskFactorSchema = z.object({
    body: z.object({
        assessmentRunId: z.string().uuid(),
        assetId: z.string().uuid().optional(),
        factorName: z.string().trim().min(1).max(255),
        contribution: z.number().finite(),
        explanation: z.string().trim().max(5000).optional(),
    }),
});

export const riskFactorIdSchema = z.object({
    params: z.object({
        riskFactorId: z.string().uuid(),
    }),
});

export const assessmentRunRiskFactorsSchema = z.object({
    params: z.object({
        assessmentRunId: z.string().uuid(),
    }),
});

export type CreateRiskFactorInput = z.infer<
    typeof createRiskFactorSchema
>["body"];
