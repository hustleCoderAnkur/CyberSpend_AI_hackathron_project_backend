import { z } from "zod";

export const createComplianceMappingSchema = z.object({
    body: z.object({
        organizationId: z.string().uuid(),
        framework: z.string().trim().min(1).max(100),
        requirementCode: z.string().trim().min(1).max(100),
        controlName: z.string().trim().min(1).max(255),
        status: z.enum([
            "not_assessed",
            "compliant",
            "partially_compliant",
            "non_compliant",
            "not_applicable",
        ]),
    }),
});

export const complianceMappingIdSchema = z.object({
    params: z.object({
        mappingId: z.string().uuid(),
    }),
});

export const organizationIdSchema = z.object({
    params: z.object({
        organizationId: z.string().uuid(),
    }),
});

export const updateComplianceMappingSchema = z.object({
    params: z.object({
        mappingId: z.string().uuid(),
    }),
    body: z
        .object({
            framework: z.string().trim().min(1).max(100).optional(),
            requirementCode: z.string().trim().min(1).max(100).optional(),
            controlName: z.string().trim().min(1).max(255).optional(),
            status: z
                .enum([
                    "not_assessed",
                    "compliant",
                    "partially_compliant",
                    "non_compliant",
                    "not_applicable",
                ])
                .optional(),
        })
        .refine(
            (data) => Object.values(data).some((value) => value !== undefined),
            { message: "At least one field must be provided" }
        ),
});

export type CreateComplianceMappingInput = z.infer<
    typeof createComplianceMappingSchema
>["body"];

export type ComplianceMappingIdInput = z.infer<
    typeof complianceMappingIdSchema
>["params"];

export type OrganizationIdInput = z.infer<
    typeof organizationIdSchema
>["params"];

export type UpdateComplianceMappingInput = z.infer<
    typeof updateComplianceMappingSchema
>["body"];