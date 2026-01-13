import { useState } from 'react';

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

const plans: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Osnovni',
    price: 0,
    period: 'mesečno',
    features: [
      'Do 3 aktivna oglasa',
      'Osnovne statistike',
      'Email podrška',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1990,
    period: 'mesečno',
    features: [
      'Do 15 aktivnih oglasa',
      'Napredne statistike',
      'Prioritetna podrška',
      'Istaknuti oglasi',
      'Bez reklama',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'Biznis',
    price: 4990,
    period: 'mesečno',
    features: [
      'Neograničen broj oglasa',
      'Premium statistike',
      '24/7 podrška',
      'API pristup',
      'Verifikovan profil',
      'Prioritet u pretrazi',
    ],
  },
];

const mockTransactions: Transaction[] = [
  { id: '1', date: '2026-01-10', description: 'Pro paket - januar', amount: 1990, status: 'completed' },
  { id: '2', date: '2025-12-10', description: 'Pro paket - decembar', amount: 1990, status: 'completed' },
  { id: '3', date: '2025-11-10', description: 'Pro paket - novembar', amount: 1990, status: 'completed' },
];

export default function DashboardPayments() {
  const [currentPlan] = useState('pro');
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      completed: 'Uspešno',
      pending: 'Na čekanju',
      failed: 'Neuspešno',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plaćanja</h1>
        <p className="text-gray-500 dark:text-gray-400">Upravljajte pretplatom i pregledajte istoriju plaćanja</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-[#e85d45] to-[#ff7b5a] rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm">Vaš trenutni paket</p>
            <h2 className="text-2xl font-bold">Pro</h2>
            <p className="text-white/80">Sledeća naplata: 10. februar 2026.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white text-[#e85d45] rounded-lg font-medium hover:bg-white/90 transition-colors">
              Upravljaj pretplatom
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'plans'
              ? 'text-[#e85d45] border-[#e85d45]'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Paketi
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'text-[#e85d45] border-[#e85d45]'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Istorija plaćanja
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-[#1a1a1a] rounded-xl border-2 p-6 relative ${
                plan.popular
                  ? 'border-[#e85d45]'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e85d45] text-white text-xs px-3 py-1 rounded-full font-medium">
                  Najpopularniji
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price === 0 ? 'Besplatno' : `${plan.price.toLocaleString()} RSD`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
                  )}
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-[#e85d45] text-white hover:bg-[#d54d35]'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? 'Trenutni paket' : 'Izaberi'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Datum</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Opis</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Iznos</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Račun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(transaction.date).toLocaleDateString('sr-RS')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.amount.toLocaleString()} RSD
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#e85d45] hover:text-[#d54d35] text-sm font-medium">
                      Preuzmi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mockTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Nema istorije plaćanja</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Načini plaćanja</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ističe 12/27</p>
            </div>
          </div>
          <button className="text-[#e85d45] hover:text-[#d54d35] text-sm font-medium">
            Izmeni
          </button>
        </div>
        <button className="mt-4 text-[#e85d45] hover:text-[#d54d35] text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Dodaj novi način plaćanja
        </button>
      </div>
    </div>
  );
}
