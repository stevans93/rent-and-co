import { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context';

// Will be used when real API is connected
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // Simulated data - will be replaced with real API call
    setAnalytics({
      totalViews: 1234,
      totalFavorites: 56,
      totalListings: 12,
      totalInquiries: 23,
      viewsChange: 15,
      favoritesChange: 8,
      topListings: [
        { _id: '1', title: 'Luksuzan stan u centru', views: 234, favorites: 12 },
        { _id: '2', title: 'Moderni kancelarijski prostor', views: 156, favorites: 8 },
        { _id: '3', title: 'Porodična kuća sa baštom', views: 89, favorites: 5 },
      ],
      viewsByDay: [
        { date: '2024-01-01', views: 45 },
        { date: '2024-01-02', views: 52 },
        { date: '2024-01-03', views: 38 },
        { date: '2024-01-04', views: 67 },
        { date: '2024-01-05', views: 41 },
        { date: '2024-01-06', views: 55 },
        { date: '2024-01-07', views: 48 },
      ],
    });
  }, [token, period]);

  if (!analytics) {
    return (
      <div>{t.dashboard.noDataAvailable}</div>
    );
  }

  const maxViews = Math.max(...analytics.viewsByDay.map(d => d.views));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.analytics}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.dashboard.trackPerformance}</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {[
            { value: '7d', label: t.dashboard.days7 },
            { value: '30d', label: t.dashboard.days30 },
            { value: '90d', label: t.dashboard.days90 },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.totalViews}</p>
            <span className="text-green-500 text-sm">+{analytics.viewsChange}%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalViews.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.favorites}</p>
            <span className="text-green-500 text-sm">+{analytics.favoritesChange}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalFavorites}</p>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t.dashboard.activeListings}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalListings}</p>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t.dashboard.inquiries}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalInquiries}</p>
        </div>
      </div>

      {/* Views Chart */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t.dashboard.viewsByDay}</h2>
        <div className="flex items-end justify-between h-48 gap-2">
          {analytics.viewsByDay.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-[#e85d45]/20 rounded-t-lg hover:bg-[#e85d45]/30 transition-colors relative group"
                style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: '20px' }}
              >
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-[#e85d45] rounded-t-lg transition-all"
                  style={{ height: `${(day.views / maxViews) * 100}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {day.views} {t.dashboard.viewsCount}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {[t.dashboard.sunday, t.dashboard.monday, t.dashboard.tuesday, t.dashboard.wednesday, t.dashboard.thursday, t.dashboard.friday, t.dashboard.saturday][new Date(day.date).getDay()]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Listings */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t.dashboard.topListings}</h2>
        <div className="space-y-4">
          {analytics.topListings.map((listing, index) => (
            <div key={listing._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{listing.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {listing.views} {t.dashboard.viewsCount} · {listing.favorites} {t.dashboard.favoritesCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#e85d45] rounded-full"
                    style={{ width: `${(listing.views / analytics.totalViews) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
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
