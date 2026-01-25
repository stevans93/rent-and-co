import { Router } from "express";
import { getAnalytics, logView } from "../controller/analytics";
import { auth } from "../middleware";

const router = Router();

// Get analytics for authenticated user
router.get("/", auth, getAnalytics);

// Log view for a resource (public - used when viewing resource details)
router.post("/view/:resourceId", logView);

export default router;
