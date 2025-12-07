import type { User } from '../types/admin';

const API_BASE = '/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => apiCall('/v1/admin/api/stats'),
  getDashboard: () => apiCall('/v1/admin'),
};

// Submission APIs
export const submissionAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    return apiCall(`/v1/admin/submissions?${searchParams}`);
  },
  getDemoRequests: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    return apiCall(`/v1/admin/submissions/demo?${searchParams}`);
  },
  getContactForms: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    return apiCall(`/v1/admin/submissions/contact?${searchParams}`);
  },
  getInTouchForms: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    return apiCall(`/v1/admin/submissions/get-in-touch?${searchParams}`);
  },
  getById: (id: string) => apiCall(`/v1/admin/submission/${id}`),
  updateStatus: (id: string, status: string) => apiCall(`/v1/admin/submission/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  delete: (id: string) => apiCall(`/v1/admin/submission/${id}`, {
    method: 'DELETE',
  }),
  bulkDelete: (ids: string[]) => apiCall('/v1/admin/bulk/delete-submissions', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  }),
  bulkUpdateStatus: (ids: string[], status: string) => apiCall('/v1/admin/bulk/update-status', {
    method: 'POST',
    body: JSON.stringify({ ids, status }),
  }),
  export: () => fetch(`${API_BASE}/v1/admin/export/submissions`, {
    credentials: 'include',
  }),
};

// User APIs
export const userAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    return apiCall(`/v1/admin/users?${searchParams}`);
  },
  create: (data: { email: string; password: string; firstname?: string; address?: string; companyName?: string; role?: 'ADMIN' | 'USER' | 'PARTNER'; partnerEmail?: string }) => apiCall('/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createByPartnerReference: (data: { email: string; password: string; firstname: string; address: string; companyName: string; gstNumber: string; role?: 'ADMIN' | 'USER' | 'PARTNER'; partnerEmail: string }) => apiCall('/v1/admin/users/by-partner-reference', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getById: (id: string) => apiCall(`/v1/admin/users/${id}`),
  update: (id: string, data: Partial<User>) => apiCall(`/v1/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/v1/admin/users/${id}`, {
    method: 'DELETE',
  }),
  export: () => fetch(`${API_BASE}/v1/admin/export/users`, {
    credentials: 'include',
  }),
};

// Analytics APIs
export const analyticsAPI = {
  getAnalytics: () => apiCall('/v1/admin/analytics'),
  getStats: () => apiCall('/v1/admin/api/stats'),
};

// Settings APIs
export const settingsAPI = {
  getSettings: () => apiCall('/v1/admin/settings'),
  updateSettings: (data: any) => apiCall('/v1/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Partner APIs
export const partnerAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    return apiCall(`/v1/admin/partner-registrations?${searchParams}`);
  },
  getAllWithStatus: () => apiCall('/v1/admin/partner-registrations/summary'),
  getAllSimple: () => apiCall('/v1/admin/partner-registrations'),
  create: async (data: FormData) => {
    try {
      console.log('Sending partner create request with data:', data);
      
      const response = await fetch(`${API_BASE}/v1/admin/partners`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });

      console.log('Response status:', response.status);
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return result;
    } catch (error) {
      console.error('Create partner API error:', error);
      throw error;
    }
  },
  update: async (id: string, data: FormData) => {
    try {
      const response = await fetch(`${API_BASE}/v1/admin/partners/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Update partner API error:', error);
      throw error;
    }
  },
  delete: (id: string) => apiCall(`/v1/admin/partners/${id}`, {
    method: 'DELETE',
  }),
  updateStatus: (id: string, status: string) => apiCall(`/v1/admin/partner-registrations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Category APIs
export const categoryAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    return apiCall(`/v1/admin/categories?${searchParams}`);
  },
  create: (data: { name: string; description?: string }) => apiCall('/v1/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: { name: string; description?: string }) => apiCall(`/v1/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall(`/v1/admin/categories/${id}`, {
    method: 'DELETE',
  }),
  getTypes: (categoryId: string) => apiCall(`/v1/admin/categories/${categoryId}/types`),
  createType: (categoryId: string, data: { name: string }) => apiCall(`/v1/admin/categories/${categoryId}/types`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateType: (id: string, data: { name: string }) => apiCall(`/v1/admin/category-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteType: (id: string) => apiCall(`/v1/admin/category-types/${id}`, {
    method: 'DELETE',
  }),
};

// Purchase APIs
export const purchaseAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    return apiCall(`/v1/admin/purchases?${searchParams}`);
  },
  create: (data: {
    userId: number;
    serviceType: 'CLOUD' | 'SERVER';
    serviceId: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
    paymentStatus?: string;
    domain?: string;
    partner?: string;
    acronisFolderLocation?: string;
  }) => apiCall('/v1/admin/purchases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getStats: () => apiCall('/v1/admin/purchases/stats'),
  getById: (id: string) => apiCall(`/v1/admin/purchases/${id}`),
};

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) => apiCall('/v1/users/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  logout: () => apiCall('/v1/users/admin/logout', {
    method: 'POST',
  }),
  verify: () => apiCall('/v1/users/admin/verify'),
};