const API_BASE_URL = 'http://localhost:3000';

export interface Service {
  id: number;
  name: string;
  description?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  imageUrl?: string;
  features: string[];
  ram?: string;
  storage?: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: {
    id: number;
    name: string;
  };
  categoryType: {
    id: number;
    name: string;
  };
  owner?: {
    id: number;
    email: string;
    firstname: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VpsServer {
  id: number;
  os: 'LINUX' | 'WINDOWS';
  availability: 'HIGH_AVAILABILITY' | 'NON_HIGH_AVAILABILITY';
  processorModel: string;
  perGbRam: number;
  logicalVCores: number;
  storage: string;
  clockSpeed: number;
  bandwidth: number;
  pricePerMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface DedicatedServer {
  id: string;
  chip: 'AMD' | 'INTEL';
  processorModel: string;
  physicalCores: number;
  logicalVCores: number;
  clockSpeed: string;
  ramGb: number;
  primaryDrive: string;
  secondaryDrive?: string;
  raidCard?: string;
  pricePerMonth: number;
  createdAt: string;
  updatedAt: string;
}

class ServiceApi {
  private async request(endpoint: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  }

  async getAllServices(): Promise<Service[]> {
    return this.request('/services');
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return this.request(`/services/category/${encodeURIComponent(category)}`);
  }

  async getServicesByCategoryAndType(category: string, type: string): Promise<Service[]> {
    return this.request(`/services/category/${encodeURIComponent(category)}/type/${encodeURIComponent(type)}`);
  }

  async getServicesByPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<Service[]> {
    return this.request(`/services/priority/${priority}`);
  }

  async getServicesByCategoryAndPriority(category: string, priority: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<Service[]> {
    return this.request(`/services/category/${encodeURIComponent(category)}/priority/${priority}`);
  }

  async getServiceByName(name: string): Promise<Service> {
    return this.request(`/services/name/${encodeURIComponent(name)}`);
  }

  async getVpsServers(os?: 'LINUX' | 'WINDOWS', availability?: 'HIGH_AVAILABILITY' | 'NON_HIGH_AVAILABILITY'): Promise<VpsServer[]> {
    const params = new URLSearchParams();
    if (os) params.append('os', os);
    if (availability) params.append('availability', availability);
    return this.request(`/vps-servers?${params}`);
  }

  async getVpsServerById(id: number): Promise<VpsServer> {
    return this.request(`/vps-servers/${id}`);
  }

  async getDedicatedServers(chip?: 'AMD' | 'INTEL'): Promise<DedicatedServer[]> {
    const params = new URLSearchParams();
    if (chip) params.append('chip', chip);
    return this.request(`/dedicated-servers?${params}`);
  }

  async getDedicatedServerById(id: string): Promise<DedicatedServer> {
    return this.request(`/dedicated-servers/${id}`);
  }
}

export const serviceApi = new ServiceApi();
