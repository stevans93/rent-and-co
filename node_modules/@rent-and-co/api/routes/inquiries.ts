import { Router } from "express";
import { 
  createInquiry, 
  getInquiries, 
  getInquiryById, 
  updateInquiryStatus, 
  deleteInquiry,
  getInquiryStats 
} from "../controller/inquiry";
import { auth, validateBody } from "../middleware";
import { createInquirySchema } from "@rent-and-co/shared";

const router = Router();

// Public route - anyone can send inquiry
router.post("/", validateBody(createInquirySchema), createInquiry);

// Protected routes - for resource owners
router.get("/", auth, getInquiries);
router.get("/stats", auth, getInquiryStats);
router.get("/:id", auth, getInquiryById);
router.patch("/:id/status", auth, updateInquiryStatus);
router.delete("/:id", auth, deleteInquiry);

export default router;
