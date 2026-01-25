import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth, useLanguage, useToast } from '../../context';
import { useDebounce } from '../../hooks';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Listing {
  _id: string;
  title: string;
  slug: string;
  status: 'active' | 'inactive';
  listingType?: 'rent' | 'sale' | 'gift' | 'exchange';
  pricePerDay: number;
  currency: string;
  views: number;
  favorites: number;
  createdAt: string;
  location: {
    city: string;
    address?: string;
  };
  images: { url: string }[];
  categoryId?: Category;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', ''); // Remove /api for static files

// Helper to get full image URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export default function MyListings() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { success, error: showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [drafts, setDrafts] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search for 300ms
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; listing: Listing | null }>({ open: false, listing: null });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
  // Filter states - status, category and type separately
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || 'all');
  const [typeFilter, setTypeFilter] = useState(() => searchParams.get('type') || 'all');
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Get perPage from localStorage, default to 10
  const getStoredPerPage = () => {
    const stored = localStorage.getItem('myListingsPerPage');
    return stored ? parseInt(stored, 10) : 10;
  };

  // Pagination state - read from URL params, fallback to stored/default values
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [perPage, setPerPage] = useState(() => {
    const limitParam = searchParams.get('limit');
    return limitParam ? parseInt(limitParam, 10) : getStoredPerPage();
  });
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, pages: 1 });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId && !buttonRefs.current[openMenuId]?.contains(e.target as Node)) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleMenuToggle = (listingId: string) => {
    if (openMenuId === listingId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const button = buttonRefs.current[listingId];
      if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownHeight = 200; // Approximate height of dropdown menu
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < dropdownHeight;
        
        setMenuPosition({
          top: openUp 
            ? rect.top + window.scrollY - dropdownHeight - 4 
            : rect.bottom + window.scrollY + 4,
          left: rect.right + window.scrollX - 144, // 144px = menu width (w-36 = 9rem = 144px)
          openUp,
        });
        setOpenMenuId(listingId);
      }
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [token, currentPage, perPage, debouncedSearchQuery, statusFilter, categoryFilter, typeFilter]);

  // Sync URL params when pagination/filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (currentPage > 1) {
      newParams.set('page', currentPage.toString());
    }
    if (perPage !== getStoredPerPage()) {
      newParams.set('limit', perPage.toString());
    }
    if (statusFilter !== 'all') {
      newParams.set('status', statusFilter);
    }
    if (categoryFilter !== 'all') {
      newParams.set('category', categoryFilter);
    }
    if (typeFilter !== 'all') {
      newParams.set('type', typeFilter);
    }
    setSearchParams(newParams, { replace: false });
  }, [currentPage, perPage, statusFilter, categoryFilter, typeFilter]);

  // Listen to URL changes (browser back/forward)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const statusParam = searchParams.get('status');
    const categoryParam = searchParams.get('category');
    const typeParam = searchParams.get('type');
    
    const newPage = pageParam ? parseInt(pageParam, 10) : 1;
    const newLimit = limitParam ? parseInt(limitParam, 10) : getStoredPerPage();
    const newStatus = statusParam || 'all';
    const newCategory = categoryParam || 'all';
    const newType = typeParam || 'all';
    
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
    if (newLimit !== perPage) {
      setPerPage(newLimit);
    }
    if (newStatus !== statusFilter) {
      setStatusFilter(newStatus);
    }
    if (newCategory !== categoryFilter) {
      setCategoryFilter(newCategory);
    }
    if (newType !== typeFilter) {
      setTypeFilter(newType);
    }
  }, [searchParams]);

  const fetchMyListings = async () => {
    if (!token) return;
    
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', perPage.toString());
      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim());
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      
      const response = await fetch(`${API_URL}/resources/my?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        const allListings = result.data || [];
        // Separate drafts from regular listings
        const draftListings = allListings.filter((l: Listing) => l.status === 'draft');
        const regularListings = allListings.filter((l: Listing) => l.status !== 'draft');
        setDrafts(draftListings);
        setListings(regularListings);
        if (result.pagination) {
          setPagination(result.pagination);
        } else {
          setPagination({
            total: regularListings.length,
            page: currentPage,
            limit: perPage,
            pages: Math.ceil(regularListings.length / perPage)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.listing || !token) return;

    try {
      const response = await fetch(`${API_URL}/resources/${deleteModal.listing._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setListings(listings.filter(l => l._id !== deleteModal.listing?._id));
        setDeleteModal({ open: false, listing: null });
        success(t.toasts.listingDeleted, t.toasts.listingDeletedDesc);
        fetchMyListings();
      } else {
        showError(t.toasts.error, t.toasts.deleteError);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      showError(t.toasts.error, t.toasts.deleteErrorDesc);
    }
  };

  const toggleStatus = async (listingId: string, currentStatus: string) => {
    if (!token) return;
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`${API_URL}/resources/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setListings(listings.map(l => 
          l._id === listingId ? { ...l, status: newStatus as Listing['status'] } : l
        ));
        if (newStatus === 'active') {
          success(t.toasts.listingActivated || 'Oglas aktiviran', t.toasts.listingActivatedDesc || 'Vaš oglas je sada vidljiv.');
        } else {
          success(t.toasts.listingDeactivated || 'Oglas deaktiviran', t.toasts.listingDeactivatedDesc || 'Vaš oglas više nije vidljiv.');
        }
      } else {
        showError(t.toasts.error, t.toasts.updateError || 'Greška pri ažuriranju statusa');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError(t.toasts.error, t.errors.serverError);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };
    const labels: Record<string, string> = {
      active: t.dashboard.active,
      inactive: t.dashboard.inactive,
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handlePerPageChange = (newPerPage: number) => {
    // Save to localStorage for persistence
    localStorage.setItem('myListingsPerPage', newPerPage.toString());
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.myListings}</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.dashboard.manageListings}</p>
        </div>
        <Link
          to="/dashboard/add-listing"
          className="bg-[#e85d45] hover:bg-[#d54d35] text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2 self-start text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t.dashboard.addNewListing}
        </Link>
      </div>

      {/* Drafts Section - Compact */}
      {drafts.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200/50 dark:border-amber-800/30 mb-4 sm:mb-6 p-2 sm:p-3">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300">
              {t.dashboard.drafts || 'Nacrti'} ({drafts.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {drafts.map((draft) => (
              <div key={draft._id} className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-[#252525] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-amber-200/50 dark:border-amber-800/30 group">
                {draft.images?.[0] ? (
                  <img
                    src={getImageUrl(draft.images[0].url)}
                    alt={draft.title}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 max-w-[80px] sm:max-w-[120px] truncate">
                  {draft.title || (t.dashboard.untitledDraft || 'Nacrt')}
                </span>
                <Link
                  to={`/dashboard/edit-listing/${draft._id}`}
                  className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#e85d45] hover:bg-[#d54d35] text-white rounded font-medium transition-colors"
                >
                  {t.dashboard.continueDraft || 'Nastavi'}
                </Link>
                <button
                  onClick={() => setDeleteModal({ open: true, listing: draft })}
                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800">
        {/* Header with Title, Search and Pagination */}
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
          <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
            {searchQuery ? `${t.dashboard.search} (${pagination.total})` : `${t.dashboard.allListings} (${pagination.total})`}
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t.dashboard.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48 pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20 focus:border-[#e85d45]"
              />
            </div>

            {/* Per Page */}
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="px-2 sm:px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
            >
              <option value={5}>5 {t.dashboard.perPage}</option>
              <option value={10}>10 {t.dashboard.perPage}</option>
              <option value={15}>15 {t.dashboard.perPage}</option>
            </select>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.dashboard.noListingsFound}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t.dashboard.createFirstListing}</p>
            <Link
              to="/dashboard/add-listing"
              className="bg-[#e85d45] hover:bg-[#d54d35] text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.dashboard.addListing}
            </Link>
          </div>
        ) : listings.length === 0 && searchQuery ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.dashboard.noListingsFound}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t.common.noResults} "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#e85d45] hover:text-[#d54d35] font-medium transition-colors"
            >
              {t.dashboard.clearSearch || 'Obriši pretragu'}
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {listings.map((listing) => (
                <div key={listing._id} className="p-3">
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <Link to={`/resources/${listing.slug}`} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {listing.images && listing.images.length > 0 ? (
                        <img src={getImageUrl(listing.images[0].url)} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </Link>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/resources/${listing.slug}`} className="font-medium text-sm text-gray-900 dark:text-white truncate hover:text-[#e85d45]">
                          {listing.title}
                        </Link>
                        <button
                          ref={(el) => { buttonRefs.current[listing._id] = el; }}
                          onClick={(e) => { e.stopPropagation(); handleMenuToggle(listing._id); }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{listing.location?.city}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {getStatusBadge(listing.status)}
                        <span className="text-xs font-medium text-gray-900 dark:text-white">€{listing.pricePerDay}/{t.dashboard.perDayPrice || 'dan'}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {listing.views || 0}
                        </span>
                        <span className="flex items-center gap-1 text-[#e85d45]">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          {listing.favorites || 0}
                        </span>
                        <span>{new Date(listing.createdAt).toLocaleDateString('sr-RS')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#252525]">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.listings}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.search.category || 'Kategorija'}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.listingType || 'Tip oglasa'}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.status}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.price}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.views}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.favorites}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.date}</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/resources/${listing.slug}`} className="flex items-center gap-3 group">
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            {listing.images && listing.images.length > 0 ? (
                              <img 
                                src={getImageUrl(listing.images[0].url)} 
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors truncate max-w-[200px]">{listing.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {listing.location?.city}{listing.location?.address && `, ${listing.location.address}`}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {(t.categories as Record<string, string>)[listing.categoryId?.slug || ''] || listing.categoryId?.name || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.listingType === 'rent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        listing.listingType === 'sale' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        listing.listingType === 'gift' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                        listing.listingType === 'exchange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {listing.listingType === 'rent' ? t.dashboard.forRent :
                         listing.listingType === 'sale' ? t.dashboard.forSale :
                         listing.listingType === 'gift' ? t.dashboard.forFree :
                         listing.listingType === 'exchange' ? t.dashboard.forExchange :
                         t.dashboard.forRent}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">
                      €{listing.pricePerDay}/{t.dashboard.perDayPrice || t.common.perDay || 'dan'}
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {listing.views || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#e85d45]">
                      {listing.favorites || 0}
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(listing.createdAt).toLocaleDateString('sr-RS')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        ref={(el) => { buttonRefs.current[listing._id] = el; }}
                        onClick={(e) => { e.stopPropagation(); handleMenuToggle(listing._id); }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label="Opcije"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Dropdown Menu Portal */}
        {openMenuId && menuPosition && createPortal(
          <div 
            className="fixed w-36 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-[9999]"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <Link
              to={`/resources/${listings.find(l => l._id === openMenuId)?.slug}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] rounded-t-lg"
              onClick={() => { setOpenMenuId(null); setMenuPosition(null); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t.dashboard.view}
            </Link>
            <Link
              to={`/dashboard/edit-listing/${openMenuId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]"
              onClick={() => { setOpenMenuId(null); setMenuPosition(null); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t.dashboard.edit}
            </Link>
            {/* Toggle Status Button */}
            {(() => {
              const listing = listings.find(l => l._id === openMenuId);
              if (!listing) return null;
              const isActive = listing.status === 'active';
              return (
                <button
                  onClick={() => {
                    toggleStatus(listing._id, listing.status);
                    setOpenMenuId(null);
                    setMenuPosition(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm w-full ${
                    isActive 
                      ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                      : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  {isActive ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      {t.dashboard.deactivate || 'Deaktiviraj'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.dashboard.activate || 'Aktiviraj'}
                    </>
                  )}
                </button>
              );
            })()}
            <button
              onClick={() => {
                const listing = listings.find(l => l._id === openMenuId);
                if (listing) setDeleteModal({ open: true, listing });
                setOpenMenuId(null);
                setMenuPosition(null);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full rounded-b-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t.dashboard.delete}
            </button>
          </div>,
          document.body
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t.dashboard.showing} {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, pagination.total)} {t.dashboard.of} {pagination.total}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">{t.dashboard.previous}</span>
                <span className="sm:hidden">&lt;</span>
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let page;
                if (pagination.pages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= pagination.pages - 2) {
                  page = pagination.pages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#e85d45] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">{t.dashboard.next}</span>
                <span className="sm:hidden">&gt;</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.dashboard.confirmDelete}</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
              {t.dashboard.deleteConfirmText} "{deleteModal.listing?.title}"?
            </p>
            <div className="flex gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, listing: null })}
                className="px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
              >
                {t.dashboard.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-3 sm:px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {t.dashboard.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
