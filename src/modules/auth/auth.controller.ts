import type { Request, Response, NextFunction } from "express";
import {
    registerUser,
    loginUser,
    AuthError,
} from "./auth.service.js";

import type {
    RegisterInput,
    LoginInput,
} from "./auth.schema.js";

export async function register(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await registerUser(
            req.body as RegisterInput
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }

        next(error);
    }
}

export async function login(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await loginUser(
            req.body as LoginInput
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
            return;
        }

        next(error);
    }
}