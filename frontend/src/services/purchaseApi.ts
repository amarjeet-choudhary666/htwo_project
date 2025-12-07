interface Purchase {
  id: number;
  userId: number;
  serviceId: string;
  serviceType: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  paymentStatus: string;
  transactionId?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

export const purchaseApi = {
  // Create a purchase (dummy payment)
  async createPurchase(
    serviceId: number,
    serviceType: 'CLOUD' | 'SERVER',
    amount: number,
    paymentMethod: string = 'dummy'
  ): Promise<Purchase> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch('/api/v1/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        serviceId,
        serviceType,
        amount,
        paymentMethod
      })
    });

    const data: ApiResponse<Purchase> = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create purchase');
    }
    
    return data.data;
  },

  // Get user purchases
  async getUserPurchases(): Promise<Purchase[]> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch('/api/v1/purchases', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data: ApiResponse<Purchase[]> = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch purchases');
    }
    
    return data.data;
  },

};

export type { Purchase };
