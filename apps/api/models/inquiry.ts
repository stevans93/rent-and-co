import mongoose, { Model, Schema } from "mongoose";
import { IInquiryDB } from "../types/database";

const inquirySchema = new mongoose.Schema<IInquiryDB>(
  {
    resourceId: { 
      type: Schema.Types.ObjectId, 
      ref: "Resource", 
      required: true,
      index: true
    },
    ownerId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    senderName: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: 2,
      maxlength: 100 
    },
    senderEmail: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true
    },
    senderPhone: { 
      type: String, 
      default: "" 
    },
    text: { 
      type: String, 
      required: true,
      minlength: 10,
      maxlength: 2000 
    },
    status: { 
      type: String, 
      enum: ["pending", "read", "replied", "closed"], 
      default: "pending" 
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
inquirySchema.index({ ownerId: 1, status: 1 });
inquirySchema.index({ resourceId: 1 });
inquirySchema.index({ createdAt: -1 });

const Inquiry: Model<IInquiryDB> =
  mongoose.models.Inquiry || mongoose.model<IInquiryDB>("Inquiry", inquirySchema);

export default Inquiry;
