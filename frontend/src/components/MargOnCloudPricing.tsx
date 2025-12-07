import { Button } from "@/components/ui/button";
import {
  Users,
  Database,
  Cpu,
  Shield,
  Download,
  Globe,
  Settings,
  Key,
  Link,
  Lock,
  Server,
  Zap,
  Printer,
  UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { serviceApi, type Service } from "../services/serviceApi";

export function MargOnCloudPricingSection() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetchedServices = await serviceApi.getServicesByCategoryAndType('Cloud Services', 'Marg On Cloud');
        setServices(fetchedServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const plans = services.map((service) => ({
    title: service.name,
    users: service.description || "N/A",
    storage: service.storage,
    ram: service.ram,
    features: service.features.map((feature, index) => {
      const icons = [Shield, Download, UserCheck, Printer, Database, Globe, Users, Settings, Lock, Link, Key, Server, Zap];
      return { icon: icons[index % icons.length], text: feature };
    }),
    logo: "/logos/" + service.name.split(' - ')[1].toLowerCase() + "-logo.png",
  }));

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pricing plans...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || services.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-red-600">Failed to load pricing plans. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              {/* Plan Header */}
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.title}</h3>
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{plan.users}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">{plan.storage}</span>
                  <span className="mx-1">•</span>
                  <Cpu className="w-4 h-4" />
                  <span className="text-sm">{plan.ram}</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="flex-1 space-y-3">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      <feature.icon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature.text}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Client Logo */}
              <div className="mt-6 flex justify-center items-center py-3 border-t border-gray-100">
                <img
                  src={plan.logo}
                  alt={`${plan.title} client logo`}
                  className="h-8 object-contain opacity-80"
                />
              </div>

              {/* CTA Buttons */}
              <div className="mt-4 text-center space-y-2">
                <div>
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                    onClick={() => navigate('/get-in-touch')}
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}