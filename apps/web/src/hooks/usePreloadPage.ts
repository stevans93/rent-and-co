import { useCallback } from 'react';

// Preload page chunks on hover/focus for faster navigation
export function usePreloadPage() {
  const preload = useCallback((pageName: string) => {
    switch (pageName) {
      case 'home':
        import('../pages/HomePage');
        break;
      case 'categories':
        import('../pages/CategoriesPage');
        break;
      case 'search':
        import('../pages/SearchPage');
        break;
      case 'about':
        import('../pages/AboutPage');
        break;
      case 'contact':
        import('../pages/ContactPage');
        break;
      case 'login':
        import('../pages/LoginPage');
        break;
      case 'register':
        import('../pages/RegisterPage');
        break;
      case 'favorites':
        import('../pages/FavoritesPage');
        break;
    }
  }, []);

  return { preload };
}

export default usePreloadPage;
