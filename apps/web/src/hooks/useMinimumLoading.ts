import { useState, useEffect, useRef } from 'react';

/**
 * Hook that ensures loading state is shown for at least minDuration milliseconds
 * This prevents jarring flicker when data loads very quickly
 * 
 * @param isLoading - The actual loading state from data fetching
 * @param minDuration - Minimum time to show loading state (default 800ms)
 * @returns boolean - Whether to show loading state
 */
export function useMinimumLoading(isLoading: boolean, minDuration: number = 800): boolean {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadingStartRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start loading - record the time
      loadingStartRef.current = Date.now();
      setShowLoading(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Loading finished - check if minimum time has passed
      if (loadingStartRef.current) {
        const elapsed = Date.now() - loadingStartRef.current;
        const remaining = minDuration - elapsed;
        
        if (remaining > 0) {
          // Wait for remaining time before hiding loader
          timeoutRef.current = setTimeout(() => {
            setShowLoading(false);
            loadingStartRef.current = null;
          }, remaining);
        } else {
          // Minimum time already passed, hide immediately
          setShowLoading(false);
          loadingStartRef.current = null;
        }
      } else {
        setShowLoading(false);
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, minDuration]);

  return showLoading;
}
