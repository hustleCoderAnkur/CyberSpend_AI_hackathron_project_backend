import "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role?: "platform_admin" | "admin" | "analyst" | "viewer";
            };
        }
    }
}

export { };