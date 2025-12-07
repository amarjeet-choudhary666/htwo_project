import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User, Server, DollarSign } from 'lucide-react';

interface User {
  id: number;
  firstname: string;
  email: string;
}

interface Service {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priority: string;
  categoryId?: number;
  categoryTypeId?: number;
  category?: {
    id: number;
    name: string;
  };
  categoryType?: {
    id: number;
    name: string;
  };
}

interface CategoryType {
  id: number;
  name: string;
}

interface UserService {
  id: number;
  userId: number;
  serviceId: number;
  price: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  createdAt: string;
  user?: User;
  service?: Service;
}

interface UserServiceFormData {
  userId: string;
  serviceId: string;
  categoryTypeId: string;
  price: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  domain: string;
  partner: string;
  paymentMode: string;
  acronisFolderLocation: string;
}

const UserServices = () => {
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<UserService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // For user, partner, and service search
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [partnerSuggestions, setPartnerSuggestions] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [serviceSuggestions, setServiceSuggestions] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [formData, setFormData] = useState<UserServiceFormData>({
    userId: '',
    serviceId: '',
    categoryTypeId: '',
    price: '',
    priority: 'MEDIUM',
    domain: '',
    partner: 'htwo',
    paymentMode: '',
    acronisFolderLocation: ''
  });

  useEffect(() => {
    fetchUserServices();
    fetchUsers();
    fetchServices();
    fetchPartners();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/v1/admin/users', {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Users API response:', data);

      if (data.success) {
        setUsers(data.data?.users || []);
        console.log('Users loaded:', data.data?.users?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/v1/admin/services', {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Services API response:', data);

      if (data.success) {
        setServices(data.data || []);
        console.log('Services loaded:', data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchCategoryTypes = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/categories/${categoryId}/types`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setCategoryTypes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching category types:', error);
    }
  };

  const fetchPartners = async () => {
    try {
      // Fetch users with PARTNER role
      const response = await fetch('/api/v1/admin/users?role=PARTNER&limit=100', {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Partners API response:', data);

      if (data.success) {
        setPartners(data.data?.users || []);
        console.log('Partners loaded:', data.data?.users?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const fetchUserServices = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '100'); // Get more records

      const response = await fetch(`/api/v1/admin/purchases?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to fetch purchases:', response.status);
        setUserServices([]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success || data.data) {
        // Transform purchases to match UserService interface
        const purchases = data.data?.purchases || [];
        const transformedData = purchases.map((purchase: any) => ({
          id: purchase.id,
          userId: purchase.userId,
          serviceId: purchase.id,
          price: purchase.amount,
          priority: 'MEDIUM',
          status: purchase.paymentStatus === 'COMPLETED' ? 'active' : 'inactive',
          createdAt: purchase.createdAt,
          user: purchase.user,
          service: {
            id: purchase.id,
            name: `${purchase.serviceType} - ${purchase.serviceId}`,
            monthlyPrice: purchase.amount,
            yearlyPrice: purchase.amount * 12,
            priority: 'MEDIUM'
          }
        }));
        setUserServices(transformedData);
      }
    } catch (error) {
      console.error('Error fetching user services:', error);
      setUserServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingService
        ? `/api/v1/admin/user-services/${editingService.id}`
        : '/api/v1/admin/user-services';

      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingService(null);
        resetForm();
        fetchUserServices();
      } else {
        alert(data.message || 'Error saving user service');
      }
    } catch (error) {
      console.error('Error saving user service:', error);
      alert('Error saving user service');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userService: UserService) => {
    setEditingService(userService);
    setFormData({
      userId: userService.userId.toString(),
      serviceId: userService.serviceId.toString(),
      categoryTypeId: userService.service?.categoryType?.id?.toString() || '',
      price: userService.price.toString(),
      priority: userService.priority,
      domain: '',
      partner: '',
      paymentMode: '',
      acronisFolderLocation: ''
    });

    // Load category types if service has category
    if (userService.service?.categoryId) {
      fetchCategoryTypes(userService.service.categoryId.toString());
    }

    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user service?')) return;

    try {
      const response = await fetch(`/api/v1/admin/user-services/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        fetchUserServices();
      } else {
        alert(data.message || 'Error deleting user service');
      }
    } catch (error) {
      console.error('Error deleting user service:', error);
      alert('Error deleting user service');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      serviceId: '',
      categoryTypeId: '',
      price: '',
      priority: 'MEDIUM',
      domain: '',
      partner: 'htwo',
      paymentMode: '',
      acronisFolderLocation: ''
    });
    setCategoryTypes([]);
  };

  const calculatePrice = (basePrice: number, priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    const multipliers = {
      HIGH: 1.5,
      MEDIUM: 1.2,
      LOW: 1.0
    };
    return Math.round(basePrice * multipliers[priority]);
  };

  // User search functionality
  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setUserSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`/api/v1/admin/users?search=${term}&limit=10`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUserSuggestions(data.data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Partner search functionality - search users with PARTNER role
  const searchPartners = async (term: string) => {
    if (term.length < 2) {
      setPartnerSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`/api/v1/admin/users?role=PARTNER&search=${term}&limit=10`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setPartnerSuggestions(data.data?.users || []);
      }
    } catch (error) {
      console.error('Error searching partners:', error);
    }
  };

  // Service search functionality
  const searchServices = async (term: string) => {
    if (term.length < 2) {
      setServiceSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`/api/v1/admin/services?search=${term}&limit=10`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setServiceSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Error searching services:', error);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(s => s.id.toString() === serviceId);
    if (selectedService) {
      // Fetch category types for the service's category
      if (selectedService.categoryId) {
        fetchCategoryTypes(selectedService.categoryId.toString());
      }

      // Auto-calculate price based on service and priority
      const basePrice = selectedService.monthlyPrice || 0;
      const calculatedPrice = calculatePrice(basePrice, formData.priority);

      setFormData(prev => ({
        ...prev,
        serviceId,
        price: calculatedPrice.toString()
      }));
    }
  };

  const handlePriorityChange = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    setFormData(prev => {
      const selectedService = services.find(s => s.id.toString() === prev.serviceId);
      if (selectedService) {
        const basePrice = selectedService.monthlyPrice || 0;
        const calculatedPrice = calculatePrice(basePrice, priority);
        return {
          ...prev,
          priority,
          price: calculatedPrice.toString()
        };
      }
      return { ...prev, priority };
    });
  };

  if (loading && userServices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Services Management</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingService(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User Service
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search user services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* User Services Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userServices.map((userService) => (
                <tr key={userService.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userService.user?.firstname || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userService.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Server className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {userService.service?.name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      ₹{userService.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userService.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {userService.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(userService.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingService ? 'Edit User Service' : 'Add New User Service'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* User Email Search */}
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
                      setFormData(prev => ({ ...prev, userId: '' }));
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
                            setFormData(prev => ({ ...prev, userId: user.id.toString() }));
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service *
                    </label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ₹{service.monthlyPrice || 'N/A'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type
                    </label>
                    <select
                      value={formData.categoryTypeId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryTypeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!formData.serviceId}
                    >
                      <option value="">Select Service Type</option>
                      {categoryTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority *
                    </label>
                    <select
                      required
                      value={formData.priority}
                      onChange={(e) => handlePriorityChange(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="e.g., example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Partner Search */}
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
                      setFormData(prev => ({ ...prev, partner: '' }));
                      searchPartners(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {partnerSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-medium"
                        onClick={() => {
                          setSelectedPartner({ companyName: 'H2 Technologies', name: 'H2 Technologies' });
                          setPartnerSearchTerm('H2 Technologies');
                          setFormData(prev => ({ ...prev, partner: 'htwo' }));
                          setPartnerSuggestions([]);
                        }}
                      >
                        H2 Technologies (Default)
                      </div>
                      {partnerSuggestions.map((partner) => (
                        <div
                          key={partner.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setPartnerSearchTerm(partner.companyName || partner.firstname || partner.email);
                            setFormData(prev => ({ ...prev, partner: partner.companyName || partner.firstname || partner.email }));
                            setPartnerSuggestions([]);
                          }}
                        >
                          <div className="font-medium">{partner.companyName || partner.firstname || partner.email}</div>
                          <div className="text-sm text-gray-500">Partner Role</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Acronis Folder Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acronis Folder Location
                  </label>
                  <input
                    type="text"
                    value={formData.acronisFolderLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, acronisFolderLocation: e.target.value }))}
                    placeholder="e.g., /backup/folder/path"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingService(null);
                      resetForm();
                      setUserSearchTerm('');
                      setPartnerSearchTerm('');
                      setServiceSearchTerm('');
                      setSelectedUser(null);
                      setSelectedPartner(null);
                      setSelectedService(null);
                      setUserSuggestions([]);
                      setPartnerSuggestions([]);
                      setServiceSuggestions([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingService ? 'Update' : 'Create')}
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

export default UserServices;