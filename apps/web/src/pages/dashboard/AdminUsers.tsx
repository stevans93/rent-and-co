import { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'moderator';
  profileImage?: string;
  createdAt: string;
  resourceCount?: number;
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, pages: 1 });

  useEffect(() => {
    if (token) {
      fetchUsers();
    } else {
      setError('Nema tokena za autentifikaciju');
      setIsLoading(false);
    }
  }, [currentPage, perPage, roleFilter, token]);

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
      
      const res = await fetch(`${API_URL}/user?${params}`, {
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
      const res = await fetch(`${API_URL}/user/${userId}/role`, {
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
      const res = await fetch(`${API_URL}/user/${userId}`, {
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
  };


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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.usersManagement}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.dashboard.users}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{pagination.total} {t.dashboard.users}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t.dashboard.searchUsers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
          >
            <option value="all">{t.dashboard.allRoles}</option>
            <option value="user">{t.dashboard.user}</option>
            <option value="moderator">{t.dashboard.moderator}</option>
            <option value="admin">Admin</option>
          </select>

          {/* Per Page */}
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e85d45]/20"
          >
            <option value={5}>5 {t.dashboard.perPage}</option>
            <option value={10}>10 {t.dashboard.perPage}</option>
            <option value={15}>15 {t.dashboard.perPage}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.user}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.email}</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t.dashboard.role}</th>
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
                          src={user.profileImage}
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
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString('sr-RS')}
                  </td>
                  <td className="px-6 py-4">
                    {user._id !== currentUser?._id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="text-[#e85d45] hover:text-[#d54d35] text-sm"
                        >
                          {t.dashboard.changeRole}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          {t.dashboard.delete}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">{t.dashboard.noUsersFound}</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t.dashboard.showing} {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, pagination.total)} {t.dashboard.of} {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.dashboard.previous}
              </button>
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
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sledeća
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Izmeni ulogu korisnika</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
            </p>
            <div className="space-y-3">
              {['user', 'moderator', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => updateUserRole(selectedUser._id, role)}
                  className={`w-full py-3 px-4 rounded-lg border text-left transition-colors ${
                    selectedUser.role === role
                      ? 'border-[#e85d45] bg-[#e85d45]/5 dark:bg-[#e85d45]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {role === 'admin' ? 'Admin' : role === 'moderator' ? 'Moderator' : 'Korisnik'}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role === 'admin' && 'Puni pristup svim funkcijama'}
                    {role === 'moderator' && 'Može da moderira oglase'}
                    {role === 'user' && 'Standardni korisnik'}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Otkaži
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
