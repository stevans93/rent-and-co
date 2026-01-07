import { Router } from "express";
import { 
  getFavorites, 
  addFavorite, 
  removeFavorite, 
  checkFavorite 
} from "../controller/favorites";
import { auth } from "../middleware";

const router = Router();

// All routes require authentication
router.use(auth);

router.get("/", getFavorites);
router.post("/:resourceId", addFavorite);
router.delete("/:resourceId", removeFavorite);
router.get("/:resourceId/check", checkFavorite);

export default router;
