/**
 * DashboardLoader - Simple spinner loader for dashboard pages
 * Used on: DashboardOverview, MyListings, AddListing, EditListing, DashboardFavorites, 
 *          DashboardAnalytics, DashboardPayments, DashboardSettings, DashboardHelp, AdminUsers, AdminAllListings
 * 
 * TESTING: Duration set to 3 seconds - change back to 800ms for production
 */
import { useLanguage } from '../../context';

export const DASHBOARD_LOADER_DURATION = 3000; // 3 seconds for testing

export default function DashboardLoader() {
  const { t } = useLanguage();
  
  return (
    <div className="w-full min-h-[calc(100vh-7rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-10 h-10 border-4 border-[#e85d45] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.common.loading}</p>
      </div>
    </div>
  );
}
