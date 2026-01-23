import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface DashboardStats {
  activeListings: number;
  totalViews: number;
  favorites: number;
  conversionRate: number;
}

interface ActivityItem {
  type: string;
  title: string;
  resourceTitle: string;
  resourceSlug: string;
  senderName: string;
  createdAt: string;
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  change, 
  changeLabel,
  iconBg = 'bg-orange-50 dark:bg-orange-900/20',
  iconColor = 'text-[#e85d45]'
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeLabel?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className={change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>{change}</span>
              {changeLabel && ` ${changeLabel}`}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ 
  title, 
  description, 
  time 
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <p className="text-sm text-gray-400 whitespace-nowrap ml-4">{time}</p>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({
  icon,
  title,
  description,
  to,
  iconBg = 'bg-orange-50 dark:bg-orange-900/20',
  iconColor = 'text-[#e85d45]'
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Link 
      to={to}
      className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:border-[#e85d45] dark:hover:border-[#e85d45] transition-colors group"
    >
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-full ${iconBg} mb-4 group-hover:scale-110 transition-transform`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

export default function DashboardOverview() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    totalViews: 0,
    favorites: 0,
    conversionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`${API_URL}/user/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          setStats(result.data.stats);
          setRecentActivity(result.data.recentActivity);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${t.dashboard.minutesAgo}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t.dashboard.hoursAgo}`;
    } else {
      return `${diffDays} ${t.dashboard.daysAgo || 'dana'}`;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.welcomeBack}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t.dashboard.activityOverview}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          label={t.dashboard.activeListings}
          value={isLoading ? '-' : stats.activeListings}
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          label={t.dashboard.totalViews}
          value={isLoading ? '-' : stats.totalViews.toLocaleString()}
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          label={t.dashboard.favorites}
          value={isLoading ? '-' : stats.favorites}
        />
        <StatCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          label={t.dashboard.conversion}
          value={isLoading ? '-' : `${stats.conversionRate}%`}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.dashboard.recentActivity}</h2>
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-[#e85d45] rounded-full animate-spin"></div>
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t.dashboard.noRecentActivity || 'Nema nedavne aktivnosti'}</p>
          ) : (
            recentActivity.map((activity, index) => (
              <ActivityItem 
                key={index} 
                title={activity.type === 'new_message' ? t.dashboard.newMessage : activity.title}
                description={`${activity.resourceTitle} - ${activity.senderName}`}
                time={formatTimeAgo(activity.createdAt)}
              />
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <QuickActionCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
          title={t.dashboard.addNewListing}
          description={t.dashboard.publishProperty}
          to="/dashboard/add-listing"
        />
        <QuickActionCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          title={t.dashboard.viewStatistics}
          description={t.dashboard.detailedReports}
          to="/dashboard/analytics"
        />
        <QuickActionCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          title={t.dashboard.manageListings}
          description={t.dashboard.editAndUpdate}
          to="/dashboard/favorites"
        />
      </div>
    </div>
  );
}
