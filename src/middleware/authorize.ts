import type { Request, Response, NextFunction } from "express";

export type UserRole = "platform_admin" | "admin" | "analyst" | "viewer";

export function authorize(...allowedRoles: UserRole[]) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const userRole = req.user.role as UserRole | undefined;

        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
            return;
        }

        next();
    };
}