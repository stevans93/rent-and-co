import { useState, useCallback, useRef, useEffect } from 'react';
import { cacheManager, memCache, CACHE_DURATIONS } from '../utils/cache';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  // Cache options
  cacheKey?: string;
  cacheDuration?: number;
  cacheType?: 'memory' | 'local' | 'none';
  // Stale-while-revalidate: return cached data immediately, then fetch fresh
  staleWhileRevalidate?: boolean;
}

interface UseApiReturn<T, P> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  execute: (params?: P) => Promise<T | null>;
  reset: () => void;
  invalidateCache: () => void;
}

export function useApi<T, P = void>(
  apiFunction: (params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    cacheKey,
    cacheDuration = CACHE_DURATIONS.medium,
    cacheType = 'memory',
    staleWhileRevalidate = false,
    onSuccess,
    onError
  } = options;

  // Get cached data on mount
  useEffect(() => {
    if (cacheKey && cacheType !== 'none') {
      const cached = cacheType === 'local' 
        ? cacheManager.get<T>(cacheKey)
        : memCache.get<T>(cacheKey);
      
      if (cached) {
        setData(cached);
        setIsStale(true);
      }
    }
  }, [cacheKey, cacheType]);

  const execute = useCallback(
    async (params?: P): Promise<T | null> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        // If stale-while-revalidate and we have cached data, don't show loading
        if (!(staleWhileRevalidate && data)) {
          setIsLoading(true);
        }
        setError(null);

        const result = await apiFunction(params as P);
        
        // Cache the result
        if (cacheKey && cacheType !== 'none') {
          if (cacheType === 'local') {
            cacheManager.set(cacheKey, result, cacheDuration);
          } else {
            memCache.set(cacheKey, result, cacheDuration);
          }
        }

        setData(result);
        setIsStale(false);
        onSuccess?.(result);
        return result;
      } catch (err) {
        // Don't set error if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, cacheKey, cacheDuration, cacheType, staleWhileRevalidate, data, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsStale(false);
  }, []);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      if (cacheType === 'local') {
        cacheManager.remove(cacheKey);
      } else {
        memCache.remove(cacheKey);
      }
    }
    setIsStale(false);
  }, [cacheKey, cacheType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, isLoading, error, isStale, execute, reset, invalidateCache };
}

export default useApi;
