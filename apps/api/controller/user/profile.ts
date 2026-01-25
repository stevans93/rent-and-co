import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import crypto from "crypto";

// Multer config for profile image
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
    }
  },
});

export const uploadProfileImage = uploadMiddleware.single("profileImage");

// Update profile (without email change)
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const { firstName, lastName, phone, city, address, facebook, instagram, companyName, pib, companyAddress, companyRegistrationNumber, socialSecurityNumber } = req.body;

    // Email cannot be changed
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (facebook !== undefined) updateData.facebook = facebook;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (pib !== undefined) updateData.pib = pib;
    if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
    if (companyRegistrationNumber !== undefined) updateData.companyRegistrationNumber = companyRegistrationNumber;
    if (socialSecurityNumber !== undefined) updateData.socialSecurityNumber = socialSecurityNumber;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.plainPassword = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

// Upload profile image
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    // Ensure uploads directory exists - use process.cwd() for consistent path
    const uploadsDir = path.join(process.cwd(), "uploads/avatars");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Get old profile image to delete
    const user = await User.findById(userId);
    if (user?.profileImage) {
      const oldImagePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Generate unique filename
    const filename = `avatar-${userId}-${crypto.randomUUID()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    // Compress and resize with sharp
    await sharp(req.file.buffer)
      .resize(300, 300, { fit: "cover", position: "center" })
      .webp({ quality: 80 })
      .toFile(filepath);

    // Update user profile image
    const profileImageUrl = `/uploads/avatars/${filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: profileImageUrl },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Delete profile image
export const deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;

    const user = await User.findById(userId);
    if (user?.profileImage) {
      const imagePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: "" },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Update notification preferences
export const updateNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const { emailNotifications, marketingEmails } = req.body;

    const updateData: any = {};
    if (typeof emailNotifications === "boolean") updateData.emailNotifications = emailNotifications;
    if (typeof marketingEmails === "boolean") updateData.marketingEmails = marketingEmails;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Admin: Change user password
export const adminChangePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = (req as any).user;
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Check if requester is admin
    if (adminUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized - Admin only" });
    }

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.plainPassword = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
