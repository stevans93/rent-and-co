import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: Set<string>;
  isFavorite: (resourceId: string) => boolean;
  toggleFavorite: (resourceId: string) => Promise<boolean>;
  isLoading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's favorites when authenticated
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavorites(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Extract resource IDs from favorites
          const favoriteIds = new Set<string>(
            result.data.map((fav: any) => fav.resourceId?._id || fav.resourceId || fav._id)
          );
          setFavorites(favoriteIds);
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load favorites when user logs in
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // Check if a resource is favorited
  const isFavorite = useCallback((resourceId: string): boolean => {
    return favorites.has(resourceId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (resourceId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return false;

    const currentlyFavorited = favorites.has(resourceId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${resourceId}`, {
        method: currentlyFavorited ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (currentlyFavorited) {
            newSet.delete(resourceId);
          } else {
            newSet.add(resourceId);
          }
          return newSet;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }, [isAuthenticated, favorites]);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      isFavorite, 
      toggleFavorite, 
      isLoading,
      refreshFavorites 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
