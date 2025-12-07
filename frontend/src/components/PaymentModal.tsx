import { useState } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { purchaseApi } from '../services/purchaseApi';
import { useAuth } from '../hooks/useAuth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: number;
    name: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
  };
}

export default function PaymentModal({ isOpen, onClose, service }: PaymentModalProps) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const amount = billingCycle === 'monthly' 
    ? service.monthlyPrice || 0 
    : service.yearlyPrice || 0;

  const gst = amount * 0.18;
  const total = amount + gst;

  const handlePayment = async () => {
    if (!isAuthenticated) {
      setError('Please login to purchase services');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await purchaseApi.createPurchase(
        service.id,
        'CLOUD',
        total,
        'dummy'
      );

      setSuccess(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        // Redirect to dashboard
        window.location.href = '/user/dashboard';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            Your invoice has been generated and will be available in your dashboard.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Complete Purchase</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Service Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{service.name}</p>
            </div>
          </div>

          {/* Billing Cycle */}
          {service.yearlyPrice && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Cycle</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    billingCycle === 'monthly'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Monthly</p>
                  <p className="text-sm text-gray-600">₹{service.monthlyPrice}/mo</p>
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    billingCycle === 'yearly'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Yearly</p>
                  <p className="text-sm text-gray-600">₹{service.yearlyPrice}/yr</p>
                </button>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ₹{total.toFixed(2)}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            This is a dummy payment. No actual charges will be made.
          </p>
        </div>
      </div>
    </div>
  );
}
