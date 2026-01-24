import mongoose, { Model, Schema } from "mongoose";
import { IResourceDB } from "../types/database";

const locationSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, default: "Srbija" },
    city: { type: String, required: true },
    address: { type: String, default: "" },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const extraInfoSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const resourceSchema = new mongoose.Schema<IResourceDB>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: 5,
      maxlength: 100 
    },
    slug: { 
      type: String, 
      unique: true,
      lowercase: true,
      trim: true 
    },
    categoryId: { 
      type: Schema.Types.ObjectId, 
      ref: "Category", 
      required: true,
      index: true
    },
    pricePerDay: { 
      type: Number, 
      required: false, 
      min: 0,
      default: 0,
      index: true
    },
    currency: { 
      type: String, 
      enum: ["EUR", "RSD", "USD"], 
      default: "EUR" 
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    status: { 
      type: String, 
      enum: ["active", "inactive", "pending", "rented", "menjam", "poklanjam", "draft"], 
      default: "pending" 
    },
    options: [{ 
      type: String 
    }],
    location: { 
      type: locationSchema, 
      required: true 
    },
    images: [imageSchema],
    description: { 
      type: String, 
      required: true,
      minlength: 20,
      maxlength: 5000 
    },
    extraInfo: [extraInfoSchema],
    ownerId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    views: { 
      type: Number, 
      default: 0 
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
resourceSchema.index({ title: "text", description: "text" });

// Compound indexes for common queries
resourceSchema.index({ categoryId: 1, status: 1 });
resourceSchema.index({ "location.city": 1 });
resourceSchema.index({ pricePerDay: 1 });
resourceSchema.index({ isFeatured: -1, createdAt: -1 });
resourceSchema.index({ ownerId: 1, status: 1 });
resourceSchema.index({ slug: 1 });

// Pre-save middleware to generate slug from title
resourceSchema.pre("save", async function (next) {
  // Generate slug if title is modified OR if slug doesn't exist
  if (this.isModified("title") || !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[čć]/g, "c")
      .replace(/[šś]/g, "s")
      .replace(/[žź]/g, "z")
      .replace(/đ/g, "dj")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Add unique suffix to avoid duplicates
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug exists
    const Resource = mongoose.model<IResourceDB>("Resource");
    while (await Resource.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Virtual for full name
resourceSchema.virtual("priceFormatted").get(function () {
  return `${this.pricePerDay} ${this.currency}`;
});

const Resource: Model<IResourceDB> =
  mongoose.models.Resource || mongoose.model<IResourceDB>("Resource", resourceSchema);

export default Resource;
