import { Router } from "express";
import promiseWrapper from "../middleware/promiseWrapper";
import { auth } from "../middleware";
import { getAll, getAdminUsers, updateUserRole, deleteUser } from "../controller/user/getAll";
import { remove } from "../controller/user/remove";
import { upload } from "../controller/user/upload";
import { get } from "../controller/user/get";
import { getDashboardStats } from "../controller/user/dashboard";
import { 
  updateProfile, 
  changePassword, 
  uploadProfileImage, 
  uploadAvatar, 
  deleteAvatar,
  updateNotifications,
  adminChangePassword
} from "../controller/user/profile";

const router = Router();

// Dashboard stats route (MORA BITI PRE /:id)
router.get("/dashboard/stats", auth, promiseWrapper(getDashboardStats));

// Profile routes (authenticated user)
router.put("/me", auth, promiseWrapper(updateProfile));
router.put("/me/password", auth, promiseWrapper(changePassword));
router.post("/me/avatar", auth, uploadProfileImage, promiseWrapper(uploadAvatar));
router.delete("/me/avatar", auth, promiseWrapper(deleteAvatar));
router.put("/me/notifications", auth, promiseWrapper(updateNotifications));

// Admin routes
router.get("/", auth, promiseWrapper(getAdminUsers));
router.patch("/:id/role", auth, promiseWrapper(updateUserRole));
router.patch("/:id/password", auth, promiseWrapper(adminChangePassword));
router.delete("/:id", auth, promiseWrapper(deleteUser));

// Legacy route
router.get("/all", promiseWrapper(getAll));

router.put("/:id", promiseWrapper(upload));

router.get("/:id", promiseWrapper(get));

export default router;
