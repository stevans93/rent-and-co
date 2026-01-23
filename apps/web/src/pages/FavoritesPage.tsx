import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, useToast, useAuth } from '../context';
import { Button } from '../components';
import { SEO, SEOConfigs } from '../components/SEO';

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
}

export default function FavoritesPage() {
  const { t } = useLanguage();
  const { token, user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [favorites, setFavorites] = useState<FavoriteResource[]>([]);
  
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, token]);

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
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const handleRemoveFavorite = async (resourceId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/favorites/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setFavorites(prev => prev.filter(f => f._id !== resourceId));
        success('Uklonjeno', 'Oglas je uklonjen iz omiljenih');
      } else {
        showError('Greška', result.message || 'Nije moguće ukloniti oglas');
      }
    } catch (err) {
      showError('Greška', 'Došlo je do greške');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SEO {...SEOConfigs.favorites} />
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Morate biti prijavljeni</h2>
          <p className="text-gray-500 mb-6">
            Prijavite se da biste videli svoje omiljene oglase
          </p>
          <Link to="/login">
            <Button size="lg">{t.nav.login || 'Prijavi se'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO {...SEOConfigs.favorites} />
      
      <h1 className="text-3xl font-bold mb-2">{t.favorites.title}</h1>
      <p className="text-gray-500 mb-8">{t.favorites.breadcrumb}</p>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold mb-2">{t.favorites.empty}</h2>
          <p className="text-gray-500 mb-6">{t.favorites.emptyDescription}</p>
          <Link to="/search">
            <Button size="lg">{t.favorites.searchResources}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(resource => (
            <div 
              key={resource._id} 
              className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <Link to={`/resources/${resource.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                {resource.images && resource.images.length > 0 ? (
                  <img 
                    src={getImageUrl(resource.images[0].url)} 
                    alt={resource.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Category badge */}
                <span className="absolute top-3 left-3 text-xs font-medium bg-[#e85d45] text-white px-2 py-1 rounded">
                  {resource.categoryId?.name || 'Kategorija'}
                </span>
                {/* Favorite button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFavorite(resource._id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Ukloni iz omiljenih"
                >
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </Link>

              {/* Content */}
              <div className="p-4">
                <Link to={`/resources/${resource.slug}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-[#e85d45] transition-colors">
                    {resource.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {resource.location.city}{resource.location.address && `, ${resource.location.address}`}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#e85d45]">
                    {resource.currency === 'EUR' ? '€' : resource.currency}{resource.pricePerDay}
                    <span className="text-sm font-normal text-gray-500">/dan</span>
                  </span>
                  <Link 
                    to={`/resources/${resource.slug}`}
                    className="text-sm text-[#e85d45] hover:underline"
                  >
                    Pogledaj →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
