import mongoose, { Model, Schema } from "mongoose";
import { IUserDB } from "../types/database";

const userSchema = new mongoose.Schema<IUserDB>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    city: { type: String, default: "" },
    active: { type: Boolean, default: false },
    language: { type: String, default: "sr" },
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
    pib: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    companyName: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    facebook: { type: String, default: "" },
    companyRegistrationNumber: { type: String, default: "" },
    companyAddress: { type: String, default: "" },
    socialSecurityNumber: { type: String, default: "" },
    instagram: { type: String, default: "" },
    favorites: {
      type: [Schema.Types.ObjectId],
      ref: "Resource",
      default: [],
    },
    wishList: {
      type: [Schema.Types.ObjectId],
      ref: "Resource",
      maxItems: 30,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for email lookup
userSchema.index({ email: 1 });

const User: Model<IUserDB> =
  mongoose.models.User || mongoose.model<IUserDB>("User", userSchema);

export default User;
