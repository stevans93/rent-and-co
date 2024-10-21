import { Router } from "express";
import { login } from "../controller/auth/login";
import { register } from "../controller/auth/register";
import promiseWrapper from "../middleware/promiseWrapper";

const router = Router();

router.post("/login", login);

router.post("/register", promiseWrapper(register));

export default router;
