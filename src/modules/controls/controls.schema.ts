import { z } from "zod";

export const createControlSchema = z.object({
    body: z.object({
        organizationId: z.string().uuid(),
        name: z.string().trim().min(2).max(255),
        category: z.string().trim().min(1).max(100),
        cost: z.number().finite().min(0),
        effectiveness: z.number().finite().min(0).max(1),
        status: z.enum([
            "planned",
            "active",
            "inactive",
            "under_review",
        ]),
    }),
});

export const controlIdSchema = z.object({
    params: z.object({
        controlId: z.string().uuid(),
    }),
});

export const organizationIdSchema = z.object({
    params: z.object({
        organizationId: z.string().uuid(),
    }),
});

export const updateControlSchema = z.object({
    params: z.object({
        controlId: z.string().uuid(),
    }),
    body: z
        .object({
            name: z.string().trim().min(2).max(255).optional(),
            category: z.string().trim().min(1).max(100).optional(),
            cost: z.number().finite().min(0).optional(),
            effectiveness: z.number().finite().min(0).max(1).optional(),
            status: z
                .enum(["planned", "active", "inactive", "under_review"])
                .optional(),
        })
        .refine(
            (data) => Object.values(data).some((value) => value !== undefined),
            { message: "At least one field must be provided" }
        ),
});

export type CreateControlInput = z.infer<
    typeof createControlSchema
>["body"];

export type ControlIdInput = z.infer<
    typeof controlIdSchema
>["params"];

export type OrganizationIdInput = z.infer<
    typeof organizationIdSchema
>["params"];

export type UpdateControlInput = z.infer<
    typeof updateControlSchema
>["body"];