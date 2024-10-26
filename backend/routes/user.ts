import { Router } from "express";
import promiseWrapper from "../middleware/promiseWrapper";
import { getAll } from "../controller/user/getAll";
import { remove } from "../controller/user/remove";

const router = Router();

router.get("/all", promiseWrapper(getAll));

router.delete("/:id", promiseWrapper(remove));

export default router;
