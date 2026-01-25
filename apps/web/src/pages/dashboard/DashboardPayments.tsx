import { useState } from 'react';
import { useLanguage } from '../../context';

interface PaymentPlan {
  id: string;
  nameKey: string;
  price: number;
  periodKey: string;
  featureKeys: string[];
  popular?: boolean;
}

interface Transaction {
  id: string;
  date: string;
  planKey: string;
  monthKey: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

const plans: PaymentPlan[] = [
  {
    id: 'basic',
    nameKey: 'basicPlan',
    price: 0,
    periodKey: 'monthly',
    featureKeys: [
      'upTo3Listings',
      'basicStats',
      'emailSupport',
    ],
  },
  {
    id: 'pro',
    nameKey: 'proPlan',
    price: 1990,
    periodKey: 'monthly',
    featureKeys: [
      'upTo15Listings',
      'advancedStats',
      'prioritySupport',
      'featuredListings',
      'noAds',
    ],
    popular: true,
  },
  {
    id: 'business',
    nameKey: 'businessPlan',
    price: 4990,
    periodKey: 'monthly',
    featureKeys: [
      'unlimitedListings',
      'premiumStats',
      'support247',
      'apiAccess',
      'verifiedProfile',
      'searchPriority',
    ],
  },
];

const mockTransactions: Transaction[] = [
  { id: '1', date: '2026-01-10', planKey: 'pro', monthKey: 'january', amount: 1990, status: 'completed' },
  { id: '2', date: '2025-12-10', planKey: 'pro', monthKey: 'december', amount: 1990, status: 'completed' },
  { id: '3', date: '2025-11-10', planKey: 'pro', monthKey: 'november', amount: 1990, status: 'completed' },
];

export default function DashboardPayments() {
  const { t } = useLanguage();
  const [currentPlan] = useState('pro');
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');

  // Helper to get translated plan names
  const getPlanName = (nameKey: string) => {
    const names: Record<string, string> = {
      basicPlan: t.dashboard.basic,
      proPlan: t.dashboard.pro,
      businessPlan: t.dashboard.businessPlanName,
    };
    return names[nameKey] || nameKey;
  };

  // Helper to get translated features
  const getFeature = (featureKey: string) => {
    const features: Record<string, string> = {
      upTo3Listings: t.dashboard.upTo3Listings,
      basicStats: t.dashboard.basicStats,
      emailSupport: t.dashboard.emailSupport,
      upTo15Listings: t.dashboard.upTo15Listings,
      advancedStats: t.dashboard.advancedStats,
      prioritySupport: t.dashboard.prioritySupport,
      featuredListings: t.dashboard.featuredListings,
      noAds: t.dashboard.noAds,
      unlimitedListings: t.dashboard.unlimitedListings,
      premiumStats: t.dashboard.premiumStats,
      support247: t.dashboard.support247,
      apiAccess: t.dashboard.apiAccess,
      verifiedProfile: t.dashboard.verifiedProfile,
      searchPriority: t.dashboard.searchPriority,
    };
    return features[featureKey] || featureKey;
  };

  // Helper to get translated month name
  const getMonthName = (monthKey: string) => {
    const months: Record<string, string> = {
      january: t.dashboard.january,
      february: t.dashboard.february,
      march: t.dashboard.march,
      april: t.dashboard.april,
      may: t.dashboard.may,
      june: t.dashboard.june,
      july: t.dashboard.july,
      august: t.dashboard.august,
      september: t.dashboard.september,
      october: t.dashboard.october,
      november: t.dashboard.november,
      december: t.dashboard.december,
    };
    return months[monthKey] || monthKey;
  };

  // Helper to get transaction description
  const getTransactionDescription = (transaction: Transaction) => {
    const monthName = getMonthName(transaction.monthKey);
    return `${t.dashboard.proPackage} - ${monthName}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      completed: t.dashboard.completed,
      pending: t.dashboard.pendingStatus,
      failed: t.dashboard.failed,
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.payments}</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.dashboard.manageSubscription}</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-[#e85d45] to-[#ff7b5a] rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-white/80 text-xs sm:text-sm">{t.dashboard.currentPlan}</p>
            <h2 className="text-xl sm:text-2xl font-bold">{t.dashboard.pro}</h2>
            <p className="text-white/80 text-sm sm:text-base">{t.dashboard.planExpiresOn}: 10. {t.dashboard.february} 2026.</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm bg-white text-[#e85d45] rounded-lg font-medium hover:bg-white/90 transition-colors">
              {t.dashboard.manageSubscription}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-2 sm:pb-3 px-1 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'plans'
              ? 'text-[#e85d45] border-[#e85d45]'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t.dashboard.plans}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 sm:pb-3 px-1 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'text-[#e85d45] border-[#e85d45]'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t.dashboard.paymentHistory}
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-[#1a1a1a] rounded-xl border-2 p-4 sm:p-6 relative ${
                plan.popular
                  ? 'border-[#e85d45]'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e85d45] text-white text-xs px-3 py-1 rounded-full font-medium">
                  {t.dashboard.popular}
                </span>
              )}
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{getPlanName(plan.nameKey)}</h3>
                <div className="mt-2 sm:mt-3">
                  <span className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price === 0 ? t.dashboard.basic : `${plan.price.toLocaleString()} RSD`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400">/{t.dashboard.monthly}</span>
                  )}
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {plan.featureKeys.map((featureKey, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {getFeature(featureKey)}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-[#e85d45] text-white hover:bg-[#d54d35]'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? t.dashboard.currentPlanLabel : t.dashboard.selectPlan}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {mockTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getTransactionDescription(transaction)}</p>
                  {getStatusBadge(transaction.status)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{transaction.amount.toLocaleString()} RSD</p>
                  </div>
                  <button className="text-[#e85d45] hover:text-[#d54d35] text-sm font-medium">
                    {t.dashboard.download}
                  </button>
                </div>
              </div>
            ))}
            {mockTransactions.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">{t.dashboard.noDataAvailable}</p>
              </div>
            )}
          </div>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.date}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.transactionDescription}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.amount}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.transactionStatus}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {getTransactionDescription(transaction)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.amount.toLocaleString()} RSD
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#e85d45] hover:text-[#d54d35] text-sm font-medium">
                        {t.dashboard.download}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mockTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t.dashboard.noDataAvailable}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payment Methods */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{t.dashboard.cardInfo}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-6 sm:h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.dashboard.validThru} 12/27</p>
            </div>
          </div>
          <button className="text-[#e85d45] hover:text-[#d54d35] text-sm font-medium self-start sm:self-center">
            {t.dashboard.edit}
          </button>
        </div>
        <button className="mt-3 sm:mt-4 text-[#e85d45] hover:text-[#d54d35] text-sm font-medium flex items-center gap-2">
          <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t.dashboard.addNewPaymentMethod}
        </button>
      </div>
    </div>
  );
}
