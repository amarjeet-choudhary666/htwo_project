import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import type { DedicatedServer } from '../types/admin';


interface VpsServer {
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

interface VpsServerFormData {
  os: 'LINUX' | 'WINDOWS';
  availability: 'HIGH_AVAILABILITY' | 'NON_HIGH_AVAILABILITY';
  processorModel: string;
  perGbRam: string;
  logicalVCores: string;
  storage: string;
  clockSpeed: string;
  bandwidth: string;
  pricePerMonth: string;
}

const Servers = () => {
  const [activeTab, setActiveTab] = useState<'vps' | 'dedicated'>('vps');
  const [vpsServers, setVpsServers] = useState<VpsServer[]>([]);
  const [dedicatedServers, setDedicatedServers] = useState<DedicatedServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [vpsLoading, setVpsLoading] = useState(false);
  const [dedicatedLoading, setDedicatedLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingServer, setEditingServer] = useState<VpsServer | null>(null);
  const [editingDedicatedServer, setEditingDedicatedServer] = useState<DedicatedServer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<VpsServerFormData>({
    os: 'LINUX',
    availability: 'HIGH_AVAILABILITY',
    processorModel: '',
    perGbRam: '',
    logicalVCores: '',
    storage: '',
    clockSpeed: '',
    bandwidth: '',
    pricePerMonth: ''
  });

  const [dedicatedFormData, setDedicatedFormData] = useState({
    chip: 'AMD' as 'AMD' | 'INTEL',
    processorModel: '',
    physicalCores: '',
    logicalVCores: '',
    clockSpeed: '',
    ramGb: '',
    primaryDrive: '',
    secondaryDrive: '',
    raidCard: '',
    pricePerMonth: ''
  });

  useEffect(() => {
    if (activeTab === 'vps') {
      fetchVpsServers();
    } else {
      fetchDedicatedServers();
    }
  }, [searchTerm, activeTab]);

  const handleTabChange = (tab: 'vps' | 'dedicated') => {
    setActiveTab(tab);
  };

  const fetchVpsServers = async () => {
    try {
      setVpsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/v1/admin/vps-servers?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setVpsServers(data.data.vpsServers);
      }
    } catch (error) {
      console.error('Error fetching VPS servers:', error);
    } finally {
      setVpsLoading(false);
      setLoading(false);
    }
  };

  const fetchDedicatedServers = async () => {
    try {
      setDedicatedLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/v1/admin/dedicated-servers?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setDedicatedServers(data.data.dedicatedServers);
      }
    } catch (error) {
      console.error('Error fetching dedicated servers:', error);
    } finally {
      setDedicatedLoading(false);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingServer
        ? `/api/v1/admin/vps-servers/${editingServer.id}`
        : '/api/v1/admin/vps-servers';

      const method = editingServer ? 'PUT' : 'POST';

      const requestData = {
        ...formData,
        perGbRam: parseInt(formData.perGbRam),
        logicalVCores: parseInt(formData.logicalVCores),
        clockSpeed: parseFloat(formData.clockSpeed),
        bandwidth: parseInt(formData.bandwidth),
        pricePerMonth: parseFloat(formData.pricePerMonth)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingServer(null);
        resetForm();
        fetchVpsServers();
      } else {
        alert(data.message || 'Error saving VPS server');
      }
    } catch (error) {
      console.error('Error saving VPS server:', error);
      alert('Error saving VPS server');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (server: VpsServer) => {
    setEditingServer(server);
    setFormData({
      os: server.os,
      availability: server.availability,
      processorModel: server.processorModel,
      perGbRam: server.perGbRam.toString(),
      logicalVCores: server.logicalVCores.toString(),
      storage: server.storage,
      clockSpeed: server.clockSpeed.toString(),
      bandwidth: server.bandwidth.toString(),
      pricePerMonth: server.pricePerMonth.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this VPS server?')) return;

    try {
      const response = await fetch(`/api/v1/admin/vps-servers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        fetchVpsServers();
      } else {
        alert(data.message || 'Error deleting VPS server');
      }
    } catch (error) {
      console.error('Error deleting VPS server:', error);
      alert('Error deleting VPS server');
    }
  };

  const resetForm = () => {
    setFormData({
      os: 'LINUX',
      availability: 'HIGH_AVAILABILITY',
      processorModel: '',
      perGbRam: '',
      logicalVCores: '',
      storage: '',
      clockSpeed: '',
      bandwidth: '',
      pricePerMonth: ''
    });
  };

  const resetDedicatedForm = () => {
    setDedicatedFormData({
      chip: 'AMD',
      processorModel: '',
      physicalCores: '',
      logicalVCores: '',
      clockSpeed: '',
      ramGb: '',
      primaryDrive: '1x3.84 TB SSD',
      secondaryDrive: '',
      raidCard: '',
      pricePerMonth: ''
    });
  };

  const handleDedicatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingDedicatedServer
        ? `/api/v1/admin/dedicated-servers/${editingDedicatedServer.id}`
        : '/api/v1/admin/dedicated-servers';

      const method = editingDedicatedServer ? 'PUT' : 'POST';

      const requestData = {
        ...dedicatedFormData,
        physicalCores: parseInt(dedicatedFormData.physicalCores),
        logicalVCores: parseInt(dedicatedFormData.logicalVCores),
        ramGb: parseInt(dedicatedFormData.ramGb),
        pricePerMonth: parseFloat(dedicatedFormData.pricePerMonth)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingDedicatedServer(null);
        resetDedicatedForm();
        fetchDedicatedServers();
      } else {
        alert(data.message || 'Error saving dedicated server');
      }
    } catch (error) {
      console.error('Error saving dedicated server:', error);
      alert('Error saving dedicated server');
    } finally {
      setLoading(false);
    }
  };

  const handleDedicatedEdit = (server: DedicatedServer) => {
    setEditingDedicatedServer(server);
    setDedicatedFormData({
      chip: server.chip,
      processorModel: server.processorModel,
      physicalCores: server.physicalCores.toString(),
      logicalVCores: server.logicalVCores.toString(),
      clockSpeed: server.clockSpeed,
      ramGb: server.ramGb.toString(),
      primaryDrive: server.chip === 'AMD' ? '1x3.84 TB SSD' : server.primaryDrive,
      secondaryDrive: server.secondaryDrive || '',
      raidCard: server.raidCard || '',
      pricePerMonth: server.pricePerMonth.toString()
    });
    setShowForm(true);
  };


  if ((activeTab === 'vps' && vpsLoading && vpsServers.length === 0) ||
      (activeTab === 'dedicated' && dedicatedLoading && dedicatedServers.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading {activeTab === 'vps' ? 'VPS' : 'dedicated'} servers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Servers Management</h1>
        <button
          onClick={() => {
            if (activeTab === 'vps') {
              resetForm();
              setEditingServer(null);
            } else {
              resetDedicatedForm();
              setEditingDedicatedServer(null);
            }
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add {activeTab === 'vps' ? 'VPS' : 'Dedicated'} Server
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('vps')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'vps'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              VPS Servers
              {vpsLoading && <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>}
            </button>
            <button
              onClick={() => handleTabChange('dedicated')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'dedicated'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dedicated Servers
              {dedicatedLoading && <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>}
            </button>
          </nav>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search servers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Servers List */}
      {activeTab === 'vps' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RAM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    vCores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Storage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Speed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bandwidth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vpsServers.map((server) => (
                  <tr key={server.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        server.os === 'LINUX'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {server.os}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.processorModel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.perGbRam} GB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.logicalVCores}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.storage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.clockSpeed} GHz
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.bandwidth} Mbps
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        server.availability === 'HIGH_AVAILABILITY'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {server.availability === 'HIGH_AVAILABILITY' ? 'High' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{server.pricePerMonth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(server)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(server.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RAM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary Drive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dedicatedServers.map((server) => (
                  <tr key={server.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        server.chip === 'AMD'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {server.chip}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.processorModel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.physicalCores}P / {server.logicalVCores}L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.ramGb} GB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {server.primaryDrive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{server.pricePerMonth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDedicatedEdit(server)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Server Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {activeTab === 'vps'
                  ? (editingServer ? 'Edit VPS Server' : 'Add New VPS Server')
                  : (editingDedicatedServer ? 'Edit Dedicated Server' : 'Add New Dedicated Server')
                }
              </h3>

              {activeTab === 'vps' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OS *
                      </label>
                      <select
                        required
                        value={formData.os}
                        onChange={(e) => setFormData(prev => ({ ...prev, os: e.target.value as 'LINUX' | 'WINDOWS' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="LINUX">Linux</option>
                        <option value="WINDOWS">Windows</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability *
                      </label>
                      <select
                        required
                        value={formData.availability}
                        onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value as 'HIGH_AVAILABILITY' | 'NON_HIGH_AVAILABILITY' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="HIGH_AVAILABILITY">High Availability</option>
                        <option value="NON_HIGH_AVAILABILITY">Non-High Availability</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processor Model *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.processorModel}
                        onChange={(e) => setFormData(prev => ({ ...prev, processorModel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Per GB RAM *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.perGbRam}
                        onChange={(e) => setFormData(prev => ({ ...prev, perGbRam: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logical vCores *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.logicalVCores}
                        onChange={(e) => setFormData(prev => ({ ...prev, logicalVCores: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Storage *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.storage}
                        onChange={(e) => setFormData(prev => ({ ...prev, storage: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Clock Speed (GHz) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.clockSpeed}
                        onChange={(e) => setFormData(prev => ({ ...prev, clockSpeed: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bandwidth
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.bandwidth}
                        onChange={(e) => setFormData(prev => ({ ...prev, bandwidth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Month *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.pricePerMonth}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricePerMonth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingServer(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                      {loading ? 'Saving...' : (editingServer ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleDedicatedSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chip *
                      </label>
                      <select
                        required
                        value={dedicatedFormData.chip}
                        onChange={(e) => {
                          const newChip = e.target.value as 'AMD' | 'INTEL';
                          setDedicatedFormData(prev => ({
                            ...prev,
                            chip: newChip,
                            primaryDrive: newChip === 'AMD' ? '1x3.84 TB SSD' : prev.primaryDrive
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="AMD">AMD</option>
                        <option value="INTEL">Intel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processor Model *
                      </label>
                      <input
                        type="text"
                        required
                        value={dedicatedFormData.processorModel}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, processorModel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Physical Cores *
                      </label>
                      <input
                        type="number"
                        required
                        value={dedicatedFormData.physicalCores}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, physicalCores: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logical vCores *
                      </label>
                      <input
                        type="number"
                        required
                        value={dedicatedFormData.logicalVCores}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, logicalVCores: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Clock Speed *
                      </label>
                      <input
                        type="text"
                        required
                        value={dedicatedFormData.clockSpeed}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, clockSpeed: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RAM (GB) 2999 MHz *
                      </label>
                      <input
                        type="number"
                        required
                        value={dedicatedFormData.ramGb}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, ramGb: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        1x3.84 TB SSD
                      </label>
                      <input
                        type="text"
                        required
                        value={dedicatedFormData.primaryDrive}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, primaryDrive: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter primary drive specification"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Drive
                      </label>
                      <input
                        type="text"
                        value={dedicatedFormData.secondaryDrive}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, secondaryDrive: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RAID CARD
                      </label>
                      <input
                        type="text"
                        value={dedicatedFormData.raidCard}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, raidCard: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per month *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={dedicatedFormData.pricePerMonth}
                        onChange={(e) => setDedicatedFormData(prev => ({ ...prev, pricePerMonth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingDedicatedServer(null);
                        resetDedicatedForm();
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
                      {loading ? 'Saving...' : (editingDedicatedServer ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servers;