import { useState } from 'react';
import { useAuth } from '../../context';

export default function DashboardSettings() {
  const { user, updateUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const result = await response.json();

      if (result.success) {
        updateUser(result.data);
        setSuccess('Profil uspešno ažuriran');
      } else {
        setError(result.message || 'Greška pri ažuriranju');
      }
    } catch (err) {
      setError('Greška pri povezivanju sa serverom');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Lozinke se ne poklapaju');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Lozinka uspešno promenjena');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(result.message || 'Greška pri promeni lozinke');
      }
    } catch (err) {
      setError('Greška pri povezivanju sa serverom');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'profile', 
      label: 'Profil', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'security', 
      label: 'Sigurnost', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    { 
      id: 'notifications', 
      label: 'Obaveštenja', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Podešavanja</h1>
        <p className="text-gray-500 dark:text-gray-400">Upravljajte vašim nalogom</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#e85d45] text-[#e85d45]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Informacije o profilu</h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ime
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prezime
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#e85d45] hover:bg-[#d54d35] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Čuvanje...' : 'Sačuvaj promene'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Promena lozinke</h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trenutna lozinka
              </label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nova lozinka
              </label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Potvrdi novu lozinku
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#e85d45] hover:bg-[#d54d35] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Čuvanje...' : 'Promeni lozinku'}
            </button>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Podešavanja obaveštenja</h2>
          
          <div className="space-y-4">
            {[
              { id: 'email_messages', label: 'Email obaveštenja za poruke', description: 'Primajte email kada dobijete novu poruku' },
              { id: 'email_favorites', label: 'Obaveštenja za omiljene', description: 'Primajte email kada neko doda vaš oglas u omiljene' },
              { id: 'email_views', label: 'Izveštaji o pregledima', description: 'Nedeljni izveštaj o pregledima vaših oglasa' },
              { id: 'push_messages', label: 'Push obaveštenja', description: 'Primajte push obaveštenja u pregledaču' },
            ].map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-[#e85d45] peer-focus:ring-2 peer-focus:ring-[#e85d45]/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
