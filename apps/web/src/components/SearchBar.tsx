import { useState } from 'react';
import { useLanguage } from '../context';

interface SearchBarProps {
  onSearch?: (query: string, type: 'resources' | 'services') => void;
  className?: string;
  showTabs?: boolean;
}

export default function SearchBar({ onSearch, className = '', showTabs = true }: SearchBarProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'resources' | 'services'>('resources');
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, activeTab);
    } else {
      // Default: redirect to search page
      window.location.href = `/search?q=${encodeURIComponent(query)}&type=${activeTab}`;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Tabs */}
      {showTabs && (
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'resources'
                ? 'bg-white text-gray-900 border-b-2 border-[#e85d45]'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.home.resources || 'Resursi'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white text-gray-900 border-b-2 border-[#e85d45]'
                : 'bg-gray-50 text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.home.services || 'Usluge'}
          </button>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
          <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-4 py-3">
            <svg
              className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
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
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.home.searchPlaceholder}
              className="flex-1 outline-none text-gray-700 min-w-0 bg-transparent"
              aria-label="Pretraga"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-0">
            <button 
              type="button" 
              className="sm:ml-3 px-4 py-3 text-gray-600 hover:text-gray-900 inline-flex items-center gap-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Otvori filtere"
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span className="hidden sm:inline">{t.home.filters}</span>
            </button>
            <button 
              type="submit" 
              className="sm:ml-3 bg-[#e85d45] text-white px-6 py-3 rounded-lg hover:bg-[#d54d35] transition-colors inline-flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="hidden sm:inline">{t.home.search || 'Pretraži'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
