import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().int().positive().default(4000),
    FASTAPI_URL: z.string().url(),
    TINYFISH_API_KEY: z.string().min(1),

    JWT_ACCESS_TOKEN_SECRET: z.string().min(32),
    JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),

    JWT_REFRESH_TOKEN_SECRET: z.string().min(32),
    JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
    databaseUrl: parsedEnv.DATABASE_URL,
    port: parsedEnv.PORT,
    fastApiUrl: parsedEnv.FASTAPI_URL,
    tinyfishApiKey: parsedEnv.TINYFISH_API_KEY,

    jwtAccessTokenSecret: parsedEnv.JWT_ACCESS_TOKEN_SECRET,
    jwtAccessTokenExpiresIn: parsedEnv.JWT_ACCESS_TOKEN_EXPIRES_IN,

    jwtRefreshTokenSecret: parsedEnv.JWT_REFRESH_TOKEN_SECRET,
    jwtRefreshTokenExpiresIn: parsedEnv.JWT_REFRESH_TOKEN_EXPIRES_IN,
};