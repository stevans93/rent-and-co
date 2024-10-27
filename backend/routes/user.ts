import { Router } from "express";
import promiseWrapper from "../middleware/promiseWrapper";
import { getAll } from "../controller/user/getAll";
import { remove } from "../controller/user/remove";
import { upload } from "../controller/user/upload";
import { get } from "../controller/user/get";

const router = Router();

router.get("/all", promiseWrapper(getAll));

router.delete("/:id", promiseWrapper(remove));

router.put("/:id", promiseWrapper(upload));

router.get("/:id", promiseWrapper(get));

export default router;
