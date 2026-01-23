import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, useToast, useAuth } from '../../context';

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
  
  const [favorites, setFavorites] = useState<FavoriteResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [removeModal, setRemoveModal] = useState<{ open: boolean; item: FavoriteResource | null }>({ open: false, item: null });
  const [removing, setRemoving] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  const fetchFavorites = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setFavorites(result.data);
      } else {
        showError('Greška', 'Nije moguće učitati omiljene oglase');
      }
    } catch (err) {
      showError('Greška', 'Došlo je do greške prilikom učitavanja');
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(favorites.map(f => f.categoryId?.name).filter(Boolean))];
  }, [favorites]);

  // Filter favorites
  const filteredFavorites = useMemo(() => {
    let result = [...favorites];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.title.toLowerCase().includes(query) ||
        f.location.city.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter(f => f.categoryId?.name === selectedCategory);
    }

    return result;
  }, [favorites, searchQuery, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredFavorites.length / perPage);
  const paginatedFavorites = filteredFavorites.slice((currentPage - 1) * perPage, currentPage * perPage);

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
        setFavorites(prev => prev.filter(f => f._id !== removeModal.item?._id));
        setRemoveModal({ open: false, item: null });
        success('Uklonjeno', 'Oglas je uklonjen iz omiljenih');
      } else {
        showError('Greška', result.message || 'Nije moguće ukloniti oglas');
      }
    } catch (err) {
      showError('Greška', 'Došlo je do greške');
    } finally {
      setRemoving(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Da li ste sigurni da želite da uklonite sve omiljene oglase?')) return;
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
      info('Obrisano', 'Svi omiljeni oglasi su uklonjeni');
    } catch (err) {
      showError('Greška', 'Došlo je do greške prilikom brisanja');
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.favorites || 'Omiljeni oglasi'}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {favorites.length} {favorites.length === 1 ? 'sačuvan oglas' : 'sačuvanih oglasa'}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2 self-start"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Obriši sve
          </button>
        )}
      </div>

      {/* Filters */}
      {favorites.length > 0 && (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Pretraži omiljene..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e85d45]/50 focus:border-[#e85d45]"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/50 focus:border-[#e85d45]"
            >
              <option value="">Sve kategorije</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Favorites Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {searchQuery || selectedCategory ? `Pronađeno (${filteredFavorites.length})` : `Svi omiljeni (${favorites.length})`}
          </h2>
          
          {favorites.length > 0 && (
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
            >
              <option value={5}>5 {t.dashboard.perPage || 'po stranici'}</option>
              <option value={10}>10 {t.dashboard.perPage || 'po stranici'}</option>
              <option value={15}>15 {t.dashboard.perPage || 'po stranici'}</option>
            </select>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nemate omiljenih oglasa</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Pretražite oglase i kliknite na srce da biste sačuvali omiljene oglase.
            </p>
            <Link
              to="/search"
              className="bg-[#e85d45] hover:bg-[#d54d35] text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Pretraži oglase
            </Link>
          </div>
        ) : paginatedFavorites.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Nema rezultata za trenutne filtere.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-[#e85d45] hover:underline"
            >
              Resetuj filtere
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#252525]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Oglas</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Kategorija</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Cena</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Lokacija</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedFavorites.map((item) => (
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
                          <p className="text-xs text-gray-500">{item.status === 'active' ? 'Aktivan' : item.status}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium text-[#e85d45] bg-[#e85d45]/10 px-2 py-1 rounded">
                        {item.categoryId?.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">
                      {item.currency === 'EUR' ? '€' : item.currency}{item.pricePerDay}/dan
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                      {item.location.city}{item.location.address && `, ${item.location.address}`}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/resources/${item.slug}`}
                          className="p-2 text-gray-500 hover:text-[#e85d45] hover:bg-[#e85d45]/10 rounded-lg transition-colors"
                          title="Pogledaj oglas"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setRemoveModal({ open: true, item })}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Ukloni iz omiljenih"
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.dashboard.showing || 'Prikazano'} {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, filteredFavorites.length)} {t.dashboard.of || 'od'} {filteredFavorites.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.dashboard.previous || 'Prethodna'}
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.dashboard.next || 'Sledeća'}
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ukloni iz omiljenih</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Da li ste sigurni da želite da uklonite "{removeModal.item?.title}" iz omiljenih?
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
                Ukloni
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
