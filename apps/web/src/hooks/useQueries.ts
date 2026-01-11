/**
 * TanStack Query Hooks for API Data Fetching
 * FAZA 5: Search page improvements
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourcesApi, categoriesApi, favoritesApi } from '../services/api';
import type { Resource, SearchFilters, PaginationParams } from '../types';

// Query Keys
export const queryKeys = {
  resources: (params?: PaginationParams & SearchFilters) => ['resources', params] as const,
  resource: (slug: string) => ['resource', slug] as const,
  categories: ['categories'] as const,
  favorites: ['favorites'] as const,
  search: (query: string, filters?: SearchFilters) => ['search', query, filters] as const,
};

// ============ Categories ============

/**
 * Fetch all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch single category by slug
 */
export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============ Resources ============

/**
 * Fetch resources with optional filters and pagination
 */
export function useResources(params?: PaginationParams & SearchFilters) {
  return useQuery({
    queryKey: queryKeys.resources(params),
    queryFn: () => resourcesApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Fetch single resource by ID or slug
 */
export function useResource(idOrSlug: string) {
  return useQuery({
    queryKey: queryKeys.resource(idOrSlug),
    queryFn: () => resourcesApi.getById(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Search resources with query and filters
 */
export function useSearchResources(query: string, filters?: SearchFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search(query, filters),
    queryFn: () => resourcesApi.search(query, filters),
    enabled: enabled && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData,
  });
}

// ============ Favorites ============

/**
 * Fetch user's favorites
 */
export function useFavorites() {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: () => favoritesApi.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Toggle favorite status for a resource
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, isFavorite }: { resourceId: string; isFavorite: boolean }) =>
      favoritesApi.toggle(resourceId, isFavorite),
    onMutate: async ({ resourceId, isFavorite }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<Resource[]>(queryKeys.favorites);

      // Optimistically update to the new value
      queryClient.setQueryData<Resource[]>(queryKeys.favorites, (old) => {
        if (!old) return old;
        if (isFavorite) {
          // Remove from favorites
          return old.filter((r) => r.id !== resourceId);
        }
        // For adding, we don't have the full resource data, so we'll let the refetch handle it
        return old;
      });

      return { previousFavorites };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites, context.previousFavorites);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}

// ============ Inquiries ============

interface InquiryData {
  resourceId: string;
  message: string;
  startDate?: string;
  endDate?: string;
  phone?: string;
}

/**
 * Create a new inquiry
 */
export function useCreateInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InquiryData) => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to send inquiry' }));
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}

// ============ Prefetching Utilities ============

/**
 * Prefetch resources for better UX
 */
export function usePrefetchResources() {
  const queryClient = useQueryClient();

  return (params?: PaginationParams & SearchFilters) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.resources(params),
      queryFn: () => resourcesApi.getAll(params),
      staleTime: 2 * 60 * 1000,
    });
  };
}

/**
 * Prefetch a single resource
 */
export function usePrefetchResource() {
  const queryClient = useQueryClient();

  return (idOrSlug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.resource(idOrSlug),
      queryFn: () => resourcesApi.getById(idOrSlug),
      staleTime: 5 * 60 * 1000,
    });
  };
}
