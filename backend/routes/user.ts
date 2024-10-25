import { Router } from "express";
import promiseWrapper from "../middleware/promiseWrapper";
import { getAll } from "../controller/user/getAll";

const router = Router();

router.get("/all", promiseWrapper(getAll));

export default router;
