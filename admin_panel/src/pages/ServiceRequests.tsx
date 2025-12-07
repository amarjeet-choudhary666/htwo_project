import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ServiceRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  gstNumber?: string;
  address?: string;
  vpsPlan: string;
  serverLocation: string;
  billingCycle: string;
  additionalNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
}

const ServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const url = filter
        ? `${API_URL}/api/v1/admin/service-requests?status=${filter}`
        : `${API_URL}/api/v1/admin/service-requests`;

      const response = await axios.get(url, {
        withCredentials: true
      });
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !amount) {
      alert('Please enter amount');
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/v1/admin/service-requests/${selectedRequest.id}/approve`,
        { amount: parseFloat(amount), adminNotes },
        { withCredentials: true }
      );

      alert('Service request approved!');
      setShowModal(false);
      setSelectedRequest(null);
      setAmount('');
      setAdminNotes('');
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/v1/admin/service-requests/${selectedRequest.id}/reject`,
        { adminNotes },
        { withCredentials: true }
      );

      alert('Service request rejected');
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    setAmount('');
    setAdminNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Requests</h1>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Requests</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VPS Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.email}</td>
                <td className="px-6 py-4 text-sm">{request.vpsPlan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.billingCycle}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => openModal(request)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No service requests found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Review Service Request</h2>
            
            <div className="space-y-3 mb-6">
              <div><strong>Name:</strong> {selectedRequest.fullName}</div>
              <div><strong>Email:</strong> {selectedRequest.email}</div>
              <div><strong>Phone:</strong> {selectedRequest.phone}</div>
              {selectedRequest.companyName && <div><strong>Company:</strong> {selectedRequest.companyName}</div>}
              {selectedRequest.gstNumber && <div><strong>GST:</strong> {selectedRequest.gstNumber}</div>}
              {selectedRequest.address && <div><strong>Address:</strong> {selectedRequest.address}</div>}
              <div><strong>VPS Plan:</strong> {selectedRequest.vpsPlan}</div>
              <div><strong>Server Location:</strong> {selectedRequest.serverLocation}</div>
              <div><strong>Billing Cycle:</strong> {selectedRequest.billingCycle}</div>
              {selectedRequest.additionalNotes && (
                <div><strong>Notes:</strong> {selectedRequest.additionalNotes}</div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading || !amount}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-6 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
