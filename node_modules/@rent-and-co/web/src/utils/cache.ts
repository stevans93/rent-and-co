// Cache configuration
const CACHE_CONFIG = {
  // Cache durations in milliseconds
  durations: {
    short: 5 * 60 * 1000,         // 5 minutes - for frequently changing data
    medium: 30 * 60 * 1000,       // 30 minutes - for semi-static data
    long: 24 * 60 * 60 * 1000,    // 24 hours - for static data
    week: 7 * 24 * 60 * 60 * 1000 // 7 days - for rarely changing data
  },
  // Cache keys
  keys: {
    user: 'rentco_user',
    token: 'rentco_token',
    language: 'rentco_language',
    theme: 'rentco_theme',
    favorites: 'rentco_favorites',
    searchHistory: 'rentco_search_history',
    categories: 'rentco_categories',
    resources: 'rentco_resources',
  }
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Generic cache manager
export const cacheManager = {
  // Set item with expiry
  set<T>(key: string, data: T, duration: number = CACHE_CONFIG.durations.medium): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      // Handle quota exceeded
      console.warn('Cache storage full, clearing old items...');
      this.clearExpired();
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch {
        console.error('Failed to cache item:', key);
      }
    }
  },

  // Get item if not expired
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cached: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > cached.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  },

  // Remove specific item
  remove(key: string): void {
    localStorage.removeItem(key);
  },

  // Clear all expired items
  clearExpired(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('rentco_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const cached = JSON.parse(item);
            if (cached.expiry && Date.now() > cached.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Not a valid cache item, skip
        }
      }
    });
  },

  // Clear all cache
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('rentco_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get cache size in bytes
  getSize(): number {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('rentco_')) {
        const item = localStorage.getItem(key);
        if (item) {
          size += item.length * 2; // UTF-16 characters
        }
      }
    });
    return size;
  }
};

// Session cache for temporary data
export const sessionCache = {
  set<T>(key: string, data: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {
      console.warn('Session storage full');
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    sessionStorage.removeItem(key);
  },

  clear(): void {
    sessionStorage.clear();
  }
};

// Memory cache for runtime data (not persisted)
const memoryCache = new Map<string, { data: unknown; expiry: number }>();

export const memCache = {
  set<T>(key: string, data: T, duration: number = CACHE_CONFIG.durations.short): void {
    memoryCache.set(key, {
      data,
      expiry: Date.now() + duration
    });
  },

  get<T>(key: string): T | null {
    const item = memoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      memoryCache.delete(key);
      return null;
    }
    
    return item.data as T;
  },

  remove(key: string): void {
    memoryCache.delete(key);
  },

  clear(): void {
    memoryCache.clear();
  }
};

// Export cache keys and durations for easy access
export const CACHE_KEYS = CACHE_CONFIG.keys;
export const CACHE_DURATIONS = CACHE_CONFIG.durations;
