import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter } from 'lucide-react';
import { purchaseAPI, partnerAPI, userAPI } from '../api/admin';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Purchase {
  id: number;
  userId: number;
  serviceType: string;
  serviceId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  expiresAt?: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    firstname: string;
    companyName?: string;
  };
}

interface Stats {
  totalPurchases: number;
  totalRevenue: number;
  completedPurchases: number;
  pendingPurchases: number;
  failedPurchases: number;
  expiringSoon: number;
}

const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create purchase modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingPurchase, setCreatingPurchase] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [partnerSuggestions, setPartnerSuggestions] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [filter, search, page]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/v1/admin/purchases/stats`, {
        withCredentials: true
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (filter) params.append('status', filter);
      if (search) params.append('search', search);

      const response = await axios.get(`${API_URL}/api/v1/admin/purchases?${params}`, {
        withCredentials: true
      });
      
      setPurchases(response.data.data.purchases);
      setTotalPages(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  };

  // User search functionality
  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setUserSuggestions([]);
      return;
    }
    try {
      const response = await userAPI.getAll({ search: term, limit: 10 });
      if (response.success) {
        setUserSuggestions(response.data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Partner search functionality
  const searchPartners = async (term: string) => {
    if (term.length < 2) {
      setPartnerSuggestions([]);
      return;
    }
    try {
      const response = await partnerAPI.getAll({ search: term, limit: 10 });
      if (response.success) {
        setPartnerSuggestions(response.data.partners || []);
      }
    } catch (error) {
      console.error('Error searching partners:', error);
    }
  };

  // Handle create purchase
  const handleCreatePurchase = async (purchaseData: any) => {
    try {
      setCreatingPurchase(true);
      await purchaseAPI.create(purchaseData);
      setShowCreateModal(false);
      setSelectedUser(null);
      setSelectedPartner(null);
      setUserSearchTerm('');
      setPartnerSearchTerm('');
      fetchPurchases();
      fetchStats();
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Error creating purchase');
    } finally {
      setCreatingPurchase(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchased Services</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Purchase
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Purchases</div>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completedPurchases}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingPurchases}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Failed</div>
            <div className="text-2xl font-bold text-red-600">{stats.failedPurchases}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Expiring Soon</div>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by email, name, or transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires On</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{purchase.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{purchase.user.firstname}</div>
                    <div className="text-sm text-gray-500">{purchase.user.email}</div>
                    {purchase.user.companyName && (
                      <div className="text-xs text-gray-400">{purchase.user.companyName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{purchase.serviceType}</div>
                    <div className="text-xs text-gray-500">{purchase.serviceId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {purchase.currency} {purchase.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(purchase.paymentStatus)}`}>
                      {purchase.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {purchase.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {purchase.expiresAt ? (
                      <span className={
                        isExpired(purchase.expiresAt)
                          ? 'text-red-600 font-medium'
                          : isExpiringSoon(purchase.expiresAt)
                          ? 'text-orange-600 font-medium'
                          : 'text-gray-900'
                      }>
                        {new Date(purchase.expiresAt).toLocaleDateString()}
                        {isExpired(purchase.expiresAt) && ' (Expired)'}
                        {isExpiringSoon(purchase.expiresAt) && ' (Soon)'}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {purchases.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No purchases found
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Purchase Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Purchase</h3>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const purchaseData = {
                  userId: selectedUser?.id,
                  serviceType: formData.get('serviceType') as string,
                  serviceId: formData.get('serviceId') as string,
                  amount: parseFloat(formData.get('amount') as string),
                  currency: formData.get('currency') as string || 'INR',
                  paymentMethod: formData.get('paymentMethod') as string,
                  paymentStatus: formData.get('paymentStatus') as string || 'COMPLETED',
                  domain: formData.get('domain') as string || undefined,
                  partner: selectedPartner?.name || 'htwo',
                  acronisFolderLocation: formData.get('acronisFolderLocation') as string || undefined,
                };
                handleCreatePurchase(purchaseData);
              }} className="space-y-4">
                {/* User Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Email *
                  </label>
                  <input
                    type="text"
                    placeholder="Search for user by email..."
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      setSelectedUser(null);
                      searchUsers(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {userSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {userSuggestions.map((user) => (
                        <div
                          key={user.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserSearchTerm(user.email);
                            setUserSuggestions([]);
                          }}
                        >
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.firstname || 'N/A'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type *
                    </label>
                    <select
                      name="serviceType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="CLOUD">Cloud Service</option>
                      <option value="SERVER">Server Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service ID *
                    </label>
                    <input
                      type="text"
                      name="serviceId"
                      placeholder="e.g., VPS-001, Cloud-ABC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      defaultValue="INR"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      name="paymentStatus"
                      defaultValue="COMPLETED"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    name="domain"
                    placeholder="e.g., example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Partner Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner
                  </label>
                  <input
                    type="text"
                    placeholder="Search for partner..."
                    value={partnerSearchTerm}
                    onChange={(e) => {
                      setPartnerSearchTerm(e.target.value);
                      setSelectedPartner(null);
                      searchPartners(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {partnerSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {partnerSuggestions.map((partner) => (
                        <div
                          key={partner.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setPartnerSearchTerm(partner.companyName || partner.name);
                            setPartnerSuggestions([]);
                          }}
                        >
                          <div className="font-medium">{partner.companyName || partner.name}</div>
                          <div className="text-sm text-gray-500">{partner.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acronis Folder Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acronis Folder Location
                  </label>
                  <input
                    type="text"
                    name="acronisFolderLocation"
                    placeholder="e.g., /backup/folder/path"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedUser(null);
                      setSelectedPartner(null);
                      setUserSearchTerm('');
                      setPartnerSearchTerm('');
                      setUserSuggestions([]);
                      setPartnerSuggestions([]);
                    }}
                    disabled={creatingPurchase}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingPurchase || !selectedUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {creatingPurchase && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {creatingPurchase ? 'Creating...' : 'Create Purchase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
