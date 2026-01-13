import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../../context';

// SVG Icons as components for cleaner look
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  listings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  add: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  payments: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  help: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  allListings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  notification: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  ),
  menu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const sidebarLinks = [
  { to: '/dashboard', icon: icons.dashboard, label: 'Pregled', end: true },
  { to: '/dashboard/my-listings', icon: icons.listings, label: 'Moji oglasi' },
  { to: '/dashboard/add-listing', icon: icons.add, label: 'Dodaj oglas' },
  { to: '/dashboard/analytics', icon: icons.analytics, label: 'Analitika' },
  { to: '/dashboard/payments', icon: icons.payments, label: 'Plaćanja' },
  { to: '/dashboard/settings', icon: icons.settings, label: 'Podešavanja' },
  { to: '/dashboard/help', icon: icons.help, label: 'Uputstvo' },
];

const adminLinks = [
  { to: '/dashboard/users', icon: icons.users, label: 'Korisnici' },
  { to: '/dashboard/all-listings', icon: icons.allListings, label: 'Svi oglasi' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Mock notifications - will be replaced with real data
  const [notifications] = useState([
    { id: 1, title: 'Novi pregled', message: 'Vaš oglas "Luksuzan stan" ima novi pregled', time: 'pre 5 min', read: false },
    { id: 2, title: 'Dodat u omiljene', message: 'Korisnik je dodao vaš oglas u omiljene', time: 'pre 1 sat', read: false },
    { id: 3, title: 'Nova poruka', message: 'Imate novu poruku od korisnika', time: 'pre 2 sata', read: true },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [user, navigate]);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('dashboard-sidebar-open');
    if (savedState !== null) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('dashboard-sidebar-open', JSON.stringify(newState));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d45]"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212]">
      {/* Top Header */}
      <header className="bg-[#1a1a1a] text-white h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4">
        {/* Left: Logo + Toggle */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">
              RENT<span className="text-[#e85d45]">&</span>CO
            </span>
          </Link>
          
          {/* Desktop Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={sidebarOpen ? 'Zatvori sidebar' : 'Otvori sidebar'}
          >
            {sidebarOpen ? icons.chevronLeft : icons.chevronRight}
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isDark ? 'Svetli režim' : 'Tamni režim'}
          >
            {isDark ? icons.sun : icons.moon}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Obaveštenja"
            >
              {icons.notification}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#e85d45] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Obaveštenja</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-[#e85d45]">{unreadCount} nova</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Nema obaveštenja
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-[#e85d45]/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.read ? 'bg-[#e85d45]' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{notification.title}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{notification.message}</p>
                              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                    <button className="w-full text-center text-sm text-[#e85d45] hover:text-[#d54d35] font-medium">
                      Prikaži sva obaveštenja
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 ml-2">
            <div className="w-9 h-9 bg-[#e85d45] rounded-full flex items-center justify-center overflow-hidden text-white font-medium">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">{user.firstName[0]}{user.lastName[0]}</span>
              )}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
            aria-label={mobileMenuOpen ? 'Zatvori meni' : 'Otvori meni'}
          >
            {mobileMenuOpen ? icons.close : icons.menu}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 z-40 overflow-hidden
          ${mobileMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'lg:w-64' : 'lg:w-[72px]'}`}
        style={{ 
          transition: 'width 0.5s ease-in-out, transform 0.5s ease-in-out'
        }}
      >
        <nav className="flex flex-col h-full">
          {/* Main Navigation */}
          <div className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 pl-5 pr-4 py-3 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#e85d45] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
                title={!sidebarOpen ? link.label : undefined}
              >
                <span className="flex-shrink-0 w-5">{link.icon}</span>
                <span 
                  className="whitespace-nowrap overflow-hidden"
                  style={{ 
                    opacity: sidebarOpen ? 1 : 0,
                    maxWidth: sidebarOpen ? '200px' : '0px',
                    transition: 'opacity 0.4s ease-in-out, max-width 0.5s ease-in-out'
                  }}
                >
                  {link.label}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Admin Section - Fixed at bottom above logout */}
          {isAdmin && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              {/* Admin Header - Fixed height */}
              <div className="h-10 flex items-center pl-5 overflow-hidden">
                <span 
                  className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  style={{ 
                    opacity: sidebarOpen ? 1 : 0,
                    transition: 'opacity 0.4s ease-in-out'
                  }}
                >
                  Admin
                </span>
              </div>
              
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 pl-5 pr-4 py-3 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-[#e85d45] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                  title={!sidebarOpen ? link.label : undefined}
                >
                  <span className="flex-shrink-0 w-5">{link.icon}</span>
                  <span 
                    className="whitespace-nowrap overflow-hidden"
                    style={{ 
                      opacity: sidebarOpen ? 1 : 0,
                      maxWidth: sidebarOpen ? '200px' : '0px',
                      transition: 'opacity 0.4s ease-in-out, max-width 0.5s ease-in-out'
                    }}
                  >
                    {link.label}
                  </span>
                </NavLink>
              ))}
            </div>
          )}

          {/* Logout Button */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 pl-5 pr-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 w-full"
              title={!sidebarOpen ? 'Odjavi se' : undefined}
            >
              <span className="flex-shrink-0 w-5">{icons.logout}</span>
              <span 
                className="whitespace-nowrap overflow-hidden"
                style={{ 
                  opacity: sidebarOpen ? 1 : 0,
                  maxWidth: sidebarOpen ? '200px' : '0px',
                  transition: 'opacity 0.4s ease-in-out, max-width 0.5s ease-in-out'
                }}
              >
                Odjavi se
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-all duration-500"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main 
        className={`pt-16 min-h-screen ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'}`}
        style={{ 
          transition: 'margin-left 0.5s ease-in-out'
        }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
