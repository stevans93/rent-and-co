import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useLanguage, useToast } from '../../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

// Country codes for phone input with SVG flags
const countryCodes = [
  { code: 'RS', dialCode: '+381' },
  { code: 'ME', dialCode: '+382' },
  { code: 'BA', dialCode: '+387' },
  { code: 'RO', dialCode: '+40' },
  { code: 'DE', dialCode: '+49' },
  { code: 'FR', dialCode: '+33' },
  { code: 'IT', dialCode: '+39' },
  { code: 'AT', dialCode: '+43' },
  { code: 'CH', dialCode: '+41' },
];

// Flag SVG components
const FlagIcon = ({ code, className = "w-5 h-4" }: { code: string; className?: string }) => {
  const flags: Record<string, JSX.Element> = {
    RS: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#0c4076" width="640" height="480"/>
        <rect fill="#c6363c" y="160" width="640" height="160"/>
        <rect fill="#fff" y="160" width="640" height="160" transform="translate(0,-160)"/>
      </svg>
    ),
    ME: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#c40308" width="640" height="480"/>
        <rect fill="#d4af3a" x="20" y="20" width="600" height="440" rx="0"/>
      </svg>
    ),
    BA: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#002395" width="640" height="480"/>
        <polygon fill="#fecb00" points="160,0 480,480 160,480"/>
        <g fill="#fff">
          <polygon points="180,60 195,105 240,105 205,135 220,180 180,150 140,180 155,135 120,105 165,105"/>
          <polygon points="220,140 235,185 280,185 245,215 260,260 220,230 180,260 195,215 160,185 205,185"/>
          <polygon points="260,220 275,265 320,265 285,295 300,340 260,310 220,340 235,295 200,265 245,265"/>
          <polygon points="300,300 315,345 360,345 325,375 340,420 300,390 260,420 275,375 240,345 285,345"/>
        </g>
      </svg>
    ),
    RO: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#002b7f" width="213.33" height="480"/>
        <rect fill="#fcd116" x="213.33" width="213.33" height="480"/>
        <rect fill="#ce1126" x="426.67" width="213.33" height="480"/>
      </svg>
    ),
    DE: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#000" width="640" height="160"/>
        <rect fill="#d00" y="160" width="640" height="160"/>
        <rect fill="#ffce00" y="320" width="640" height="160"/>
      </svg>
    ),
    FR: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#002395" width="213.33" height="480"/>
        <rect fill="#fff" x="213.33" width="213.33" height="480"/>
        <rect fill="#ed2939" x="426.67" width="213.33" height="480"/>
      </svg>
    ),
    IT: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#009246" width="213.33" height="480"/>
        <rect fill="#fff" x="213.33" width="213.33" height="480"/>
        <rect fill="#ce2b37" x="426.67" width="213.33" height="480"/>
      </svg>
    ),
    AT: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#ed2939" width="640" height="160"/>
        <rect fill="#fff" y="160" width="640" height="160"/>
        <rect fill="#ed2939" y="320" width="640" height="160"/>
      </svg>
    ),
    CH: (
      <svg className={className} viewBox="0 0 640 480">
        <rect fill="#d52b1e" width="640" height="480"/>
        <rect fill="#fff" x="170" y="200" width="300" height="80"/>
        <rect fill="#fff" x="280" y="90" width="80" height="300"/>
      </svg>
    ),
  };
  return flags[code] || null;
};

// Parse phone number to extract country code
const parsePhoneNumber = (phone: string) => {
  if (!phone) return { countryCode: 'RS', number: '' };
  
  // Find matching country code
  for (const country of countryCodes) {
    if (phone.startsWith(country.dialCode)) {
      return {
        countryCode: country.code,
        number: phone.slice(country.dialCode.length).trim(),
      };
    }
  }
  
  // Default to Serbia if no match
  return { countryCode: 'RS', number: phone.replace(/^\+?\d{1,3}\s?/, '') };
};

// Format phone number with country code
const formatPhoneNumber = (countryCode: string, number: string) => {
  const country = countryCodes.find(c => c.code === countryCode);
  if (!country || !number) return '';
  return `${country.dialCode} ${number}`;
};

export default function DashboardSettings() {
  const { user, updateUser, token } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const [profile, setProfile] = useState(() => {
    const parsed = parsePhoneNumber(user?.phone || '');
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneCountry: parsed.countryCode,
      phoneNumber: parsed.number,
      country: (user as any)?.country || 'RS',
      city: user?.city || '',
      address: user?.address || '',
    };
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: (user as any)?.emailNotifications ?? true,
    marketingEmails: (user as any)?.marketingEmails ?? false,
  });

  // Close phone dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target as Node)) {
        setPhoneDropdownOpen(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update state when user changes
  useEffect(() => {
    if (user) {
      const parsed = parsePhoneNumber(user.phone || '');
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneCountry: parsed.countryCode,
        phoneNumber: parsed.number,
        country: (user as any).country || 'RS',
        city: user.city || '',
        address: user.address || '',
      });
      setNotifications({
        emailNotifications: (user as any).emailNotifications ?? true,
        marketingEmails: (user as any).marketingEmails ?? false,
      });
    }
  }, [user]);

  const selectedCountry = countryCodes.find(c => c.code === profile.phoneCountry) || countryCodes[0];
  const selectedProfileCountry = countryCodes.find(c => c.code === profile.country) || countryCodes[0];

  // Get translated country name
  const getCountryName = (code: string) => {
    const names = (t.dashboard as any).countryNames;
    return names?.[code] || code;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: formatPhoneNumber(profile.phoneCountry, profile.phoneNumber),
        country: profile.country,
        city: profile.city,
        address: profile.address,
      };

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        updateUser(result.data);
        toast.success(t.dashboard.profileUpdated || 'Profil ažuriran', t.dashboard.profileUpdatedDesc || 'Vaš profil je uspešno ažuriran');
      } else {
        toast.error(t.toasts?.error || 'Greška', result.message || t.dashboard.errorUpdating);
      }
    } catch {
      toast.error(t.toasts?.error || 'Greška', t.dashboard.errorUpdating || 'Greška pri ažuriranju');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.warning(t.toasts?.warning || 'Upozorenje', t.dashboard.passwordsNoMatch || 'Lozinke se ne poklapaju');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.warning(t.toasts?.warning || 'Upozorenje', t.dashboard.passwordTooShort || 'Lozinka mora imati najmanje 6 karaktera');
      return;
    }

    setIsLoading(true);

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
        toast.success(t.dashboard.passwordChanged || 'Lozinka promenjena', t.dashboard.passwordChangedDesc || 'Vaša lozinka je uspešno promenjena');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(t.toasts?.error || 'Greška', result.message || t.dashboard.errorUpdating);
      }
    } catch {
      toast.error(t.toasts?.error || 'Greška', t.dashboard.errorUpdating || 'Greška pri ažuriranju');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      toast.error(t.toasts?.error || 'Greška', t.dashboard.invalidImageType || 'Dozvoljeni su samo JPEG, PNG i WebP formati');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.toasts?.error || 'Greška', t.dashboard.imageTooLarge || 'Slika ne sme biti veća od 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch(`${API_URL}/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        updateUser(result.data);
        toast.success(t.dashboard.avatarUploaded || 'Slika postavljena', t.dashboard.avatarUploadedDesc || 'Profilna slika je uspešno postavljena');
      } else {
        toast.error(t.toasts?.error || 'Greška', result.message || 'Greška pri postavljanju slike');
      }
    } catch {
      toast.error(t.toasts?.error || 'Greška', 'Greška pri postavljanju slike');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.profileImage) return;

    setUploadingAvatar(true);

    try {
      const response = await fetch(`${API_URL}/users/me/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        updateUser(result.data);
        toast.success(t.dashboard.avatarDeleted || 'Slika uklonjena', t.dashboard.avatarDeletedDesc || 'Profilna slika je uklonjena');
      } else {
        toast.error(t.toasts?.error || 'Greška', result.message);
      }
    } catch {
      toast.error(t.toasts?.error || 'Greška', 'Greška pri brisanju slike');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleNotificationChange = async (key: 'emailNotifications' | 'marketingEmails', value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);

    try {
      const response = await fetch(`${API_URL}/users/me/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });

      const result = await response.json();

      if (result.success) {
        updateUser(result.data);
      } else {
        // Revert on error
        setNotifications(notifications);
        toast.error(t.toasts?.error || 'Greška', result.message);
      }
    } catch {
      // Revert on error
      setNotifications(notifications);
      toast.error(t.toasts?.error || 'Greška', 'Greška pri ažuriranju podešavanja');
    }
  };

  const tabs = [
    { 
      id: 'profile', 
      label: t.dashboard.profile, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'security', 
      label: t.dashboard.security, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    { 
      id: 'notifications', 
      label: t.dashboard.notificationsSettings, 
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
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.settings}</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.dashboard.manageYourAccount || 'Upravljajte svojim nalogom'}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'border-[#e85d45] text-[#e85d45]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="hidden sm:block">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
          {/* Profile Image Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.dashboard.profileImage || 'Profilna slika'}</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.profileImage ? (
                  <img 
                    src={getImageUrl(user.profileImage)} 
                    alt="Profile" 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 text-sm bg-[#e85d45] hover:bg-[#d54d35] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {t.dashboard.uploadImage || 'Postavi sliku'}
                </button>
                {user?.profileImage && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {t.dashboard.removeImage || 'Ukloni sliku'}
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t.dashboard.imageRequirements || 'JPG, PNG ili WebP. Maksimalno 5MB.'}
            </p>
          </div>

          {/* Profile Form */}
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{t.dashboard.personalInfo || 'Lični podaci'}</h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  {t.dashboard.firstName}
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  {t.dashboard.lastName}
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t.dashboard.email}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t.dashboard.emailCannotBeChanged || 'Email adresa ne može da se menja'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t.dashboard.phone}
              </label>
              <div className="flex gap-2">
                {/* Custom Country Dropdown */}
                <div className="relative" ref={phoneDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                    className="flex items-center gap-2 w-[180px] sm:w-[200px] px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    <span className="flex-shrink-0 rounded overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600">
                      <FlagIcon code={selectedCountry.code} className="w-6 h-4" />
                    </span>
                    <span className="flex-1 text-left text-xs text-gray-600 dark:text-gray-300 truncate">
                      {getCountryName(selectedCountry.code)}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {selectedCountry.dialCode}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${phoneDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {phoneDropdownOpen && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-[180px] sm:w-[200px] bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setProfile({ ...profile, phoneCountry: country.code });
                            setPhoneDropdownOpen(false);
                          }}
                          className={`flex items-center gap-2 w-full px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors ${
                            profile.phoneCountry === country.code ? 'bg-[#e85d45]/10 dark:bg-[#e85d45]/20' : ''
                          }`}
                        >
                          <span className="flex-shrink-0 rounded overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600">
                            <FlagIcon code={country.code} className="w-5 h-3.5" />
                          </span>
                          <span className={`flex-1 text-left text-xs truncate ${
                            profile.phoneCountry === country.code 
                              ? 'text-[#e85d45] font-medium' 
                              : 'text-gray-700 dark:text-gray-200'
                          }`}>
                            {getCountryName(country.code)}
                          </span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            profile.phoneCountry === country.code 
                              ? 'bg-[#e85d45] text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}>
                            {country.dialCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value.replace(/[^0-9\s]/g, '') })}
                  placeholder="61 123 4567"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                />
              </div>
            </div>

            {/* Country Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t.dashboard.country || 'Država'}
              </label>
              <div className="relative" ref={countryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  <span className="flex-shrink-0 rounded overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600">
                    <FlagIcon code={selectedProfileCountry.code} className="w-6 h-4" />
                  </span>
                  <span className="flex-1 text-left text-sm text-gray-900 dark:text-white">
                    {getCountryName(profile.country)}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Country Dropdown Menu */}
                {countryDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setProfile({ ...profile, country: country.code });
                          setCountryDropdownOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-[#333] transition-colors ${
                          profile.country === country.code ? 'bg-[#e85d45]/10 dark:bg-[#e85d45]/20' : ''
                        }`}
                      >
                        <span className="flex-shrink-0 rounded overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600">
                          <FlagIcon code={country.code} className="w-6 h-4" />
                        </span>
                        <span className={`flex-1 text-left text-sm ${
                          profile.country === country.code 
                            ? 'text-[#e85d45] font-medium' 
                            : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {getCountryName(country.code)}
                        </span>
                        {profile.country === country.code && (
                          <svg className="w-4 h-4 text-[#e85d45]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t.dashboard.city || 'Grad'}
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t.dashboard.address || 'Adresa'}
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-[#e85d45] hover:bg-[#d54d35] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? t.dashboard.saving : t.dashboard.saveChanges}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{t.dashboard.changePassword || 'Promena lozinke'}</h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t.dashboard.currentPassword}
              </label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t.dashboard.newPassword}
              </label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                {t.dashboard.confirmPassword}
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-[#e85d45] hover:bg-[#d54d35] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? t.dashboard.saving : (t.dashboard.changePassword || 'Promeni lozinku')}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t.dashboard.forgotPasswordQuestion || 'Zaboravili ste lozinku?'}
            </p>
            <Link 
              to="/forgot-password" 
              className="text-[#e85d45] hover:text-[#d54d35] text-sm font-medium transition-colors"
            >
              {t.dashboard.resetPasswordLink || 'Pošaljite link za resetovanje na vaš email'}
            </Link>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{t.dashboard.notificationsSettings}</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Email Notifications */}
            <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-[#252525] rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t.dashboard.emailNotifications}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t.dashboard.emailNotificationsDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.emailNotifications}
                  onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                />
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-[#e85d45] peer-focus:ring-2 peer-focus:ring-[#e85d45]/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            {/* Marketing Emails */}
            <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-[#252525] rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t.dashboard.marketingEmails}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t.dashboard.marketingEmailsDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.marketingEmails}
                  onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
                />
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-[#e85d45] peer-focus:ring-2 peer-focus:ring-[#e85d45]/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all after:shadow-sm peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
