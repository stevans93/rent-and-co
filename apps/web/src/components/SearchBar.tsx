import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context';
import { resourcesApi, SearchSuggestion } from '../services/api';

interface SearchBarProps {
  onSearch?: (query: string, type: 'resources' | 'services') => void;
  className?: string;
  showTabs?: boolean;
  variant?: 'default' | 'hero';
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchBar({ onSearch, className = '', showTabs = true, variant = 'default' }: SearchBarProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resources' | 'services'>('resources');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Brži debounce - 150ms umesto 300ms
  const debouncedQuery = useDebounce(query, 150);

  // Fetch suggestions - od prvog karaktera
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await resourcesApi.getSuggestions(searchQuery);
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for debounced search
  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(query, activeTab);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    setQuery('');
    navigate(`/resources/${suggestion.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  // Suggestion dropdown component - kompaktan, max 4 rezultata
  const SuggestionsDropdown = () => {
    if (!showSuggestions || (suggestions.length === 0 && !isLoading && query.length >= 1)) {
      if (query.length >= 1 && !isLoading) {
        return (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
              Nema rezultata
            </div>
          </div>
        );
      }
      return null;
    }

    if (isLoading) {
      return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-3 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#e85d45] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      );
    }

    if (suggestions.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            className={`w-full flex items-center gap-3 p-2.5 text-left transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
              index === selectedIndex
                ? 'bg-gray-100 dark:bg-[#252525]'
                : 'hover:bg-gray-50 dark:hover:bg-[#252525]'
            }`}
          >
            {/* Image - manja */}
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {suggestion.image ? (
                <img
                  src={suggestion.image}
                  alt={suggestion.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                {suggestion.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {suggestion.category}{suggestion.city && ` • ${suggestion.city}`}
              </p>
            </div>
            
            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-[#e85d45] text-sm">
                €{suggestion.price}
                <span className="text-xs text-gray-500 dark:text-gray-400">/dan</span>
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  };

  // Hero variant - simplified design like local.ch
  if (variant === 'hero') {
    return (
      <div className={`${className}`} ref={wrapperRef}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              {/* Search Icon (Left) */}
              <div className="pl-5 pr-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              
              {/* Input - no focus ring */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder={t.home.searchPlaceholder}
                className="flex-1 py-4 px-2 text-gray-700 text-lg outline-none bg-transparent placeholder:text-gray-400 min-w-0 focus:outline-none focus:ring-0 border-none"
                aria-label="Pretraga"
                autoComplete="off"
              />
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="pr-2">
                  <div className="w-5 h-5 border-2 border-[#e85d45] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {/* Submit Button (Right) */}
              <button 
                type="submit" 
                className="bg-[#e85d45] hover:bg-[#d54d35] text-white p-4 m-1 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-0"
                aria-label="Pretraži"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            
            {/* Suggestions Dropdown */}
            <SuggestionsDropdown />
          </div>
          
          {/* Quick Links below search - orange/coral color */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-4">
            <a href="/categories/turizam-i-odmor" className="text-[#e85d45] text-sm font-medium underline underline-offset-2">
              {t.categories?.['turizam-i-odmor'] || 'Turizam i Odmor'}
            </a>
            <a href="/categories/ugostiteljstvo" className="text-[#e85d45] text-sm font-medium underline underline-offset-2">
              {t.categories?.['ugostiteljstvo'] || 'Ugostiteljstvo'}
            </a>
            <a href="/categories/vozila-masine-i-alati" className="text-[#e85d45] text-sm font-medium underline underline-offset-2">
              {t.categories?.['vozila-masine-i-alati'] || 'Vozila'}
            </a>
            <a href="/categories/usluge" className="text-[#e85d45] text-sm font-medium underline underline-offset-2">
              {t.categories?.['usluge'] || 'Usluge'}
            </a>
            <a href="/categories/razno" className="text-[#e85d45] text-sm font-medium underline underline-offset-2">
              {t.categories?.['razno'] || 'Razno'}
            </a>
          </div>
        </form>
      </div>
    );
  }

  // Default variant (original design)
  return (
    <div className={`bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg overflow-hidden ${className}`} ref={wrapperRef}>
      {/* Tabs */}
      {showTabs && (
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'resources'
                ? 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-b-2 border-[#e85d45]'
                : 'bg-gray-50 dark:bg-[#252525] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.home.resources || 'Resursi'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-b-2 border-[#e85d45]'
                : 'bg-gray-50 dark:bg-[#252525] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.home.services || 'Usluge'}
          </button>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <div className="flex items-center bg-gray-50 dark:bg-[#252525] rounded-full px-4">
            {/* Search Icon Left */}
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder={t.home.searchPlaceholder}
              className="flex-1 py-3 px-3 outline-none text-gray-700 dark:text-gray-200 min-w-0 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0"
              aria-label="Pretraga"
              autoComplete="off"
            />
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="pr-2">
                <div className="w-4 h-4 border-2 border-[#e85d45] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {/* Submit Button Right */}
            <button 
              type="submit" 
              className="bg-[#e85d45] hover:bg-[#d54d35] text-white p-2 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-0"
              aria-label="Pretraži"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          
          {/* Suggestions Dropdown */}
          <SuggestionsDropdown />
        </div>
      </form>
    </div>
  );
}
