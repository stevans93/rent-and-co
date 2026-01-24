// ==========================================
// Zod Schemas
// ==========================================

export {
  // User & Auth
  userSchema,
  loginSchema,
  registerSchema,
  
  // Category
  categorySchema,
  
  // Location & Image
  locationSchema,
  imageSchema,
  extraInfoSchema,
  
  // Resource
  resourceSchema,
  createResourceSchema,
  createDraftResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  
  // Inquiry
  inquirySchema,
  createInquirySchema,
  updateInquiryStatusSchema,
  
  // Other
  contactFormSchema,
  searchFiltersSchema,
  paginationSchema,
} from './schemas';

// ==========================================
// TypeScript Types
// ==========================================

export type {
  // User & Auth
  User,
  LoginDTO,
  RegisterDTO,
  LoginInput,
  RegisterInput,
  
  // Category
  Category,
  
  // Location & Image
  Location,
  Image,
  ExtraInfo,
  
  // Resource
  Resource,
  CreateResourceDTO,
  UpdateResourceDTO,
  ResourceQueryDTO,
  CreateResourceInput,
  
  // Inquiry
  Inquiry,
  CreateInquiryDTO,
  UpdateInquiryStatusDTO,
  
  // Other
  ContactFormInput,
  SearchFilters,
  Pagination,
  
  // API Response
  ApiResponse,
  PaginatedResponse,
  AuthTokens,
  AuthResponse,
  
  // Extended Types
  ResourceWithOwner,
  ResourceWithCategory,
  ResourceFull,
  DashboardStats,
} from './types';
