import { Router } from "express";
import {
  getResources,
  getResourceBySlug,
  createResource,
  updateResource,
  deleteResource,
} from "../controller/resource";
import { auth, validateBody, validateQuery, promiseWrapper } from "../middleware";
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

export default router;
