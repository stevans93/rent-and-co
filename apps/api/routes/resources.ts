import { Router } from "express";
import {
  getResources,
  getResourceBySlug,
  createResource,
  updateResource,
  deleteResource,
} from "../controller/resource";
import {
  uploadResourceImages,
  deleteResourceImage,
  updateResourceImage,
  reorderResourceImages,
} from "../controller/resource/images";
import { auth, validateBody, validateQuery, promiseWrapper, upload } from "../middleware";
import { createResourceSchema, updateResourceSchema, resourceQuerySchema } from "@rent-and-co/shared";

const router = Router();

// GET /api/resources - Lista sa filterima
router.get("/", validateQuery(resourceQuerySchema), promiseWrapper(getResources));

// GET /api/resources/:slug - Detalji po slug-u
router.get("/:slug", promiseWrapper(getResourceBySlug));

// POST /api/resources - Kreiranje (auth required)
router.post("/", auth, validateBody(createResourceSchema), promiseWrapper(createResource));

// PATCH /api/resources/:id - Ažuriranje (auth required, owner only)
router.patch("/:id", auth, validateBody(updateResourceSchema), promiseWrapper(updateResource));

// DELETE /api/resources/:id - Brisanje (auth required, owner only)
router.delete("/:id", auth, promiseWrapper(deleteResource));

// ==========================================
// Image Routes
// ==========================================

// POST /api/resources/:id/images - Upload images
router.post("/:id/images", auth, upload.array("images", 10), promiseWrapper(uploadResourceImages));

// DELETE /api/resources/:id/images/:imageIndex - Delete image
router.delete("/:id/images/:imageIndex", auth, promiseWrapper(deleteResourceImage));

// PATCH /api/resources/:id/images/:imageIndex - Update image (alt, order)
router.patch("/:id/images/:imageIndex", auth, promiseWrapper(updateResourceImage));

// PUT /api/resources/:id/images/reorder - Reorder images
router.put("/:id/images/reorder", auth, promiseWrapper(reorderResourceImages));

export default router;
