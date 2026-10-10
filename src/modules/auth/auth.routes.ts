import { Router } from "express";

import { register, login } from "./auth.controller.js";
import {
    registerSchema,
    loginSchema,
} from "./auth.schema.js";

import { validateRequest } from "../../middleware/validate-request.js";

const router = Router();

router.post(
    "/register",
    validateRequest({ body: registerSchema.shape.body }),
    register
);

router.post(
    "/login",
    validateRequest({ body: loginSchema.shape.body }),
    login
);

export default router;