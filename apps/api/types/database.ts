import { Document, Types } from "mongoose";

// User Interface
export interface IUserDB extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  plainPassword: string;
  country: string;
  city: string;
  active: boolean;
  language: string;
  role: "user" | "admin" | "moderator";
  pib: string;
  phone: string;
  address: string;
  companyName: string;
  profileImage: string;
  facebook: string;
  instagram: string;
  companyRegistrationNumber: string;
  companyAddress: string;
  socialSecurityNumber: string;
  favorites: Types.ObjectId[];
  wishList: Types.ObjectId[];
  emailNotifications: boolean;
  marketingEmails: boolean;
  resetPasswordToken: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Category Interface
export interface ICategoryDB extends Document {
  _id: string;
  name: string;
  slug: string;
  coverImage: string;
  icon: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Location Interface
export interface ILocation {
  country: string;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
}

// Image Interface
export interface IImage {
  url: string;
  alt: string;
  order: number;
}

// Extra Info Interface
export interface IExtraInfo {
  label: string;
  value: string;
}

// Resource Interface
export interface IResourceDB extends Document {
  _id: string;
  title: string;
  slug: string;
  categoryId: Types.ObjectId;
  pricePerDay: number;
  currency: "EUR" | "RSD" | "USD";
  isFeatured: boolean;
  status: "active" | "inactive";
  listingType: "rent" | "sale" | "gift" | "exchange";
  options: string[];
  location: ILocation;
  images: IImage[];
  description: string;
  extraInfo: IExtraInfo[];
  ownerId: Types.ObjectId;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Inquiry Interface
export interface IInquiryDB extends Document {
  _id: string;
  resourceId: Types.ObjectId;
  ownerId: Types.ObjectId;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  text: string;
  status: "pending" | "read" | "replied" | "closed";
  createdAt: Date;
  updatedAt: Date;
}
