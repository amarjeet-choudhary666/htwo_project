import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import SuccessPopup from '../../components/SuccessPopup';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { serviceApi, type Service, type VpsServer, type DedicatedServer } from '../../services/serviceApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ServiceRequest = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'servers' | 'cloud'>('servers');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [servicesLoading, setServicesLoading] = useState(false);

  // Services data
  const [vpsServers, setVpsServers] = useState<VpsServer[]>([]);
  const [dedicatedServers, setDedicatedServers] = useState<DedicatedServer[]>([]);
  const [cloudServices, setCloudServices] = useState<{[key: string]: Service[]}>({});
  const [cloudServiceTypes, setCloudServiceTypes] = useState<string[]>([]);

  // Load user data
  useEffect(() => {
    if (user) {
      setUserInfo({
        fullName: user.firstname || '',
        email: user.email || '',
        phone: '',
        companyName: user.companyName || '',
        gstNumber: user.gstNumber || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Load services on component mount
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      try {
        // Load VPS servers
        const vpsData = await serviceApi.getVpsServers();
        setVpsServers(vpsData);

        // Load dedicated servers
        const dedicatedData = await serviceApi.getDedicatedServers();
        setDedicatedServers(dedicatedData);

        // Load cloud services
        try {
          const allCloudServices = await serviceApi.getServicesByCategory('Cloud Services');
          const uniqueTypes = [...new Set(allCloudServices.map(s => s.categoryType.name))];
          setCloudServiceTypes(uniqueTypes);

          const cloudData: {[key: string]: Service[]} = {};
          for (const type of uniqueTypes) {
            const services = allCloudServices.filter(s => s.categoryType.name === type);
            cloudData[type.toLowerCase().replace(' on cloud', '').replace(' ', '')] = services;
          }
          setCloudServices(cloudData);
        } catch (err) {
          console.warn('Failed to load cloud services:', err);
          // Fallback to hardcoded types
          setCloudServiceTypes(['Tally On Cloud', 'Busy On Cloud', 'Marg On Cloud', 'SAP On Cloud', 'Navision On Cloud']);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setServicesLoading(false);
      }
    };

    loadServices();
  }, []);

  // User information form data
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    gstNumber: '',
    address: ''
  });

  const [serverFormData, setServerFormData] = useState({
    serverType: '',
    servicePlan: '',
    serverLocation: 'India',
    billingCycle: 'MONTHLY',
    additionalNotes: ''
  });

  const [cloudFormData, setCloudFormData] = useState({
    cloudService: '',
    servicePlan: '',
    billingCycle: 'MONTHLY',
    additionalNotes: ''
  });

  const handleServerChange = (field: string, value: string) => {
    setServerFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloudChange = (field: string, value: string) => {
    setCloudFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required user info fields
      if (!userInfo.fullName || !userInfo.email || !userInfo.phone) {
        throw new Error('Please fill in all required contact information fields');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found. Please login first.');
      }

      const formData = activeTab === 'servers' ? serverFormData : cloudFormData;
      const serviceType = activeTab === 'servers' ? 'SERVER' : 'CLOUD';

      const payload: any = {
        ...userInfo,
        serviceType,
        servicePlan: formData.servicePlan,
        billingCycle: formData.billingCycle,
        additionalNotes: formData.additionalNotes
      };

      if (activeTab === 'servers') {
        payload.serverLocation = (formData as any).serverLocation;
      }

      await axios.post(`${API_URL}/api/v1/partner/service-requests`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setShowSuccess(true);

      // Reset form
      if (activeTab === 'servers') {
        setServerFormData({
          serverType: '',
          servicePlan: '',
          serverLocation: 'India',
          billingCycle: 'MONTHLY',
          additionalNotes: ''
        });
      } else {
        setCloudFormData({
          cloudService: '',
          servicePlan: '',
          billingCycle: 'MONTHLY',
          additionalNotes: ''
        });
      }
    } catch (err: any) {
      console.error('Service request error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Full error object:', JSON.stringify(err.response?.data, null, 2));
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to submit request';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getServerPlans = (serverType: string) => {
    if (serverType === 'dedicated') {
      return dedicatedServers.map(server =>
        `${server.chip} ${server.processorModel} - ${server.physicalCores}C/${server.logicalVCores}T - ${server.ramGb}GB RAM - ${server.primaryDrive}`
      );
    } else if (serverType === 'vps') {
      return vpsServers.map(server =>
        `${server.availability === 'HIGH_AVAILABILITY' ? 'HA ' : ''}VPS ${server.processorModel} - ${server.logicalVCores} vCPU / ${server.perGbRam}GB RAM / ${server.storage}`
      );
    }
    return [];
  };

  const getCloudPlans = (cloudService: string) => {
    const services = cloudServices[cloudService] || [];
    if (services.length === 0) {
      return ['No plans available - Contact support'];
    }
    return services.map(service => service.name);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Request</h1>
          <p className="mt-2 text-gray-600">Request for server or cloud services</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-1 inline-flex">
            <Button
              variant={activeTab === 'servers' ? 'default' : 'outline'}
              className={activeTab === 'servers' ? 'bg-blue-600 text-white' : 'text-gray-700'}
              onClick={() => setActiveTab('servers')}
            >
              Servers
            </Button>
            <Button
              variant={activeTab === 'cloud' ? 'default' : 'outline'}
              className={activeTab === 'cloud' ? 'bg-blue-600 text-white' : 'text-gray-700'}
              onClick={() => setActiveTab('cloud')}
            >
              Cloud Services
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {servicesLoading && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
              Loading available services...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </Label>
                  <Input
                    type="text"
                    value={userInfo.companyName}
                    onChange={(e) => setUserInfo({...userInfo, companyName: e.target.value})}
                    placeholder="Enter company name (optional)"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </Label>
                  <Input
                    type="text"
                    value={userInfo.gstNumber}
                    onChange={(e) => setUserInfo({...userInfo, gstNumber: e.target.value})}
                    placeholder="Enter GST number (optional)"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </Label>
                  <Input
                    type="text"
                    value={userInfo.address}
                    onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                    placeholder="Enter your address (optional)"
                  />
                </div>
              </div>
            </div>

            {activeTab === 'servers' ? (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Server Service Request</h2>

                {/* Server Type */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Server Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={serverFormData.serverType}
                    onChange={(e) => handleServerChange('serverType', e.target.value)}
                  >
                    <option value="">Select server type</option>
                    <option value="dedicated">Dedicated Server</option>
                    <option value="vps">VPS Server</option>
                  </Select>
                </div>

                {/* Service Plan */}
                {serverFormData.serverType && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Plan <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={serverFormData.servicePlan}
                      onChange={(e) => handleServerChange('servicePlan', e.target.value)}
                    >
                      <option value="">Select service plan</option>
                      {getServerPlans(serverFormData.serverType).map((plan) => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Server Location */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Server Location
                  </Label>
                  <Select
                    value={serverFormData.serverLocation}
                    onChange={(e) => handleServerChange('serverLocation', e.target.value)}
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="Europe">Europe</option>
                  </Select>
                </div>

                {/* Billing Cycle */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={serverFormData.billingCycle}
                    onChange={(e) => handleServerChange('billingCycle', e.target.value)}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </Select>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requirements / Notes
                  </Label>
                  <Textarea
                    value={serverFormData.additionalNotes}
                    onChange={(e) => handleServerChange('additionalNotes', e.target.value)}
                    rows={4}
                    placeholder="Please describe your server requirements..."
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Cloud Service Request</h2>

                {/* Cloud Service */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Cloud Service <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={cloudFormData.cloudService}
                    onChange={(e) => handleCloudChange('cloudService', e.target.value)}
                  >
                    <option value="">Select cloud service</option>
                    {cloudServiceTypes.map((type) => {
                      const value = type.toLowerCase().replace(' on cloud', '').replace(' ', '');
                      return (
                        <option key={value} value={value}>
                          {type}
                        </option>
                      );
                    })}
                  </Select>
                </div>

                {/* Service Plan */}
                {cloudFormData.cloudService && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Plan <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={cloudFormData.servicePlan}
                      onChange={(e) => handleCloudChange('servicePlan', e.target.value)}
                    >
                      <option value="">Select service plan</option>
                      {getCloudPlans(cloudFormData.cloudService).map((plan) => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Billing Cycle */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={cloudFormData.billingCycle}
                    onChange={(e) => handleCloudChange('billingCycle', e.target.value)}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </Select>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requirements / Notes
                  </Label>
                  <Textarea
                    value={cloudFormData.additionalNotes}
                    onChange={(e) => handleCloudChange('additionalNotes', e.target.value)}
                    rows={4}
                    placeholder="Please describe your cloud service requirements..."
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || (activeTab === 'servers' ? !serverFormData.servicePlan : !cloudFormData.servicePlan)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>

        {showSuccess && (
          <SuccessPopup
            isOpen={showSuccess}
            message="Service request submitted successfully! Our team will review and contact you soon."
            onClose={() => setShowSuccess(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceRequest;