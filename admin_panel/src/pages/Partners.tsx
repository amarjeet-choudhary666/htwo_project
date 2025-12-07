import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { partnerAPI } from '../api/admin';

interface Partner {
  id: number;
  companyName: string;
  companyAddress: string;
  businessType: string;
  otherBusinessType?: string;
  fullName: string;
  email: string;
  phone: string;
  countryRegion: string;
  estimatedMonthlySales: string;
  hasTechnicalSupport: boolean;
  partnershipReason?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PartnerSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const Partners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerSummary, setPartnerSummary] = useState<PartnerSummary>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchPartners();
    fetchPartnerSummary();
  }, [searchTerm, statusFilter]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await partnerAPI.getAll({
        search: searchTerm,
        status: statusFilter
      });

      if (response.success && response.data) {
        setPartners(response.data.partners || []);
      } else {
        console.error('API returned error:', response);
        setPartners([]);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerSummary = async () => {
    try {
      const response = await partnerAPI.getAllWithStatus();
      if (response.success && response.data) {
        setPartnerSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching partner summary:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this partner registration?`)) return;

    try {
      await partnerAPI.updateStatus(id.toString(), status);
      fetchPartners();
      fetchPartnerSummary();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this partner registration?')) return;

    try {
      await partnerAPI.delete(id.toString());
      fetchPartners();
      fetchPartnerSummary();
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('Error deleting partner');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatBusinessType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatSalesRange = (range: string) => {
    const map: Record<string, string> = {
      'LESS_THAN_10': 'Less than 10',
      'BETWEEN_10_50': '10-50',
      'BETWEEN_51_200': '51-200',
      'MORE_THAN_200': '200+'
    };
    return map[range] || range;
  };

  if (loading && partners.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Partner Registrations</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="h-6 w-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{partnerSummary.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="h-6 w-6 bg-yellow-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{partnerSummary.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="h-6 w-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{partnerSummary.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="h-6 w-6 bg-red-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{partnerSummary.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Showing {partners.length} registrations
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company & Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No partner registrations found
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {partner.companyName}
                        </div>
                        <div className="text-sm text-gray-500">{partner.fullName}</div>
                        <div className="text-sm text-gray-500">{partner.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {formatBusinessType(partner.businessType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(partner.status)}`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPartner(partner)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {partner.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(partner.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(partner.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Details Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Partner Registration Details
                </h3>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Company Name</label>
                    <p className="text-gray-900">{selectedPartner.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                    <p className="text-gray-900">{selectedPartner.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedPartner.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedPartner.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Business Type</label>
                    <p className="text-gray-900">{formatBusinessType(selectedPartner.businessType)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Country/Region</label>
                    <p className="text-gray-900">{selectedPartner.countryRegion}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Estimated Monthly Sales</label>
                    <p className="text-gray-900">{formatSalesRange(selectedPartner.estimatedMonthlySales)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Technical Support</label>
                    <p className="text-gray-900">{selectedPartner.hasTechnicalSupport ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Company Address</label>
                  <p className="text-gray-900 mt-1">{selectedPartner.companyAddress}</p>
                </div>

                {selectedPartner.partnershipReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Partnership Reason</label>
                    <p className="text-gray-900 mt-1">{selectedPartner.partnershipReason}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(selectedPartner.status)}`}>
                    {selectedPartner.status}
                  </span>
                </div>

                {selectedPartner.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        handleStatusChange(selectedPartner.id, 'rejected');
                        setSelectedPartner(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedPartner.id, 'approved');
                        setSelectedPartner(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
