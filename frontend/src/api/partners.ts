const API_BASE_URL = 'http://localhost:3000';

export interface Partner {
  id: number;
  companyName: string;
  status: string;
  createdAt: string;
}

export const fetchPartners = async (): Promise<Partner[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/partners`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Partners are already filtered to approved on the backend
    return data.data || [];
  } catch (error) {
    console.error('Error fetching partners:', error);
    throw error;
  }
};