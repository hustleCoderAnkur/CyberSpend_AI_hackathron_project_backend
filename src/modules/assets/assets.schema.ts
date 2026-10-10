import { z } from "zod";

export const createAssetSchema = z.object({
    body: z.object({
        organizationId: z.string().uuid(),
        name: z.string().trim().min(2).max(255),
        assetType: z.string().trim().min(1).max(100),
        criticality: z.enum([
            "low",
            "medium",
            "high",
            "critical",
        ]),
    }),
});

export const assetIdSchema = z.object({
    params: z.object({
        assetId: z.string().uuid(),
    }),
});

export const organizationIdSchema = z.object({
    params: z.object({
        organizationId: z.string().uuid(),
    }),
});

export const updateAssetSchema = z.object({
    params: z.object({
        assetId: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().trim().min(2).max(255).optional(),
        assetType: z.string().trim().min(1).max(100).optional(),
        criticality: z.enum([
            "low",
            "medium",
            "high",
            "critical",
        ]).optional(),
    }).refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "At least one field must be provided" }
    ),
});

export type CreateAssetInput = z.infer<
    typeof createAssetSchema
>["body"];

export type AssetIdInput = z.infer<
    typeof assetIdSchema
>["params"];

export type OrganizationIdInput = z.infer<
    typeof organizationIdSchema
>["params"];

export type UpdateAssetInput = z.infer<
    typeof updateAssetSchema
>["body"];