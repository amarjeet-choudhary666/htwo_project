import { useAuth } from '../../hooks/useAuth';
import { FileText, Clock, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ServiceRequest {
  id: number;
  serviceType: string;
  servicePlan: string;
  serverLocation?: string;
  billingCycle: string;
  additionalNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ServiceRequests() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/partner/login');
      return;
    }

    fetchServiceRequests();
  }, [isAuthenticated, navigate]);

  const fetchServiceRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/v1/partner/service-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setServiceRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoadingRequests(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServiceRequests();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
        {getStatusIcon(status)}
        <span className="ml-2">{status}</span>
      </span>
    );
  };

  const openModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const pendingRequests = serviceRequests.filter(req => req.status === 'PENDING').length;
  const approvedRequests = serviceRequests.filter(req => req.status === 'APPROVED').length;
  const rejectedRequests = serviceRequests.filter(req => req.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Service Requests</h1>
            <p className="mt-2 text-blue-100">Track the status of your service requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/partner/service-request')}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors"
            >
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{serviceRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Service Requests</h2>
        </div>

        {loadingRequests ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your service requests...</p>
          </div>
        ) : serviceRequests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests yet</h3>
            <p className="text-gray-500 mb-6">You haven't submitted any service requests yet.</p>
            <button
              onClick={() => navigate('/partner/service-request')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Submit Your First Request
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {serviceRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {request.serviceType} - {request.servicePlan}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                          <span>Billing: {request.billingCycle}</span>
                          {request.serverLocation && <span>Location: {request.serverLocation}</span>}
                          <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        {request.additionalNotes && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {request.additionalNotes}
                          </p>
                        )}


                        {request.adminNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                            <p className="text-sm text-gray-600 mt-1">{request.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => openModal(request)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Service Request Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Service Type:</span>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.serviceType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Service Plan:</span>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.servicePlan}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Billing Cycle:</span>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.billingCycle}</p>
                  </div>
                  {selectedRequest.serverLocation && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Server Location:</span>
                      <p className="mt-1 text-sm text-gray-900">{selectedRequest.serverLocation}</p>
                    </div>
                  )}
                </div>

                {selectedRequest.additionalNotes && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Additional Notes:</span>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedRequest.additionalNotes}
                    </p>
                  </div>
                )}


                {selectedRequest.adminNotes && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Admin Notes:</span>
                    <p className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      {selectedRequest.adminNotes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Submitted:</span> {new Date(selectedRequest.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(selectedRequest.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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