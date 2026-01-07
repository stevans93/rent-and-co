import { cacheManager, memCache, CACHE_KEYS, CACHE_DURATIONS } from '../utils/cache';
import type { Resource, Category, User, AuthResponse, ApiResponse, SearchFilters, PaginationParams } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Request configuration
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Get auth token from cache
const getAuthToken = (): string | null => {
  return cacheManager.get<string>(CACHE_KEYS.token);
};

// Generic fetch wrapper with caching support
async function fetchWithCache<T>(
  endpoint: string,
  options: RequestInit = {},
  cacheOptions?: {
    key?: string;
    duration?: number;
    forceRefresh?: boolean;
  }
): Promise<T> {
  const { key, duration = CACHE_DURATIONS.medium, forceRefresh = false } = cacheOptions || {};

  // Check cache first (if not forcing refresh)
  if (key && !forceRefresh) {
    const cached = memCache.get<T>(key);
    if (cached) {
      return cached;
    }
  }

  const token = getAuthToken();
  const headers: HeadersInit = {
    ...defaultHeaders,
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();

  // Cache the result
  if (key) {
    memCache.set(key, data, duration);
  }

  return data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetchWithCache<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Cache user data and token
    if (response.token) {
      cacheManager.set(CACHE_KEYS.token, response.token, CACHE_DURATIONS.week);
    }
    if (response.user) {
      cacheManager.set(CACHE_KEYS.user, response.user, CACHE_DURATIONS.long);
    }
    
    return response;
  },

  register: async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await fetchWithCache<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      cacheManager.set(CACHE_KEYS.token, response.token, CACHE_DURATIONS.week);
    }
    if (response.user) {
      cacheManager.set(CACHE_KEYS.user, response.user, CACHE_DURATIONS.long);
    }
    
    return response;
  },

  logout: (): void => {
    cacheManager.remove(CACHE_KEYS.token);
    cacheManager.remove(CACHE_KEYS.user);
    memCache.clear();
  },

  getCurrentUser: async (): Promise<User | null> => {
    // Check local cache first
    const cachedUser = cacheManager.get<User>(CACHE_KEYS.user);
    if (cachedUser) return cachedUser;

    try {
      const user = await fetchWithCache<User>('/auth/me');
      cacheManager.set(CACHE_KEYS.user, user, CACHE_DURATIONS.long);
      return user;
    } catch {
      return null;
    }
  },
};

// Resources API
export const resourcesApi = {
  getAll: async (params?: PaginationParams & SearchFilters): Promise<ApiResponse<Resource[]>> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/resources${queryString ? `?${queryString}` : ''}`;
    const cacheKey = `${CACHE_KEYS.resources}_${queryString}`;

    return fetchWithCache<ApiResponse<Resource[]>>(endpoint, {}, {
      key: cacheKey,
      duration: CACHE_DURATIONS.short, // Resources change frequently
    });
  },

  getById: async (id: string): Promise<Resource> => {
    return fetchWithCache<Resource>(`/resources/${id}`, {}, {
      key: `resource_${id}`,
      duration: CACHE_DURATIONS.medium,
    });
  },

  create: async (data: Partial<Resource>): Promise<Resource> => {
    const resource = await fetchWithCache<Resource>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Invalidate resources cache
    memCache.remove(CACHE_KEYS.resources);
    
    return resource;
  },

  update: async (id: string, data: Partial<Resource>): Promise<Resource> => {
    const resource = await fetchWithCache<Resource>(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Invalidate caches
    memCache.remove(`resource_${id}`);
    memCache.remove(CACHE_KEYS.resources);
    
    return resource;
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithCache<void>(`/resources/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate caches
    memCache.remove(`resource_${id}`);
    memCache.remove(CACHE_KEYS.resources);
  },

  search: async (query: string, filters?: SearchFilters): Promise<ApiResponse<Resource[]>> => {
    const searchParams = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    return fetchWithCache<ApiResponse<Resource[]>>(`/resources/search?${searchParams}`, {}, {
      key: `search_${query}_${JSON.stringify(filters)}`,
      duration: CACHE_DURATIONS.short,
    });
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (forceRefresh = false): Promise<Category[]> => {
    const response = await fetchWithCache<ApiResponse<Category[]>>('/categories', {}, {
      key: CACHE_KEYS.categories,
      duration: CACHE_DURATIONS.short, // Categories count changes when resources are added
      forceRefresh,
    });
    return response.data || [];
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await fetchWithCache<ApiResponse<Category>>(`/categories/${slug}`, {}, {
      key: `category_${slug}`,
      duration: CACHE_DURATIONS.long,
    });
    if (!response.data) {
      throw new Error('Category not found');
    }
    return response.data;
  },
};

// Favorites API
export const favoritesApi = {
  getAll: async (): Promise<Resource[]> => {
    // Check local cache first for instant load
    const cached = cacheManager.get<Resource[]>(CACHE_KEYS.favorites);
    
    const favorites = await fetchWithCache<Resource[]>('/favorites', {}, {
      key: CACHE_KEYS.favorites,
      duration: CACHE_DURATIONS.medium,
    });
    
    // Update local cache
    cacheManager.set(CACHE_KEYS.favorites, favorites, CACHE_DURATIONS.long);
    
    return cached || favorites;
  },

  add: async (resourceId: string): Promise<void> => {
    await fetchWithCache<void>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ resourceId }),
    });
    
    // Invalidate favorites cache
    memCache.remove(CACHE_KEYS.favorites);
    cacheManager.remove(CACHE_KEYS.favorites);
  },

  remove: async (resourceId: string): Promise<void> => {
    await fetchWithCache<void>(`/favorites/${resourceId}`, {
      method: 'DELETE',
    });
    
    // Invalidate favorites cache
    memCache.remove(CACHE_KEYS.favorites);
    cacheManager.remove(CACHE_KEYS.favorites);
  },

  toggle: async (resourceId: string, isFavorite: boolean): Promise<void> => {
    if (isFavorite) {
      await favoritesApi.remove(resourceId);
    } else {
      await favoritesApi.add(resourceId);
    }
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<User> => {
    return fetchWithCache<User>('/user/profile', {}, {
      key: CACHE_KEYS.user,
      duration: CACHE_DURATIONS.medium,
    });
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const user = await fetchWithCache<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Update user cache
    cacheManager.set(CACHE_KEYS.user, user, CACHE_DURATIONS.long);
    
    return user;
  },

  getResources: async (): Promise<Resource[]> => {
    return fetchWithCache<Resource[]>('/user/resources');
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  resources: resourcesApi,
  categories: categoriesApi,
  favorites: favoritesApi,
  user: userApi,
};

export default api;
