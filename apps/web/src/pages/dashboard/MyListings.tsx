import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth, useLanguage, useToast } from '../../context';
import { useDebounce } from '../../hooks';

interface Listing {
  _id: string;
  title: string;
  slug: string;
  status: 'active' | 'pending' | 'inactive' | 'rented' | 'menjam' | 'poklanjam';
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
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search for 300ms
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; listing: Listing | null }>({ open: false, listing: null });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
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
        setMenuPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.right + window.scrollX - 144, // 144px = menu width (w-36 = 9rem = 144px)
        });
        setOpenMenuId(listingId);
      }
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [token, currentPage, perPage, debouncedSearchQuery]);

  // Sync URL params when pagination changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (currentPage > 1) {
      newParams.set('page', currentPage.toString());
    }
    if (perPage !== getStoredPerPage()) {
      newParams.set('limit', perPage.toString());
    }
    setSearchParams(newParams, { replace: false });
  }, [currentPage, perPage]);

  // Listen to URL changes (browser back/forward)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    const newPage = pageParam ? parseInt(pageParam, 10) : 1;
    const newLimit = limitParam ? parseInt(limitParam, 10) : getStoredPerPage();
    
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
    if (newLimit !== perPage) {
      setPerPage(newLimit);
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
      
      const response = await fetch(`${API_URL}/resources/my?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        setListings(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        } else {
          setPagination({
            total: result.data?.length || 0,
            page: currentPage,
            limit: perPage,
            pages: Math.ceil((result.data?.length || 0) / perPage)
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
        success('Oglas obrisan', 'Vaš oglas je uspešno obrisan');
        fetchMyListings();
      } else {
        showError('Greška', 'Nije moguće obrisati oglas');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      showError('Greška', 'Došlo je do greške pri brisanju oglasa');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      rented: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      menjam: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      poklanjam: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    };
    const labels: Record<string, string> = {
      active: t.dashboard.active,
      pending: t.dashboard.pending,
      inactive: t.dashboard.inactive,
      rented: 'Iznajmljeno',
      menjam: 'Menjam',
      poklanjam: 'Poklanjam',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.myListings}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.dashboard.manageListings}</p>
        </div>
        <Link
          to="/dashboard/add-listing"
          className="bg-[#e85d45] hover:bg-[#d54d35] text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2 self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t.dashboard.addNewListing}
        </Link>
      </div>

      {/* Listings Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {searchQuery ? `${t.dashboard.search} (${pagination.total})` : `${t.dashboard.allListings} (${pagination.total})`}
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full sm:w-64 pl-9 pr-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20 focus:border-[#e85d45]"
              />
            </div>

            {/* Per Page */}
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
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
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#252525]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.listings}</th>
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
                    <td className="px-4 py-4">
                      <Link to={`/resources/${listing.slug}`} className="flex items-center gap-3 group">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={getImageUrl(listing.images[0].url)} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors">{listing.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {listing.location?.city}{listing.location?.address && `, ${listing.location.address}`}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">
                      €{listing.pricePerDay}/dan
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
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.dashboard.showing} {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, pagination.total)} {t.dashboard.of} {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.dashboard.previous}
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#e85d45] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.dashboard.next}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.dashboard.confirmDelete}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t.dashboard.deleteConfirmText} "{deleteModal.listing?.title}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, listing: null })}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
              >
                {t.dashboard.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
