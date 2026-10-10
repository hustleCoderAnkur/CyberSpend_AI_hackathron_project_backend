import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { env } from "../../config/env.js";

import type {
    RegisterInput,
    LoginInput,
} from "./auth.schema.js";

export class AuthError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = "AuthError";
    }
}

function createAccessToken(userId: string): string {
    return jwt.sign(
        {
            tokenType: "access",
        },
        env.jwtAccessTokenSecret,
        {
            subject: userId,
            expiresIn: env.jwtAccessTokenExpiresIn as jwt.SignOptions["expiresIn"],
            algorithm: "HS256",
        }
    );
}

function createRefreshToken(userId: string): string {
    return jwt.sign(
        {
            tokenType: "refresh",
        },
        env.jwtRefreshTokenSecret,
        {
            subject: userId,
            expiresIn: env.jwtRefreshTokenExpiresIn as jwt.SignOptions["expiresIn"],
            algorithm: "HS256",
        }
    );
}

export async function registerUser(input: RegisterInput) {
    const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

    if (existingUser.length > 0) {
        throw new AuthError("Email is already registered", 409);
    }

    const passwordHash = await argon2.hash(input.password, {
        type: argon2.argon2id,
    });

    const [user] = await db
        .insert(users)
        .values({
            name: input.name,
            email: input.email,
            passwordHash,
        })
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
        });

    if (!user) {
        throw new AuthError("Unable to create user", 500);
    }

    return {
        user,
        accessToken: createAccessToken(user.id),
        refreshToken: createRefreshToken(user.id),
    };
}

export async function loginUser(input: LoginInput) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

    if (!user) {
        throw new AuthError("Invalid email or password", 401);
    }

    const passwordMatches = await argon2.verify(
        user.passwordHash,
        input.password
    );

    if (!passwordMatches) {
        throw new AuthError("Invalid email or password", 401);
    }

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
        accessToken: createAccessToken(user.id),
        refreshToken: createRefreshToken(user.id),
    };
}