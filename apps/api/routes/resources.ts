import { Router } from "express";
import {
  getResources,
  getResourceBySlug,
  createResource,
  updateResource,
  deleteResource,
  getMyResources,
  getAdminResources,
  updateResourceStatus,
  getSearchSuggestions,
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

// GET /api/resources/search/suggestions - Autocomplete suggestions (MORA BITI PRE /:slug)
router.get("/search/suggestions", promiseWrapper(getSearchSuggestions));

// GET /api/resources - Lista sa filterima
router.get("/", validateQuery(resourceQuerySchema), promiseWrapper(getResources));

// GET /api/resources/my - Moji resursi (auth required) - MORA BITI PRE /:slug
router.get("/my", auth, promiseWrapper(getMyResources));

// GET /api/resources/admin - Admin lista svih resursa (auth + admin required)
router.get("/admin", auth, promiseWrapper(getAdminResources));

// GET /api/resources/:slug - Detalji po slug-u
router.get("/:slug", promiseWrapper(getResourceBySlug));

// POST /api/resources - Kreiranje (auth required)
router.post("/", auth, validateBody(createResourceSchema), promiseWrapper(createResource));

// PATCH /api/resources/:id - Ažuriranje (auth required, owner only)
router.patch("/:id", auth, validateBody(updateResourceSchema), promiseWrapper(updateResource));

// PATCH /api/resources/:id/status - Admin promena statusa
router.patch("/:id/status", auth, promiseWrapper(updateResourceStatus));

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
