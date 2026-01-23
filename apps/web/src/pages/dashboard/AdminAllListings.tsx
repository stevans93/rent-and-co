import { useState, useEffect } from 'react';
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
  status: 'active' | 'pending' | 'rejected';
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

export default function AdminAllListings() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    fetchResources();
  }, [statusFilter, currentPage, perPage]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
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

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.ownerId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t.dashboard.active;
      case 'pending':
        return t.dashboard.pending;
      case 'rejected':
        return t.dashboard.rejected;
      default:
        return status;
    }
  };

  // Stats
  const stats = {
    total: pagination.total,
    active: resources.filter(r => r.status === 'active').length,
    pending: resources.filter(r => r.status === 'pending').length,
    rejected: resources.filter(r => r.status === 'rejected').length,
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.listingsManagement}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t.dashboard.allListings}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-colors ${
            statusFilter === 'all' 
              ? 'bg-[#e85d45]/5 border-[#e85d45] dark:bg-[#e85d45]/10' 
              : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.allStatuses}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </button>
        <button
          onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-colors ${
            statusFilter === 'active' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
              : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.active}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </button>
        <button
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-colors ${
            statusFilter === 'pending' 
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' 
              : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.pending}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </button>
        <button
          onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-colors ${
            statusFilter === 'rejected' 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
              : 'bg-white dark:bg-[#1e1e1e] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.rejected}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
        </button>
      </div>

      {/* Search and Per Page */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t.dashboard.searchListings}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
            />
          </div>
          
          {/* Per Page */}
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
          >
            <option value={5}>5 {t.dashboard.perPage}</option>
            <option value={10}>10 {t.dashboard.perPage}</option>
            <option value={15}>15 {t.dashboard.perPage}</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.listing}</th>
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
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/resources/${resource.slug}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-[#e85d45] line-clamp-1"
                        >
                          {resource.title}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{resource.categoryId?.name}</p>
                      </div>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedResource(resource);
                          setIsModalOpen(true);
                        }}
                        className="text-[#e85d45] hover:text-[#d54d35] text-sm"
                      >
                        {t.dashboard.status}
                      </button>
                      <button
                        onClick={() => deleteResource(resource._id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        {t.dashboard.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">{t.dashboard.noListingsFound}</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
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
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
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
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.dashboard.next}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Modal */}
      {isModalOpen && selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.dashboard.changeListingStatus}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedResource.title}</p>
            <div className="space-y-3">
              <button
                onClick={() => updateResourceStatus(selectedResource._id, 'active')}
                className={`w-full py-3 px-4 rounded-lg border text-left transition-colors ${
                  selectedResource.status === 'active'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="font-medium text-green-700 dark:text-green-400">{t.dashboard.activate}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.listingWillBeVisible}</p>
              </button>
              <button
                onClick={() => updateResourceStatus(selectedResource._id, 'pending')}
                className={`w-full py-3 px-4 rounded-lg border text-left transition-colors ${
                  selectedResource.status === 'pending'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="font-medium text-yellow-700 dark:text-yellow-400">{t.dashboard.pendingReview}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.listingAwaitingReview}</p>
              </button>
              <button
                onClick={() => {
                  const reason = prompt(t.dashboard.rejectionReason);
                  if (reason) {
                    updateResourceStatus(selectedResource._id, 'rejected', reason);
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg border text-left transition-colors ${
                  selectedResource.status === 'rejected'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="font-medium text-red-700 dark:text-red-400">{t.dashboard.reject}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.listingWillNotBeShown}</p>
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
    </div>
  );
}
