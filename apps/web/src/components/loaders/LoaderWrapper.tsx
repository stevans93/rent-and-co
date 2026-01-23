import { useState, useEffect, ReactNode, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PublicLoader from './PublicLoader';
import DashboardLoader from './DashboardLoader';

/**
 * LOADER DURATION SETTINGS
 * ========================
 * Podesi vreme trajanja loadera ovde:
 * - Za testiranje: 3000 (3 sekunde)
 * - Za produkciju: 800 (0.8 sekundi)
 */
export const LOADER_DURATION = 800; // ms

interface LoaderWrapperProps {
  children: ReactNode;
  variant?: 'public' | 'dashboard';
}

/**
 * LoaderWrapper - Centralizovani loader za sve stranice
 * Koristi se u App.tsx oko svake stranice
 * 
 * Loader se prikazuje samo kad se promeni PATHNAME (ne query params)
 */
export default function LoaderWrapper({ 
  children, 
  variant = 'public' 
}: LoaderWrapperProps) {
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);
  const isFirstRender = useRef(true);

  // Show loader only when pathname changes (not query params)
  useEffect(() => {
    // Skip first render - loader already showing
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const timer = setTimeout(() => setShowLoader(false), LOADER_DURATION);
      return () => clearTimeout(timer);
    }
    
    // Show loader on pathname change
    setShowLoader(true);
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, LOADER_DURATION);

    return () => clearTimeout(timer);
  }, [location.pathname]); // Only pathname, not key or search

  if (showLoader) {
    return variant === 'public' ? <PublicLoader /> : <DashboardLoader />;
  }

  return <>{children}</>;
}
