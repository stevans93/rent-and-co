import { z } from 'zod';
import {
  userSchema,
  loginSchema,
  registerSchema,
  resourceSchema,
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  categorySchema,
  locationSchema,
  imageSchema,
  extraInfoSchema,
  inquirySchema,
  createInquirySchema,
  updateInquiryStatusSchema,
  contactFormSchema,
  searchFiltersSchema,
  paginationSchema,
} from './schemas';

// ==========================================
// User & Auth Types
// ==========================================

export type User = z.infer<typeof userSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;

// Legacy aliases
export type LoginInput = LoginDTO;
export type RegisterInput = RegisterDTO;

// ==========================================
// Category Types
// ==========================================

export type Category = z.infer<typeof categorySchema>;

// ==========================================
// Location & Image Types
// ==========================================

export type Location = z.infer<typeof locationSchema>;
export type Image = z.infer<typeof imageSchema>;
export type ExtraInfo = z.infer<typeof extraInfoSchema>;

// ==========================================
// Resource Types
// ==========================================

export type Resource = z.infer<typeof resourceSchema>;
export type CreateResourceDTO = z.infer<typeof createResourceSchema>;
export type UpdateResourceDTO = z.infer<typeof updateResourceSchema>;
export type ResourceQueryDTO = z.infer<typeof resourceQuerySchema>;

// Legacy aliases
export type CreateResourceInput = CreateResourceDTO;

// ==========================================
// Inquiry Types
// ==========================================

export type Inquiry = z.infer<typeof inquirySchema>;
export type CreateInquiryDTO = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusDTO = z.infer<typeof updateInquiryStatusSchema>;

// ==========================================
// Other Types
// ==========================================

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// ==========================================
// Auth Types
// ==========================================

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponse extends ApiResponse<User> {
  tokens: AuthTokens;
}

// ==========================================
// Resource Response Types
// ==========================================

export interface ResourceWithOwner extends Resource {
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'avatar'>;
}

export interface ResourceWithCategory extends Resource {
  category: Category;
}

export interface ResourceFull extends ResourceWithOwner, ResourceWithCategory {}

// ==========================================
// Stats Types
// ==========================================

export interface DashboardStats {
  totalResources: number;
  activeResources: number;
  totalViews: number;
  totalInquiries: number;
  pendingInquiries: number;
}
