import { Router } from "express";
import auth from "./auth";
import user from "./user";
import resources from "./resources";
import categories from "./categories";
import favorites from "./favorites";
import inquiries from "./inquiries";

export const router = Router();

router.use("/auth", auth);
router.use("/user", user);
router.use("/resources", resources);
router.use("/categories", categories);
router.use("/favorites", favorites);
router.use("/inquiries", inquiries);

export default router;
