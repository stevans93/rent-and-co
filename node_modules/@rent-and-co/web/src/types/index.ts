// Resource Types
export interface Resource {
  id: number | string;
  title: string;
  description?: string;
  address: string;
  category: string;
  categoryId?: number | string;
  price: number;
  priceUnit?: 'day' | 'hour' | 'week' | 'month';
  image?: string;
  images?: string[];
  isFeatured?: boolean;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: number | string;
  user?: User;
}

// User Types
export interface User {
  id: number | string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  createdAt?: string;
}

// Category Types
export interface Category {
  id: number | string;
  _id?: string;
  name: string;
  slug: string;
  icon?: string;
  coverImage?: string;
  count?: number;
  resourceCount?: number;
  order?: number;
  parentId?: number | string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Search Types
export interface SearchFilters {
  query?: string;
  categoryId?: number | string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
