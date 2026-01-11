/**
 * Custom hook for debounced search input
 */
import { useState, useEffect, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for managing URL search params
 */
export function useSearchParamsSync() {
  const getParamsFromURL = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      category: params.get('category') || '',
      city: params.get('city') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sort: params.get('sort') || 'default',
      status: params.get('status') || '',
      page: parseInt(params.get('page') || '1', 10),
    };
  }, []);

  const updateURL = useCallback((filters: Record<string, string | number>) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'default' && value !== 1) {
        params.set(key, String(value));
      }
    });

    const newURL = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    window.history.replaceState({}, '', newURL);
  }, []);

  return { getParamsFromURL, updateURL };
}
