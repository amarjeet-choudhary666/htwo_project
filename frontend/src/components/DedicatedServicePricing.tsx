import { useState } from 'react';
import { Server, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button"; // ShadCN Button
import type { DedicatedServer } from '@/services/serviceApi';
import PurchaseModal from './PurchaseModal';

interface DedicatedServerPricingProps {
  dedicatedServers: DedicatedServer[];
}

export default function DedicatedServerPricing({ dedicatedServers }: DedicatedServerPricingProps) {
  const [activeTab, setActiveTab] = useState<'AMD' | 'INTEL'>('AMD');
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    serviceId: string;
    serviceName: string;
    price: number;
  }>({
    isOpen: false,
    serviceId: '',
    serviceName: '',
    price: 0
  });

  const filteredServers = dedicatedServers.filter(server => server.chip === activeTab);

  const handleBuyClick = (server: DedicatedServer) => {
    setPurchaseModal({
      isOpen: true,
      serviceId: server.id,
      serviceName: `Dedicated Server - ${server.processorModel} (${server.ramGb}GB RAM, ${server.physicalCores} Cores)`,
      price: server.pricePerMonth
    });
  };

  const handlePurchaseComplete = (purchase: any) => {
    console.log('Purchase completed:', purchase);
    // You can add success handling here, like showing a success message or redirecting
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Server className="w-12 h-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold mb-2">Dedicated Server Plans</h1>
          <p className="text-lg text-gray-700">Server Pricing That Makes Sense: Flexible and Predictable</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex shadow-sm">
            <Button
              variant={activeTab === 'AMD' ? 'default' : 'outline'}
              className={activeTab === 'AMD' ? 'bg-blue-600 text-white' : 'text-gray-800'}
              onClick={() => setActiveTab('AMD')}
            >
              AMD EPYC Servers
            </Button>
            <Button
              variant={activeTab === 'INTEL' ? 'default' : 'outline'}
              className={activeTab === 'INTEL' ? 'bg-blue-600 text-white' : 'text-gray-800'}
              onClick={() => setActiveTab('INTEL')}
            >
              Intel Xeon Servers
            </Button>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Processor Model</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Physical Cores</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Logical vCores</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Clock Speed</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">RAM (GB)<br/>2999 MHz</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Primary Drive</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Secondary Drive</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">RAID Card</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Price/Month</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServers.map((server) => (
                <tr key={server.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{server.processorModel}</td>
                  <td className="px-4 py-3 text-sm text-center">{server.physicalCores}C</td>
                  <td className="px-4 py-3 text-sm text-center">{server.logicalVCores}T</td>
                  <td className="px-4 py-3 text-sm text-center">{server.clockSpeed}</td>
                  <td className="px-4 py-3 text-sm text-center">{server.ramGb} GB</td>
                  <td className="px-4 py-3 text-sm text-center">{server.primaryDrive}</td>
                  <td className="px-4 py-3 text-sm text-center">{server.secondaryDrive || 'Add-On'}</td>
                  <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">{server.raidCard || 'Included'}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-blue-700">₹ {server.pricePerMonth}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                        onClick={() => handleBuyClick(server)}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Buy Now
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Features Footer */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Plans Include:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-800">
            <div>✓ RAID Card Included</div>
            <div>✓ Secondary Drive Add-On Available</div>
            <div>✓ 99.9% Uptime Guarantee</div>
            <div>✓ 24/7 Technical Support</div>
            <div>✓ DDoS Protection</div>
            <div>✓ Full Root Access</div>
          </div>
        </div>

        <PurchaseModal
          isOpen={purchaseModal.isOpen}
          onClose={() => setPurchaseModal(prev => ({ ...prev, isOpen: false }))}
          serviceId={purchaseModal.serviceId}
          serviceType="DEDICATED"
          serviceName={purchaseModal.serviceName}
          price={purchaseModal.price}
          onPurchaseComplete={handlePurchaseComplete}
        />
      </div>
    </div>
  );
}
