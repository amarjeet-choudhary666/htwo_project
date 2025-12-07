import { useState } from 'react';
import { Server, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button"; // ShadCN Button
import { FaHeadset } from 'react-icons/fa';
import type { VpsServer } from '@/services/serviceApi';
import PurchaseModal from './PurchaseModal';

interface VPSPricingTableProps {
  vpsServers: VpsServer[];
}

export default function VPSPricingTable({ vpsServers }: VPSPricingTableProps) {
    const [activeTab, setActiveTab] = useState<'HIGH_AVAILABILITY' | 'NON_HIGH_AVAILABILITY'>('NON_HIGH_AVAILABILITY');
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

    const filteredServers = vpsServers.filter(server => server.availability === activeTab);
    const isHA = activeTab === 'HIGH_AVAILABILITY';

    const handleBuyClick = (server: VpsServer) => {
        setPurchaseModal({
            isOpen: true,
            serviceId: server.id.toString(),
            serviceName: `VPS Linux - ${server.processorModel} (${server.perGbRam}GB RAM, ${server.logicalVCores} vCores)`,
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
                    <h1 className="text-4xl font-bold mb-2">VPS Linux Plans</h1>
                    <p className="text-lg text-gray-700">Server Pricing That Makes Sense: Flexible and Predictable</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-100 rounded-lg p-1 inline-flex shadow-sm">
                        <Button
                            variant={activeTab === 'NON_HIGH_AVAILABILITY' ? 'default' : 'outline'}
                            className={activeTab === 'NON_HIGH_AVAILABILITY' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-800 hover:bg-gray-200 hover:text-blue-600'}
                            onClick={() => setActiveTab('NON_HIGH_AVAILABILITY')}
                        >
                            NON-HA SOLUTION
                        </Button>
                        <Button
                            variant={activeTab === 'HIGH_AVAILABILITY' ? 'default' : 'outline'}
                            className={activeTab === 'HIGH_AVAILABILITY' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-800 hover:bg-gray-200 hover:text-blue-600'}
                            onClick={() => setActiveTab('HIGH_AVAILABILITY')}
                        >
                            HIGH AVAILABILITY
                        </Button>
                    </div>
                </div>

                {/* Pricing Table */}
                <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
                    <table className="w-full">
                        <thead className="bg-gray-100 text-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Processor Model</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">RAM (GB)</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Logical vCores</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Storage - SSD/NVME</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Clock Speed</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Bandwidth</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Price/Month</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredServers.map((server) => (
                                <tr key={server.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium">{server.processorModel}</td>
                                    <td className="px-4 py-3 text-sm text-center">{server.perGbRam} GB</td>
                                    <td className="px-4 py-3 text-sm text-center">{server.logicalVCores}</td>
                                    <td className="px-4 py-3 text-sm text-center">{server.storage}</td>
                                    <td className="px-4 py-3 text-sm text-center">{server.clockSpeed} GHz</td>
                                    <td className="px-4 py-3 text-sm text-center">{server.bandwidth} Mbps</td>
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
                        <div>✓ 99.9% Uptime Guarantee</div>
                        <div>✓ 24/7 Technical Support</div>
                        <div>✓ DDoS Protection</div>
                        <div>✓ Full Root Access</div>
                        <div>✓ {isHA ? '15 Days Snapshot Backup' : 'No Backup Snapshot'}</div>
                        <div>✓ Data Center Tier {isHA ? 'IV' : 'III'}</div>
                    </div>
                </div>

                {/* Bottom Note */}
                <section>
                    <div className="text-center mt-12">
                        <h1 className="flex items-center justify-center gap-2 text-lg font-semibold py-3">
                            <FaHeadset className="text-blue-800" />
                            We're Here to Help You
                        </h1>
                        <p className="text-xs">Have some questions?<span className="text-orange-500">Chat with us now,</span>or send us an email to get in touch.</p>
                    </div>
                </section>
            </div>

            <PurchaseModal
                isOpen={purchaseModal.isOpen}
                onClose={() => setPurchaseModal(prev => ({ ...prev, isOpen: false }))}
                serviceId={purchaseModal.serviceId}
                serviceType="VPS"
                serviceName={purchaseModal.serviceName}
                price={purchaseModal.price}
                onPurchaseComplete={handlePurchaseComplete}
            />
        </div>
    );
}