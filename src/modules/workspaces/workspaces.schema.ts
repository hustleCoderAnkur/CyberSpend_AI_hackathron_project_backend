import { z } from "zod";

export const createWorkspaceSchema = z.object({
    body: z.object({
        organizationId: z.string().uuid(),
        name: z.string().trim().min(2).max(255),
    }),
});

export const workspaceIdSchema = z.object({
    params: z.object({
        workspaceId: z.string().uuid(),
    }),
});

export const organizationIdSchema = z.object({
    params: z.object({
        organizationId: z.string().uuid(),
    }),
});

export const updateWorkspaceSchema = z.object({
    params: z.object({
        workspaceId: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().trim().min(2).max(255),
    }),
});

export type CreateWorkspaceInput = z.infer<
    typeof createWorkspaceSchema
>["body"];

export type WorkspaceIdInput = z.infer<
    typeof workspaceIdSchema
>["params"];

export type OrganizationIdInput = z.infer<
    typeof organizationIdSchema
>["params"];

export type UpdateWorkspaceInput = z.infer<
    typeof updateWorkspaceSchema
>["body"];