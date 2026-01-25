import { Router } from "express";
import auth from "./auth";
import user from "./user";
import resources from "./resources";
import categories from "./categories";
import favorites from "./favorites";
import inquiries from "./inquiries";
import analytics from "./analytics";

export const router = Router();

router.use("/auth", auth);
router.use("/users", user);
router.use("/resources", resources);
router.use("/categories", categories);
router.use("/favorites", favorites);
router.use("/inquiries", inquiries);
router.use("/analytics", analytics);

export default router;
