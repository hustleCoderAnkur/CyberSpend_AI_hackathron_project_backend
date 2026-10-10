import { z } from "zod";

export const createIncidentSchema = z.object({
    body: z.object({
        organizationId: z.string().uuid(),
        assetId: z.string().uuid().nullable().optional(),
        title: z.string().trim().min(2).max(255),
        severity: z.enum([
            "critical",
            "high",
            "medium",
            "low",
            "informational",
        ]),
        status: z.enum([
            "open",
            "investigating",
            "contained",
            "resolved",
            "closed",
        ]),
    }),
});

export const incidentIdSchema = z.object({
    params: z.object({
        incidentId: z.string().uuid(),
    }),
});

export const organizationIdSchema = z.object({
    params: z.object({
        organizationId: z.string().uuid(),
    }),
});

export const updateIncidentSchema = z.object({
    params: z.object({
        incidentId: z.string().uuid(),
    }),
    body: z
        .object({
            assetId: z.string().uuid().nullable().optional(),
            title: z.string().trim().min(2).max(255).optional(),
            severity: z
                .enum(["critical", "high", "medium", "low", "informational"])
                .optional(),
            status: z
                .enum([
                    "open",
                    "investigating",
                    "contained",
                    "resolved",
                    "closed",
                ])
                .optional(),
        })
        .refine(
            (data) => Object.values(data).some((value) => value !== undefined),
            { message: "At least one field must be provided" }
        ),
});

export type CreateIncidentInput = z.infer<
    typeof createIncidentSchema
>["body"];

export type IncidentIdInput = z.infer<
    typeof incidentIdSchema
>["params"];

export type OrganizationIdInput = z.infer<
    typeof organizationIdSchema
>["params"];

export type UpdateIncidentInput = z.infer<
    typeof updateIncidentSchema
>["body"];