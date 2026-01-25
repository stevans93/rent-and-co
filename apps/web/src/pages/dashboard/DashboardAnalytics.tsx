import { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AnalyticsData {
  totalViews: number;
  totalFavorites: number;
  totalListings: number;
  totalInquiries: number;
  viewsChange: number;
  favoritesChange: number;
  topListings: {
    _id: string;
    title: string;
    views: number;
    favorites: number;
  }[];
  viewsByDay: { date: string; views: number }[];
}

export default function DashboardAnalytics() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/analytics?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const result = await response.json();
        
        if (result.success) {
          setAnalytics(result.data);
        } else {
          setError(result.message || t.toasts.loadError || 'Greška pri učitavanju analitike');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(t.errors.serverError || 'Server nije dostupan');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [token, period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85d45]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div>{t.dashboard.noDataAvailable}</div>
    );
  }

  const maxViews = Math.max(...analytics.viewsByDay.map(d => d.views));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.analytics}</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.dashboard.trackPerformance}</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-1.5 sm:gap-2">
          {[
            { value: '7d', label: t.dashboard.days7 },
            { value: '30d', label: t.dashboard.days30 },
            { value: '90d', label: t.dashboard.days90 },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-[#e85d45] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-3 sm:p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{t.dashboard.totalViews}</p>
            <span className="text-green-500 text-xs sm:text-sm">+{analytics.viewsChange}%</span>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalViews.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-3 sm:p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{t.dashboard.favorites}</p>
            <span className="text-green-500 text-xs sm:text-sm">+{analytics.favoritesChange}</span>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalFavorites}</p>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-3 sm:p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 truncate">{t.dashboard.activeListings}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalListings}</p>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-3 sm:p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 truncate">{t.dashboard.inquiries}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalInquiries}</p>
        </div>
      </div>

      {/* Views Chart */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-3 sm:p-6 border border-gray-100 dark:border-gray-800 mb-4 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{t.dashboard.viewsByDay}</h2>
        <div className="flex items-end justify-between h-32 sm:h-48 gap-1 sm:gap-2">
          {analytics.viewsByDay.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-[#e85d45]/20 rounded-t-lg hover:bg-[#e85d45]/30 transition-colors relative group"
                style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: '16px' }}
              >
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-[#e85d45] rounded-t-lg transition-all"
                  style={{ height: `${(day.views / maxViews) * 100}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                  {day.views} {t.dashboard.viewsCount}
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                {[t.dashboard.sunday, t.dashboard.monday, t.dashboard.tuesday, t.dashboard.wednesday, t.dashboard.thursday, t.dashboard.friday, t.dashboard.saturday][new Date(day.date).getDay()].slice(0, 3)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Listings */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-3 sm:p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{t.dashboard.topListings}</h2>
        <div className="space-y-3 sm:space-y-4">
          {analytics.topListings.map((listing, index) => (
            <div key={listing._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-[#252525] rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-sm sm:text-lg font-bold text-gray-400 w-5 sm:w-6">#{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">{listing.title}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {listing.views} {t.dashboard.viewsCount} · {listing.favorites} {t.dashboard.favoritesCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-7 sm:ml-0">
                <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#e85d45] rounded-full"
                    style={{ width: `${(listing.views / analytics.totalViews) * 100}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-10 sm:w-12 text-right">
                  {Math.round((listing.views / analytics.totalViews) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
