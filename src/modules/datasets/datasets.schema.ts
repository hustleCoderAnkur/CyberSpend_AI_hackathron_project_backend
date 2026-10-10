import { z } from "zod";

export const createDatasetSchema = z.object({
    body: z.object({
        workspaceId: z.string().uuid(),
        name: z.string().trim().min(2).max(255),
        sourceType: z.enum([
            "csv",
            "json",
            "api",
            "manual",
        ]),
    }),
});

export const datasetIdSchema = z.object({
    params: z.object({
        datasetId: z.string().uuid(),
    }),
});

export const workspaceIdSchema = z.object({
    params: z.object({
        workspaceId: z.string().uuid(),
    }),
});

export const updateDatasetStatusSchema = z.object({
    params: z.object({
        datasetId: z.string().uuid(),
    }),
    body: z.object({
        status: z.enum([
            "pending",
            "processing",
            "completed",
            "failed",
        ]),
    }),
});

export type CreateDatasetInput = z.infer<
    typeof createDatasetSchema
>["body"];

export type DatasetIdInput = z.infer<
    typeof datasetIdSchema
>["params"];

export type WorkspaceIdInput = z.infer<
    typeof workspaceIdSchema
>["params"];

export type UpdateDatasetStatusInput = z.infer<
    typeof updateDatasetStatusSchema
>["body"];