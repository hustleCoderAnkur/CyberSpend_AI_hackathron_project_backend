
import { z } from "zod";

export const createScenarioSchema = z.object({
    body: z.object({
        assessmentId: z.string().uuid(),
        name: z.string().trim().min(1).max(255),
        budget: z.number().finite().min(0).optional(),
    }),
});

export const scenarioIdSchema = z.object({
    params: z.object({
        scenarioId: z.string().uuid(),
    }),
});

export const assessmentScenariosSchema = z.object({
    params: z.object({
        assessmentId: z.string().uuid(),
    }),
});

export const updateScenarioSchema = z.object({
    params: z.object({
        scenarioId: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().trim().min(1).max(255).optional(),
        budget: z.number().finite().min(0).nullable().optional(),
        results: z.record(z.string(), z.unknown()).nullable().optional(),
    }).refine(
        (data) => Object.values(data).some(
            (value) => value !== undefined,
        ),
        {
            message: "At least one field must be provided",
        },
    ),
});

export type CreateScenarioInput = z.infer<
    typeof createScenarioSchema
>["body"];

export type UpdateScenarioInput = z.infer<
    typeof updateScenarioSchema
>["body"];
