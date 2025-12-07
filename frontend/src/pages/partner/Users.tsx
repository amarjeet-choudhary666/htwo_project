import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, Mail, Calendar, Building, Search, Eye, DollarSign, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface PartnerUser {
  id: number;
  email: string;
  firstname: string | null;
  role: string;
  address: string | null;
  companyName: string | null;
  gstNumber: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    purchases: number;
    userServices: number;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function PartnerUsers() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<PartnerUser | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'PARTNER') {
      navigate('/partner/dashboard');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, navigate, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/v1/partner/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data && response.data.success) {
        const usersData = Array.isArray(response.data.data) 
          ? response.data.data 
          : (response.data.data?.users || []);
        setUsers(usersData);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        alert('Cannot connect to server. Please make sure the server is running on http://localhost:3000');
      } else if (error.response) {
        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          navigate('/login');
        } else if (error.response.status === 403) {
          alert('Access denied. Partner privileges required.');
        } else {
          alert(`Error: ${error.response.data?.message || 'Failed to fetch users'}`);
        }
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      (user.firstname && user.firstname.toLowerCase().includes(search)) ||
      (user.companyName && user.companyName.toLowerCase().includes(search))
    );
  });

  const stats = {
    total: users.length,
    withPurchases: users.filter(u => u._count.purchases > 0).length,
    withServices: users.filter(u => u._count.userServices > 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Clients</h1>
          <p className="mt-2 text-gray-600">Manage and view your client users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Purchases</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.withPurchases}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Services</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.withServices}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search clients by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Clients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                            <UsersIcon className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.firstname || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {client.companyName || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {client._count.purchases}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {client._count.userServices}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(client)}
                        className="text-purple-600 hover:text-purple-900 flex items-center"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No clients found matching your search' : 'No clients found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Client Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900 mt-1">{selectedUser.firstname || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 mt-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Company Name</label>
                    <p className="text-gray-900 mt-1">{selectedUser.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">GST Number</label>
                    <p className="text-gray-900 mt-1">{selectedUser.gstNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Purchases</label>
                    <p className="text-gray-900 mt-1">{selectedUser._count.purchases}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Services</label>
                    <p className="text-gray-900 mt-1">{selectedUser._count.userServices}</p>
                  </div>
                </div>

                {selectedUser.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 mt-1">{selectedUser.address}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-500">Joined Date</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

