import { useState, useContext } from 'react';
import { X, CreditCard, CheckCircle, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AuthContext } from "@/contexts/AuthContext";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceType: 'VPS' | 'DEDICATED' | 'CLOUD';
  serviceName: string;
  price: number;
  yearlyPrice?: number;
  onPurchaseComplete?: (purchase: any) => void;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  serviceId,
  serviceType,
  serviceName,
  price,
  onPurchaseComplete
}: PurchaseModalProps) {
  const { isAuthenticated } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    billingCycle: 'monthly',
    paymentMethod: 'card',
    domain: '',
    specialInstructions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          serviceId,
          serviceType,
          amount: formData.billingCycle === 'yearly' ? price * 12 * 0.9 : price,
          paymentMethod: formData.paymentMethod,
          billingCycle: formData.billingCycle,
          domain: formData.domain || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (onPurchaseComplete) {
          onPurchaseComplete(data.data);
        }
      } else {
        alert(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSuccess(false);
    setFormData({
      billingCycle: 'monthly',
      paymentMethod: 'card',
      domain: '',
      specialInstructions: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Login Required</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center">
              <LogIn className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                You need to be logged in to purchase services. Please log in to continue with your purchase.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.href = '/auth/login'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {success ? 'Purchase Successful!' : 'Complete Your Purchase'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {success ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Your purchase has been completed successfully! An invoice has been generated and sent to your email.
              </p>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Service Details</h3>
                <p className="text-sm text-gray-600">Service: {serviceName}</p>
                <p className="text-sm text-gray-600">Type: {serviceType}</p>
                <p className="text-lg font-bold text-blue-600">₹{price.toLocaleString()}</p>
              </div>

              {/* Billing Cycle */}
              <div>
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <Select
                  id="billingCycle"
                  value={formData.billingCycle}
                  onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly (Save 10%)</option>
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Digital Wallet</option>
                </Select>
              </div>

              {/* Domain (optional) */}
              <div>
                <Label htmlFor="domain">Domain Name (Optional)</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="yourdomain.com"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                />
              </div>

              {/* Special Instructions */}
              <div>
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <textarea
                  id="specialInstructions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any special requirements or instructions..."
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                />
              </div>

              {/* Total */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₹{formData.billingCycle === 'yearly' ? (price * 12 * 0.9).toLocaleString() : price.toLocaleString()}
                    {formData.billingCycle === 'yearly' && <span className="text-sm text-green-600 ml-1">(10% off)</span>}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}