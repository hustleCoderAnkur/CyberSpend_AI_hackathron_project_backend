
import { z } from "zod";

export const createReportSchema = z.object({
    body: z.object({
        assessmentRunId: z.string().uuid(),
        reportType: z.string().trim().min(1).max(100),
        fileUrl: z.string().url().optional(),
    }),
});

export const reportIdSchema = z.object({
    params: z.object({
        reportId: z.string().uuid(),
    }),
});

export const assessmentRunReportsSchema = z.object({
    params: z.object({
        assessmentRunId: z.string().uuid(),
    }),
});

export type CreateReportInput = z.infer<
    typeof createReportSchema
>["body"];
