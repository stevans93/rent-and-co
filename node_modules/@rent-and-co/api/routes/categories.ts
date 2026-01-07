import { Router } from "express";
import { 
  getCategories, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../controller/category";
import { auth, adminOnly } from "../middleware";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin only routes
router.post("/", auth, adminOnly, createCategory);
router.put("/:id", auth, adminOnly, updateCategory);
router.delete("/:id", auth, adminOnly, deleteCategory);

export default router;
