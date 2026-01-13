import { Router } from "express";
import promiseWrapper from "../middleware/promiseWrapper";
import { auth } from "../middleware";
import { getAll, getAdminUsers, updateUserRole, deleteUser } from "../controller/user/getAll";
import { remove } from "../controller/user/remove";
import { upload } from "../controller/user/upload";
import { get } from "../controller/user/get";

const router = Router();

// Admin routes
router.get("/", auth, promiseWrapper(getAdminUsers));
router.patch("/:id/role", auth, promiseWrapper(updateUserRole));
router.delete("/:id", auth, promiseWrapper(deleteUser));

// Legacy route
router.get("/all", promiseWrapper(getAll));

router.put("/:id", promiseWrapper(upload));

router.get("/:id", promiseWrapper(get));

export default router;
