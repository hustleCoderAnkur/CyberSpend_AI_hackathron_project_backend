import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type RequestSchemas = {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
};

export function validateRequest(schemas: RequestSchemas) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        const errors: Record<string, string[]> = {};

        for (const key of ["body", "params", "query"] as const) {
            const schema = schemas[key];

            if (!schema) continue;

            const result = schema.safeParse(req[key]);

            if (!result.success) {
                errors[key] = result.error.issues.map(
                    (issue) =>
                        `${issue.path.join(".") || key}: ${issue.message}`
                );
            }
        }

        if (Object.keys(errors).length > 0) {
            res.status(400).json({
                success: false,
                message: "Request validation failed",
                errors,
            });
            return;
        }

        next();
    };
}