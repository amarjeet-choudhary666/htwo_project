import { useState, useEffect } from 'react';
import { serviceApi, type Service, type VpsServer, type DedicatedServer } from '../services/serviceApi';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceApi.getAllServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesByCategory = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceApi.getServicesByCategory(category);
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesByCategoryAndType = async (category: string, type: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceApi.getServicesByCategoryAndType(category, type);
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesByPriority = async (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceApi.getServicesByPriority(priority);
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    fetchAllServices,
    fetchServicesByCategory,
    fetchServicesByCategoryAndType,
    fetchServicesByPriority,
  };
};

// Hook for fetching services on component mount
export const useServicesByCategoryAndType = (category: string, type: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceApi.getServicesByCategoryAndType(category, type);
        setServices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (category && type) {
      fetchServices();
    }
  }, [category, type]);

  return { services, loading, error };
};

// Hook for fetching VPS servers
export const useVpsServers = (os?: 'LINUX' | 'WINDOWS', availability?: 'HIGH_AVAILABILITY' | 'NON_HIGH_AVAILABILITY') => {
  const [vpsServers, setVpsServers] = useState<VpsServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVpsServers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceApi.getVpsServers(os, availability);
        setVpsServers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVpsServers();
  }, [os, availability]);

  return { vpsServers, loading, error };
};

// Hook for fetching dedicated servers
export const useDedicatedServers = (chip?: 'AMD' | 'INTEL') => {
  const [dedicatedServers, setDedicatedServers] = useState<DedicatedServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDedicatedServers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await serviceApi.getDedicatedServers(chip);
        setDedicatedServers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDedicatedServers();
  }, [chip]);

  return { dedicatedServers, loading, error };
};
