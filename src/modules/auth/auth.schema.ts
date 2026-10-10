
import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255).transform((value) =>
      value.toLowerCase()
    ),
    password: z.string().min(12).max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(255).transform((value) =>
      value.toLowerCase()
    ),
    password: z.string().min(1).max(128),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<
  typeof refreshTokenSchema
>["body"];
