import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload extends JwtPayload {
    sub: string;
    tokenType: "access";
}

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Access token is required",
        });
        return;
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Access token is missing",
        });
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            env.jwtAccessTokenSecret,
            {
                algorithms: ["HS256"],
            }
        );

        if (
            typeof decoded === "string" ||
            typeof decoded.sub !== "string" ||
            decoded.tokenType !== "access"
        ) {
            res.status(401).json({
                success: false,
                message: "Invalid access token payload",
            });
            return;
        }

        req.user = {
            id: decoded.sub,
        };

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
    }
}