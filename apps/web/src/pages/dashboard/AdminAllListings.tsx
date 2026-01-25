import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

// Helper to get full image URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

interface Resource {
  _id: string;
  title: string;
  slug: string;
  images: { url: string; alt: string }[];
  pricePerDay: number;
  status: 'active' | 'inactive';
  listingType?: 'rent' | 'sale' | 'gift' | 'exchange';
  views: number;
  favorites: number;
  createdAt: string;
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  categoryId: {
    name: string;
    slug: string;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function AdminAllListings() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dropdown state for actions
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem('adminListingsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, pages: 1 });
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number }>({ total: 0, active: 0, inactive: 0 });

  // Function to toggle dropdown and calculate position
  const toggleDropdown = (resourceId: string) => {
    if (openDropdownId === resourceId) {
      setOpenDropdownId(null);
      setDropdownPosition(null);
    } else {
      const button = buttonRefs.current[resourceId];
      if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownHeight = 220; // Approximate height of dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < dropdownHeight;
        
        setDropdownPosition({
          top: openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
          left: rect.right - 192,
          openUp,
        });
      }
      setOpenDropdownId(resourceId);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickOnButton = Object.values(buttonRefs.current).some(btn => btn?.contains(target));
      if (dropdownRef.current && !dropdownRef.current.contains(target) && !isClickOnButton) {
        setOpenDropdownId(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
        setDropdownPosition(null);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [openDropdownId]);

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

  useEffect(() => {
    fetchResources();
  }, [statusFilter, categoryFilter, typeFilter, currentPage, perPage, searchQuery]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', currentPage.toString());
      params.append('limit', perPage.toString());
      
      const res = await fetch(`${API_URL}/resources/admin?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setResources(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        } else {
          setPagination({
            total: data.data.length,
            page: currentPage,
            limit: perPage,
            pages: Math.ceil(data.data.length / perPage)
          });
        }
        // Set stats from API response
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateResourceStatus = async (resourceId: string, newStatus: string, reason?: string) => {
    try {
      const res = await fetch(`${API_URL}/resources/${resourceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setResources(resources.map(r => 
          r._id === resourceId ? { ...r, status: newStatus as Resource['status'] } : r
        ));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating resource status:', error);
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj oglas?')) return;
    
    try {
      const res = await fetch(`${API_URL}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setResources(resources.filter(r => r._id !== resourceId));
        fetchResources();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  // Since we now do server-side filtering, filteredResources is just resources
  const filteredResources = resources;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t.dashboard.active || 'Aktivan';
      case 'inactive':
        return t.dashboard.inactive || 'Neaktivan';
      default:
        return status;
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    localStorage.setItem('adminListingsPerPage', newPerPage.toString());
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.listingsManagement}</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.dashboard.allListings}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <button
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`p-3 sm:p-4 rounded-xl border transition-colors ${
            statusFilter === 'all' 
              ? 'bg-[#e85d45]/5 border-[#e85d45] dark:bg-[#e85d45]/10' 
              : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{t.dashboard.allStatuses}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </button>
        <button
          onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
          className={`p-3 sm:p-4 rounded-xl border transition-colors ${
            statusFilter === 'active' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
              : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{t.dashboard.active}</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </button>
        <button
          onClick={() => { setStatusFilter('inactive'); setCurrentPage(1); }}
          className={`p-3 sm:p-4 rounded-xl border transition-colors ${
            statusFilter === 'inactive' 
              ? 'bg-gray-100 dark:bg-gray-800 border-gray-400' 
              : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{t.dashboard.inactive || 'Neaktivan'}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</p>
        </button>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header with Title, Search and Pagination */}
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
          <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
            {t.dashboard.allListings} ({pagination.total})
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t.dashboard.searchListings}
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

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {filteredResources.map((resource) => (
            <div key={resource._id} className="p-3 sm:p-4">
              <div className="flex gap-3 mb-2">
                {resource.images[0] ? (
                  <img
                    src={getImageUrl(resource.images[0].url)}
                    alt={resource.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/resources/${resource.slug}`}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#e85d45] line-clamp-1"
                  >
                    {resource.title}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{resource.ownerId?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(resource.status)}`}>
                      {getStatusLabel(resource.status)}
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{resource.pricePerDay?.toLocaleString()} RSD</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{new Date(resource.createdAt).toLocaleDateString('sr-RS')}</span>
                <button
                  ref={(el) => { buttonRefs.current[resource._id] = el; }}
                  onClick={() => toggleDropdown(resource._id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.listing}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.category || 'Kategorija'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.listingType || 'Tip oglasa'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.ownerColumn}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.status}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.price}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.viewsCount}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.date}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.actionsColumn}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredResources.map((resource) => (
                <tr key={resource._id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {resource.images[0] ? (
                        <img
                          src={getImageUrl(resource.images[0].url)}
                          alt={resource.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to={`/resources/${resource.slug}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-[#e85d45] line-clamp-1"
                        >
                          {resource.title}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {(t.categories as Record<string, string>)[resource.categoryId?.slug || ''] || resource.categoryId?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      resource.listingType === 'rent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      resource.listingType === 'sale' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      resource.listingType === 'gift' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                      resource.listingType === 'exchange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {resource.listingType === 'rent' ? t.dashboard.forRent :
                       resource.listingType === 'sale' ? t.dashboard.forSale :
                       resource.listingType === 'gift' ? t.dashboard.forFree :
                       resource.listingType === 'exchange' ? t.dashboard.forExchange :
                       t.dashboard.forRent}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">{resource.ownerId?.firstName} {resource.ownerId?.lastName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{resource.ownerId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(resource.status)}`}>
                      {getStatusLabel(resource.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    {resource.pricePerDay?.toLocaleString()} RSD
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{resource.views}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(resource.createdAt).toLocaleDateString('sr-RS')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      ref={(el) => { buttonRefs.current[`desktop-${resource._id}`] = el; }}
                      onClick={() => toggleDropdown(`desktop-${resource._id}`)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <svg className="w-10 sm:w-12 h-10 sm:h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.dashboard.noListingsFound}</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
              {t.dashboard.showing} {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, pagination.total)} {t.dashboard.of} {pagination.total}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">{t.dashboard.previous}</span>
                <span className="sm:hidden">←</span>
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
                    className={`w-7 sm:w-8 h-7 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
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
                <span className="sm:hidden">→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Modal */}
      {isModalOpen && selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl max-w-md w-full p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t.dashboard.changeListingStatus}</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">{selectedResource.title}</p>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => updateResourceStatus(selectedResource._id, 'active')}
                className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border text-left text-sm sm:text-base transition-colors ${
                  selectedResource.status === 'active'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="font-medium text-green-700 dark:text-green-400">{t.dashboard.activate}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.listingWillBeVisible}</p>
              </button>
              <button
                onClick={() => updateResourceStatus(selectedResource._id, 'inactive')}
                className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border text-left text-sm sm:text-base transition-colors ${
                  selectedResource.status === 'inactive'
                    ? 'border-gray-500 bg-gray-100 dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">{t.dashboard.deactivate || 'Deaktiviraj'}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.listingWillNotBeShown || 'Oglas neće biti vidljiv'}</p>
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t.dashboard.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Portal */}
      {openDropdownId && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]"
          style={{
            top: dropdownPosition.top,
            left: Math.max(8, dropdownPosition.left),
          }}
        >
          {/* View Listing */}
          <Link
            to={`/resources/${resources.find(r => r._id === openDropdownId?.replace('desktop-', ''))?.slug || ''}`}
            target="_blank"
            onClick={() => { setOpenDropdownId(null); setDropdownPosition(null); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <span>{t.dashboard.viewListing || 'Pogledaj'}</span>
          </Link>
          {/* Edit */}
          <Link
            to={`/dashboard/edit-listing/${openDropdownId?.replace('desktop-', '')}`}
            onClick={() => { setOpenDropdownId(null); setDropdownPosition(null); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span>{t.dashboard.edit}</span>
          </Link>
          {/* Change Status */}
          <button
            onClick={() => {
              const resource = resources.find(r => r._id === openDropdownId?.replace('desktop-', ''));
              if (resource) {
                setSelectedResource(resource);
                setIsModalOpen(true);
              }
              setOpenDropdownId(null);
              setDropdownPosition(null);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>{t.dashboard.changeStatus || 'Promeni status'}</span>
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-2 mx-3"></div>
          {/* Delete */}
          <button
            onClick={() => {
              const resourceId = openDropdownId?.replace('desktop-', '');
              if (resourceId) deleteResource(resourceId);
              setOpenDropdownId(null);
              setDropdownPosition(null);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <span>{t.dashboard.delete}</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
