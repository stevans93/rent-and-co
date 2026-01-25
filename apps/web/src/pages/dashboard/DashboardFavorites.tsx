import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage, useToast, useAuth } from '../../context';
import { useDebounce } from '../../hooks';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

// Helper to get full image URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

interface FavoriteResource {
  _id: string;
  title: string;
  slug: string;
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  pricePerDay: number;
  currency: string;
  status: string;
  location: {
    city: string;
    address?: string;
  };
  images: { url: string; alt?: string }[];
  createdAt: string;
}

export default function DashboardFavorites() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const { success, error: showError, info } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [favorites, setFavorites] = useState<FavoriteResource[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [removeModal, setRemoveModal] = useState<{ open: boolean; item: FavoriteResource | null }>({ open: false, item: null });
  const [removing, setRemoving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Pagination from URL
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  });
  const [perPage, setPerPage] = useState(() => {
    const savedPerPage = localStorage.getItem('favoritePerPage');
    const limitParam = searchParams.get('limit');
    if (limitParam) return Math.max(1, parseInt(limitParam));
    if (savedPerPage) return parseInt(savedPerPage);
    return 10;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [allCategories, setAllCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Ref to track if we're syncing from URL (to prevent loop)
  const isSyncingFromUrl = useRef(false);

  // Sync state from URL when browser back/forward is used
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    
    const newPage = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
    const newLimit = limitParam ? Math.max(1, parseInt(limitParam)) : (parseInt(localStorage.getItem('favoritePerPage') || '10'));
    const newSearch = searchParam || '';
    const newCategory = categoryParam || '';
    const newStatus = statusParam || '';
    const newType = typeParam || '';
    
    // Check if any value is different
    const hasChanges = newPage !== currentPage || newLimit !== perPage || newSearch !== searchQuery || newCategory !== selectedCategory || newStatus !== selectedStatus || newType !== selectedType;
    
    if (hasChanges) {
      isSyncingFromUrl.current = true;
      setCurrentPage(newPage);
      setPerPage(newLimit);
      setSearchQuery(newSearch);
      setSelectedCategory(newCategory);
      setSelectedStatus(newStatus);
      setSelectedType(newType);
      // Reset the flag after a short delay to allow state updates to complete
      setTimeout(() => {
        isSyncingFromUrl.current = false;
      }, 50);
    }
  }, [searchParams]);

  // Update URL when params change (only from user actions, not from URL sync)
  useEffect(() => {
    // Skip if we're syncing from URL
    if (isSyncingFromUrl.current) return;
    
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (perPage !== 10) params.set('limit', perPage.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedType) params.set('type', selectedType);
    
    // Check if URL needs to be updated
    const currentUrlPage = parseInt(searchParams.get('page') || '1');
    const currentUrlLimit = parseInt(searchParams.get('limit') || '10');
    const currentUrlSearch = searchParams.get('search') || '';
    const currentUrlCategory = searchParams.get('category') || '';
    const currentUrlStatus = searchParams.get('status') || '';
    const currentUrlType = searchParams.get('type') || '';
    
    if (currentPage !== currentUrlPage || perPage !== currentUrlLimit || searchQuery !== currentUrlSearch || selectedCategory !== currentUrlCategory || selectedStatus !== currentUrlStatus || selectedType !== currentUrlType) {
      setSearchParams(params);
    }
  }, [currentPage, perPage, searchQuery, selectedCategory, selectedStatus, selectedType, setSearchParams]);

  // Fetch favorites with backend search
  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', perPage.toString());
      if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedStatus) params.set('status', selectedStatus);
      if (selectedType) params.set('type', selectedType);
      
      const response = await fetch(`${API_URL}/favorites?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setFavorites(result.data);
        setTotalCount(result.pagination?.total || result.data.length);
        setTotalPages(result.pagination?.pages || 1);
      } else {
        showError(t.common?.error || 'Greška', t.dashboard?.loadError || 'Nije moguće učitati omiljene oglase');
      }
    } catch (err) {
      showError(t.common?.error || 'Greška', t.dashboard?.loadError || 'Došlo je do greške prilikom učitavanja');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, perPage, debouncedSearchQuery, selectedCategory, selectedStatus, selectedType, showError, t]);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const result = await response.json();
      if (result.success) {
        setAllCategories(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async () => {
    if (!removeModal.item || !token) return;
    setRemoving(true);

    try {
      const response = await fetch(`${API_URL}/favorites/${removeModal.item._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setRemoveModal({ open: false, item: null });
        success(t.dashboard?.removed || 'Uklonjeno', t.dashboard?.removed || 'Oglas je uklonjen iz omiljenih');
        fetchFavorites(); // Refetch to update list
      } else {
        showError(t.common?.error || 'Greška', result.message || t.dashboard?.removeError || 'Nije moguće ukloniti oglas');
      }
    } catch (err) {
      showError(t.common?.error || 'Greška', t.common?.error || 'Došlo je do greške');
    } finally {
      setRemoving(false);
    }
  };

  const handleClearAll = async () => {
    if (!token) return;

    try {
      // Remove each favorite one by one
      for (const fav of favorites) {
        await fetch(`${API_URL}/favorites/${fav._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      setFavorites([]);
      setTotalCount(0);
      info(t.dashboard?.clearAll || 'Obrisano', t.dashboard?.removedAll || 'Svi omiljeni oglasi su uklonjeni');
    } catch (err) {
      showError(t.common?.error || 'Greška', t.common?.error || 'Došlo je do greške prilikom brisanja');
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    localStorage.setItem('favoritePerPage', newPerPage.toString());
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedType('');
    setCurrentPage(1);
    info(t.dashboard?.filtersCleared || 'Filtri očišćeni', t.dashboard?.filtersClearedDesc || 'Svi filtri su resetovani');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== '' || selectedStatus !== '' || selectedType !== '';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.favorites || 'Omiljeni oglasi'}</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {totalCount} {totalCount === 1 ? (t.dashboard.savedListing || 'sačuvan oglas') : (t.dashboard.savedListings || 'sačuvanih oglasa')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <button
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 sm:gap-2 ${
              hasActiveFilters 
                ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800' 
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">{t.dashboard?.clearFilters || 'Očisti filtere'}</span>
          </button>
          {totalCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 sm:gap-2"
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">{t.dashboard?.clearAllFavorites || 'Obriši sve oglase'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Favorites Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800">
        {/* Header with Title, Search and Pagination */}
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
          <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
            {hasActiveFilters 
              ? `${t.dashboard.found || 'Pronađeno'} (${favorites.length})` 
              : `${t.dashboard.allFavorites || 'Svi omiljeni'} (${totalCount})`}
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t.dashboard.searchFavorites || 'Pretraži omiljene...'}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full sm:w-48 pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20 focus:border-[#e85d45]"
              />
            </div>

            {/* Per Page */}
            {totalCount > 0 && (
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="px-2 sm:px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
              >
                <option value={5}>5 {t.dashboard.perPage || 'po stranici'}</option>
                <option value={10}>10 {t.dashboard.perPage || 'po stranici'}</option>
                <option value={15}>15 {t.dashboard.perPage || 'po stranici'}</option>
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85d45] mx-auto"></div>
          </div>
        ) : totalCount === 0 && !hasActiveFilters ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.dashboard.noFavorites || 'Nemate omiljenih oglasa'}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t.dashboard.noFavoritesDescription || 'Pretražite oglase i kliknite na srce da biste sačuvali omiljene oglase.'}
            </p>
            <Link
              to="/search"
              className="bg-[#e85d45] hover:bg-[#d54d35] text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t.dashboard.browseListings || 'Pretraži oglase'}
            </Link>
          </div>
        ) : favorites.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t.dashboard.noResults || 'Nema rezultata za trenutne filtere.'}
            </p>
            <button
              onClick={handleClearFilters}
              className="text-[#e85d45] hover:underline"
            >
              {t.dashboard.resetFilters || 'Resetuj filtere'}
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {favorites.map((item) => (
                <div key={item._id} className="p-3 sm:p-4">
                  <Link to={`/resources/${item.slug}`} className="flex gap-3 mb-2">
                    {item.images && item.images.length > 0 ? (
                      <img 
                        src={getImageUrl(item.images[0].url)} 
                        alt={item.title} 
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.location.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-[#e85d45]">
                          {item.currency === 'EUR' ? '€' : item.currency}{item.pricePerDay}/{t.dashboard.perDayPrice || 'dan'}
                        </span>
                        <span className="text-[10px] font-medium text-[#e85d45] bg-[#e85d45]/10 px-1.5 py-0.5 rounded">
                          {item.categoryId?.slug 
                            ? ((t.categories as Record<string, string>)[item.categoryId.slug] || item.categoryId?.name || '-')
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Link
                      to={`/resources/${item.slug}`}
                      className="p-2 text-gray-500 hover:text-[#e85d45] hover:bg-[#e85d45]/10 rounded-lg transition-colors"
                      title={t.dashboard.viewListingTitle || 'Pogledaj oglas'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setRemoveModal({ open: true, item })}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t.dashboard.removeFromFavoritesTitle || 'Ukloni iz omiljenih'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#252525]">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.listing || 'Oglas'}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.category || 'Kategorija'}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.price || 'Cena'}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.location || 'Lokacija'}</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.actions || 'Akcije'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {favorites.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                      <td className="px-4 py-4">
                        <Link to={`/resources/${item.slug}`} className="flex items-center gap-3 group">
                          {item.images && item.images.length > 0 ? (
                            <img 
                              src={getImageUrl(item.images[0].url)} 
                              alt={item.title} 
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.status === 'active' ? (t.dashboard.activeStatus || 'Aktivan') : item.status}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-[#e85d45] bg-[#e85d45]/10 px-2 py-1 rounded">
                          {item.categoryId?.slug 
                            ? ((t.categories as Record<string, string>)[item.categoryId.slug] || item.categoryId?.name || '-')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">
                        {item.currency === 'EUR' ? '€' : item.currency}{item.pricePerDay}/{t.dashboard.perDayPrice || 'dan'}
                      </td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                        {item.location.city}{item.location.address && `, ${item.location.address}`}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/resources/${item.slug}`}
                            className="p-2 text-gray-500 hover:text-[#e85d45] hover:bg-[#e85d45]/10 rounded-lg transition-colors"
                            title={t.dashboard.viewListingTitle || 'Pogledaj oglas'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => setRemoveModal({ open: true, item })}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t.dashboard.removeFromFavoritesTitle || 'Ukloni iz omiljenih'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
              {t.dashboard.showing || 'Prikazano'} {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalCount)} {t.dashboard.of || 'od'} {totalCount}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">{t.dashboard.previous || 'Prethodna'}</span>
                <span className="sm:hidden">←</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 sm:w-8 h-7 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#e85d45] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">{t.dashboard.next || 'Sledeća'}</span>
                <span className="sm:hidden">→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {removeModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.removeFromFavorites || 'Ukloni iz omiljenih'}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t.dashboard.removeConfirmText || `Da li ste sigurni da želite da uklonite "${removeModal.item?.title}" iz omiljenih?`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRemoveModal({ open: false, item: null })}
                disabled={removing}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors disabled:opacity-50"
              >
                {t.dashboard.cancel || 'Otkaži'}
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {removing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {t.dashboard.remove || 'Ukloni'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
