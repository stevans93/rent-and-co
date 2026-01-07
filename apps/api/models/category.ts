import mongoose, { Model } from "mongoose";
import { ICategoryDB } from "../types/database";

const categorySchema = new mongoose.Schema<ICategoryDB>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true 
    },
    coverImage: { 
      type: String, 
      default: "" 
    },
    icon: { 
      type: String, 
      default: "" 
    },
    order: { 
      type: Number, 
      default: 0 
    },
  },
  {
    timestamps: true,
  }
);

// Index for ordering
categorySchema.index({ order: 1 });
categorySchema.index({ slug: 1 });

// Pre-save middleware to generate slug from name
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[čć]/g, "c")
      .replace(/[šś]/g, "s")
      .replace(/[žź]/g, "z")
      .replace(/đ/g, "dj")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

const Category: Model<ICategoryDB> =
  mongoose.models.Category || mongoose.model<ICategoryDB>("Category", categorySchema);

export default Category;
