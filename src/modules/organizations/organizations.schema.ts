
import { z } from "zod";

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(255),
  }),
});

export const organizationIdSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid(),
  }),
});

export const updateOrganizationSchema = z.object({
  params: z.object({
    organizationId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(255),
  }),
});

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>["body"];

export type OrganizationIdInput = z.infer<
  typeof organizationIdSchema
>["params"];

export type UpdateOrganizationInput = z.infer<
  typeof updateOrganizationSchema
>["body"];