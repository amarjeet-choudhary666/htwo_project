export interface User {
  id: number;
  email: string;
  firstname?: string;
  role: 'ADMIN' | 'USER' | 'PARTNER';
  address?: string;
  companyName?: string;
  gstNumber?: string;
  partnerId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
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
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  imageUrl: string;
  features: string[];
  status: string;
  priority: string;
  ram: number;
  storage: string;
  owner: {
    id: number;
    email: string;
    firstname: string;
  };
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  categoryTypes: CategoryType[];
}

export interface CategoryType {
  id: number;
  name: string;
  categoryId: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'demo' | 'contact' | 'get_in_touch';
  service?: string;
  message?: string;
  status: string;
  createdAt: string;
  user?: {
    id: number;
    email: string;
    firstname?: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalPartners: number;
  approvedPartners: number;
  pendingPartners: number;
  totalServices: number;
  activeServices: number;
  totalSubmissions: number;
  demoRequests: number;
  contactForms: number;
  getInTouch: number;
}

export interface AnalyticsData {
  totalSubmissions: number;
  submissionsByType: Array<{
    type: string;
    _count: number;
  }>;
  submissionsByMonth: Array<{
    createdAt: string;
    _count: number;
  }>;
  topServices: Array<{
    service: string;
    _count: number;
  }>;
}

export interface PaginationMeta {
  current: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
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

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}