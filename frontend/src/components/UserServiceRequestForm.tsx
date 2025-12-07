import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SuccessPopup from "./SuccessPopup";
import { useAuth } from "../hooks/useAuth";

const UserServiceRequestForm = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    gstNumber: "",
    address: "",
    serviceType: "CLOUD",
    servicePlan: "",
    serverLocation: "India",
    billingCycle: "MONTHLY",
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/user/login');
      return;
    }

    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.firstname || prev.fullName,
        email: user.email || prev.email,
        companyName: user.companyName || prev.companyName,
        gstNumber: user.gstNumber || prev.gstNumber,
        address: user.address || prev.address,
      }));
    }
  }, [isAuthenticated, navigate, user]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValidPhone = () => formData.phone.length === 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone()) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forms/service-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit service request');
      }

      setShowSuccessPopup(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        gstNumber: "",
        address: "",
        serviceType: "CLOUD",
        servicePlan: "",
        serverLocation: "India",
        billingCycle: "MONTHLY",
        additionalNotes: "",
      });
    } catch (error) {
      console.error("Service request error:", error);
      alert("Failed to submit service request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.servicePlan;

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Service Request</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company / Business Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* GST Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST No.
            </label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Service Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Plan <span className="text-red-500">*</span>
            </label>
            <select
              name="servicePlan"
              value={formData.servicePlan}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a service plan</option>
              <option value="Basic - 2 vCPU / 2GB RAM / 50GB SSD">Basic - 2 vCPU / 2GB RAM / 50GB SSD</option>
              <option value="Standard - 4 vCPU / 4GB RAM / 100GB SSD">Standard - 4 vCPU / 4GB RAM / 100GB SSD</option>
              <option value="Premium - 8 vCPU / 8GB RAM / 200GB SSD">Premium - 8 vCPU / 8GB RAM / 200GB SSD</option>
            </select>
          </div>

          {/* Server Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Server Location
            </label>
            <select
              name="serverLocation"
              value={formData.serverLocation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="India">India</option>
            </select>
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Cycle <span className="text-red-500">*</span>
            </label>
            <select
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Requirements / Notes
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {showSuccessPopup && (
        <SuccessPopup
          isOpen={showSuccessPopup}
          message="Service request submitted successfully! Our team will review and contact you soon."
          onClose={() => setShowSuccessPopup(false)}
        />
      )}
    </>
  );
};

export default UserServiceRequestForm;