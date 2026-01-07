import { Router } from "express";
import { login } from "../controller/auth/login";
import { register } from "../controller/auth/register";
import { getMe } from "../controller/auth/me";
import { auth, validateBody, promiseWrapper } from "../middleware";
import { loginSchema, registerSchema } from "@rent-and-co/shared";

const router = Router();

// POST /api/auth/login
router.post("/login", validateBody(loginSchema), promiseWrapper(login));

// POST /api/auth/register
router.post("/register", validateBody(registerSchema), promiseWrapper(register));

// GET /api/auth/me
router.get("/me", auth, promiseWrapper(getMe));

export default router;
