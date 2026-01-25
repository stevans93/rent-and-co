import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth, useLanguage } from '../../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace('/api', '');

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'moderator';
  profileImage?: string;
  createdAt: string;
  resourceCounts?: {
    active: number;
    inactive: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [listingStatusFilter, setListingStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem('adminUsersPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, pages: 1 });

  // Function to toggle dropdown and calculate position
  const toggleDropdown = (userId: string) => {
    if (openDropdownId === userId) {
      setOpenDropdownId(null);
      setDropdownPosition(null);
    } else {
      const button = buttonRefs.current[userId];
      if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownHeight = 180; // Approximate height of dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < dropdownHeight;
        
        setDropdownPosition({
          top: openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
          left: rect.right - 192, // 192px = w-48
          openUp,
        });
      }
      setOpenDropdownId(userId);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside dropdown and outside all buttons
      const isClickOnButton = Object.values(buttonRefs.current).some(btn => btn?.contains(target));
      if (dropdownRef.current && !dropdownRef.current.contains(target) && !isClickOnButton) {
        setOpenDropdownId(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
        setDropdownPosition(null);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [openDropdownId]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    } else {
      setError('Nema tokena za autentifikaciju');
      setIsLoading(false);
    }
  }, [currentPage, perPage, roleFilter, listingStatusFilter, token]);

  const fetchUsers = async () => {
    if (!token) {
      setError('Nema tokena za autentifikaciju');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', perPage.toString());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (listingStatusFilter !== 'all') params.append('listingStatus', listingStatusFilter);
      
      const res = await fetch(`${API_URL}/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        } else {
          // Fallback if API doesn't return pagination
          setPagination({
            total: data.data.length,
            page: currentPage,
            limit: perPage,
            pages: Math.ceil(data.data.length / perPage)
          });
        }
      } else {
        setError(data.message || 'Greška pri učitavanju korisnika');
      }
    } catch (err) {
      setError('Greška pri povezivanju sa serverom');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as User['role'] } : u));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) return;
    
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
        fetchUsers(); // Refresh to update pagination
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const changeUserPassword = async () => {
    if (!selectedUser) return;
    
    setPasswordError('');
    
    if (!newPassword) {
      setPasswordError('Unesite novu lozinku');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Lozinka mora imati najmanje 6 karaktera');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/users/${selectedUser._id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setSelectedUser(null);
        alert('Lozinka je uspešno promenjena!');
      } else {
        setPasswordError(data.message || 'Greška pri promeni lozinke');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Greška pri povezivanju sa serverom');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'moderator':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page
    localStorage.setItem('adminUsersPerPage', newPerPage.toString());
  };

  // Render dropdown content
  const renderDropdownContent = (user: User) => (
    <>
      <button
        onClick={() => { setSelectedUser(user); setIsModalOpen(true); setOpenDropdownId(null); setDropdownPosition(null); }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-[#e85d45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span>{t.dashboard.changeRole}</span>
      </button>
      <button
        onClick={() => { setSelectedUser(user); setNewPassword(''); setPasswordError(''); setIsPasswordModalOpen(true); setOpenDropdownId(null); setDropdownPosition(null); }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <span>{t.dashboard.changePassword || 'Lozinka'}</span>
      </button>
      <div className="border-t border-gray-100 dark:border-gray-700 my-2 mx-3"></div>
      <button
        onClick={() => { deleteUser(user._id); setOpenDropdownId(null); setDropdownPosition(null); }}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <span>{t.dashboard.delete}</span>
      </button>
    </>
  );

  // Find the user for the currently open dropdown
  const dropdownUser = openDropdownId ? users.find(u => u._id === openDropdownId || `desktop-${u._id}` === openDropdownId) : null;


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 dark:text-red-400 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-semibold">{error}</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="px-4 py-2 bg-[#e85d45] text-white rounded-lg hover:bg-[#d54d35] transition-colors"
        >
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.usersManagement}</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.dashboard.users}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{pagination.total} {t.dashboard.users}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t.dashboard.searchUsers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
          >
            <option value="all">{t.dashboard.allRoles}</option>
            <option value="user">{t.dashboard.user}</option>
            <option value="moderator">{t.dashboard.moderator}</option>
            <option value="admin">Admin</option>
          </select>

          {/* Listing Status Filter */}
          <select
            value={listingStatusFilter}
            onChange={(e) => {
              setListingStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
          >
            <option value="all">{t.dashboard.allListings || 'Svi oglasi'}</option>
            <option value="with-active">{t.dashboard.withActiveListings || 'Sa aktivnim oglasima'}</option>
            <option value="with-inactive">{t.dashboard.withInactiveListings || 'Sa neaktivnim oglasima'}</option>
            <option value="no-listings">{t.dashboard.noListings || 'Bez oglasa'}</option>
          </select>

          {/* Per Page */}
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-3 sm:px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
          >
            <option value={5}>5 {t.dashboard.perPage}</option>
            <option value={10}>10 {t.dashboard.perPage}</option>
            <option value={15}>15 {t.dashboard.perPage}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {filteredUsers.map((user) => (
            <div key={user._id} className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                {user.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#e85d45] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? t.dashboard.moderator : t.dashboard.user}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString('sr-RS')}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      {user.resourceCounts?.active || 0} {t.dashboard.active || 'aktivnih'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {user.resourceCounts?.inactive || 0} {t.dashboard.inactive || 'neaktivnih'}
                    </span>
                  </div>
                </div>
                {/* Actions Dropdown Button */}
                {currentUser?._id !== user._id && (
                  <button
                    ref={(el) => { buttonRefs.current[user._id] = el; }}
                    onClick={() => toggleDropdown(user._id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto overflow-y-visible">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.user}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.email}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.role}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.listings || 'Oglasi'}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.registered}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img
                          src={getImageUrl(user.profileImage)}
                          alt={user.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#e85d45] flex items-center justify-center text-white font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        {user.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? t.dashboard.moderator : t.dashboard.user}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        {user.resourceCounts?.active || 0} {t.dashboard.active || 'aktivnih'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {user.resourceCounts?.inactive || 0} {t.dashboard.inactive || 'neaktivnih'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString('sr-RS')}
                  </td>
                  <td className="px-6 py-4">
                    {user._id !== currentUser?._id && (
                      <button
                        ref={(el) => { buttonRefs.current[`desktop-${user._id}`] = el; }}
                        onClick={() => toggleDropdown(`desktop-${user._id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.dashboard.noUsersFound}</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t.dashboard.showing} {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, pagination.total)} {t.dashboard.of} {pagination.total}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:px-3 sm:py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">{t.dashboard.previous}</span>
              </button>
              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#e85d45] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <span className="sm:hidden text-xs text-gray-500">{currentPage}/{pagination.pages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="p-1.5 sm:px-3 sm:py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="hidden sm:inline">{t.dashboard.next}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl max-w-md w-full p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t.dashboard.changeRole}</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              {selectedUser.firstName} {selectedUser.lastName}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">{selectedUser.email}</p>
            <div className="space-y-2 sm:space-y-3">
              {['user', 'moderator', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => updateUserRole(selectedUser._id, role)}
                  className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border text-left transition-colors ${
                    selectedUser.role === role
                      ? 'border-[#e85d45] bg-[#e85d45]/5 dark:bg-[#e85d45]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                    {role === 'admin' ? 'Admin' : role === 'moderator' ? t.dashboard.moderator : t.dashboard.user}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {role === 'admin' && 'Puni pristup svim funkcijama'}
                    {role === 'moderator' && 'Može da moderira oglase'}
                    {role === 'user' && 'Standardni korisnik'}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-3 sm:mt-4 w-full py-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl max-w-md w-full p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t.dashboard.changePassword || 'Promeni lozinku'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
              {selectedUser.firstName} {selectedUser.lastName}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">{selectedUser.email}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.dashboard.newPassword || 'Nova lozinka'}
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Unesite novu lozinku"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e85d45] focus:border-transparent"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Lozinka mora imati najmanje 6 karaktera
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setNewPassword('');
                  setPasswordError('');
                }}
                className="flex-1 py-2.5 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={changeUserPassword}
                className="flex-1 py-2.5 text-sm sm:text-base bg-[#e85d45] text-white rounded-lg hover:bg-[#d54d35] transition-colors"
              >
                {t.common.save || 'Sačuvaj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Portal - renders outside table */}
      {openDropdownId && dropdownPosition && dropdownUser && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]"
          style={{
            top: dropdownPosition.top,
            left: Math.max(8, dropdownPosition.left), // Ensure it doesn't go off-screen left
          }}
        >
          {renderDropdownContent(dropdownUser)}
        </div>,
        document.body
      )}
    </div>
  );
}
