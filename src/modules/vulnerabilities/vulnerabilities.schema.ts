import { z } from "zod";

export const createVulnerabilitySchema = z.object({
    body: z.object({
        assetId: z.string().uuid(),

        cveId: z
            .string()
            .trim()
            .min(1)
            .max(50)
            .optional(),

        severity: z.enum([
            "critical",
            "high",
            "medium",
            "low",
            "informational",
        ]),

        cvssScore: z
            .number()
            .min(0)
            .max(10)
            .optional(),

        remediationStatus: z.enum([
            "open",
            "in_progress",
            "resolved",
            "accepted",
        ]),
    }),
});

export const vulnerabilityIdSchema = z.object({
    params: z.object({
        vulnerabilityId: z.string().uuid(),
    }),
});

export const assetIdSchema = z.object({
    params: z.object({
        assetId: z.string().uuid(),
    }),
});

export const updateVulnerabilitySchema = z.object({
    params: z.object({
        vulnerabilityId: z.string().uuid(),
    }),

    body: z
        .object({
            cveId: z.string().trim().min(1).max(50).nullable().optional(),

            severity: z
                .enum(["critical", "high", "medium", "low", "informational"])
                .optional(),

            cvssScore: z.number().min(0).max(10).nullable().optional(),

            remediationStatus: z
                .enum(["open", "in_progress", "resolved", "accepted"])
                .optional(),
        })
        .refine(
            (data) =>
                Object.values(data).some((value) => value !== undefined),
            { message: "At least one field must be provided" }
        ),
});

export type CreateVulnerabilityInput = z.infer<
    typeof createVulnerabilitySchema
>["body"];

export type VulnerabilityIdInput = z.infer<
    typeof vulnerabilityIdSchema
>["params"];

export type AssetIdInput = z.infer<
    typeof assetIdSchema
>["params"];

export type UpdateVulnerabilityInput = z.infer<
    typeof updateVulnerabilitySchema
>["body"];