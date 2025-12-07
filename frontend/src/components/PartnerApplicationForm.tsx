import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import SuccessPopup from "./SuccessPopup";


interface PartnerFormData {
  // Company Information
  companyName: string;
  companyAddress: string;
  gstNumber: string;
  businessType: string;
  otherBusinessType: string;

  // Contact Information
  fullName: string;
  email: string;
  phone: string;
  countryRegion: string;

  // Estimated Monthly Sales / Leads
  estimatedMonthlySales: string;

  // Technical Support
  hasTechnicalSupport: boolean;

  // Optional Reason
  partnershipReason: string;
}

const PartnerApplicationForm = () => {
  const [formData, setFormData] = useState<PartnerFormData>({
    companyName: "",
    companyAddress: "",
    gstNumber: "",
    businessType: "",
    otherBusinessType: "",
    fullName: "",
    email: "",
    phone: "",
    countryRegion: "",
    estimatedMonthlySales: "",
    hasTechnicalSupport: false,
    partnershipReason: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'form'>('email');
  const [otp, setOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const canSubmit = () => {
    return (
      formData.companyName &&
      formData.companyAddress &&
      formData.businessType &&
      formData.fullName &&
      formData.email &&
      formData.phone &&
      formData.countryRegion &&
      formData.estimatedMonthlySales
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        email: emailForVerification, // Use the verified email
        estimatedMonthlySales: formData.estimatedMonthlySales.toUpperCase().replace(/ /g, '_'),
      };

      const response = await fetch('/api/v1/partners/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit registration');
      }

      setShowSuccessPopup(true);
      setFormData({
        companyName: "",
        companyAddress: "",
        gstNumber: "",
        businessType: "",
        otherBusinessType: "",
        fullName: "",
        email: "",
        phone: "",
        countryRegion: "",
        estimatedMonthlySales: "",
        hasTechnicalSupport: false,
        partnershipReason: "",
      });
      setStep('email');
      setEmailForVerification('');
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailForVerification.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForVerification)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSendingOtp(true);

    try {
      // Check if email is already registered
      const checkResponse = await fetch(`/api/v1/partners/check-email?email=${encodeURIComponent(emailForVerification)}`);
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.exists) {
          alert('This email is already registered. Please use a different email.');
          return;
        }
      }

      // Send OTP
      const response = await fetch('/api/v1/partners/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForVerification }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      const responseData = await response.json();

      // Show OTP from response if email failed (for development)
      if (responseData.data?.otp) {
        alert(`OTP sent to your email. For testing: ${responseData.data.otp}`);
      }

      setStep('otp');
    } catch (error) {
      console.error("Send OTP error:", error);
      alert(error instanceof Error ? error.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpForAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      alert('Please enter the OTP');
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = await fetch('/api/v1/partners/verify-email-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailForVerification,
          otp: otp.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify OTP');
      }

      // Pre-fill the email in form data
      setFormData(prev => ({ ...prev, email: emailForVerification }));
      setStep('form');
      setOtp('');
    } catch (error) {
      console.error("OTP verification error:", error);
      alert(error instanceof Error ? error.message : "Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setEmailForVerification('');
  };



  if (step === 'email') {
    return (
      <div className="w-full max-w-md bg-white text-black p-6 rounded-xl shadow-lg mx-auto font-poppins">
        <h2 className="text-2xl font-bold mb-6 text-center">Partner Registration</h2>
        <p className="text-center text-gray-600 mb-6">
          To prevent spam and ensure quality partnerships, we require email verification before you can submit your registration.
        </p>

        <form className="space-y-6" onSubmit={handleSendOtp}>
          <div>
            <Label className="text-sm font-medium">Email Address *</Label>
            <Input
              type="email"
              value={emailForVerification}
              onChange={(e) => setEmailForVerification(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <Button type="submit" disabled={isSendingOtp} className="w-full bg-blue-600 text-white">
            {isSendingOtp ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="w-full max-w-md bg-white text-black p-6 rounded-xl shadow-lg mx-auto font-poppins">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
        <p className="text-center text-gray-600 mb-6">
          We've sent a 6-digit OTP to <strong>{emailForVerification}</strong>
        </p>

        <form className="space-y-6" onSubmit={handleVerifyOtpForAccess}>
          <div>
            <Label className="text-sm font-medium">Enter OTP *</Label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              required
            />
          </div>

          <Button type="submit" disabled={isVerifyingOtp || otp.length !== 6} className="w-full bg-blue-600 text-white">
            {isVerifyingOtp ? "Verifying..." : "Verify Email"}
          </Button>

          <Button type="button" onClick={handleBackToEmail} variant="outline" className="w-full">
            Back to Email
          </Button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl bg-white text-black p-6 rounded-xl shadow-lg mx-auto font-poppins">
        <h2 className="text-2xl font-bold mb-6 text-center">Partner Registration Form</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Company Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Company Name *</Label>
                <Input name="companyName" value={formData.companyName} onChange={handleChange} required />
              </div>
              <div>
                <Label className="text-sm font-medium">Company Address *</Label>
                <Input name="companyAddress" value={formData.companyAddress} onChange={handleChange} required />
              </div>
              <div>
                <Label className="text-sm font-medium">GST Number</Label>
                <Input name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Business Type *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reseller"
                      name="businessType"
                      value="RESELLER"
                      checked={formData.businessType === "RESELLER"}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="reseller" className="text-sm">Reseller</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="it-consultant"
                      name="businessType"
                      value="IT_CONSULTANT"
                      checked={formData.businessType === "IT_CONSULTANT"}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="it-consultant" className="text-sm">IT Consultant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="hosting-provider"
                      name="businessType"
                      value="HOSTING_PROVIDER"
                      checked={formData.businessType === "HOSTING_PROVIDER"}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="hosting-provider" className="text-sm">Hosting Provider</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="other"
                      name="businessType"
                      value="OTHER"
                      checked={formData.businessType === "OTHER"}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="other" className="text-sm">Other:</Label>
                    <Input
                      name="otherBusinessType"
                      value={formData.otherBusinessType}
                      onChange={handleChange}
                      placeholder="Specify other business type"
                      className="flex-1"
                      disabled={formData.businessType !== "OTHER"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Full Name *</Label>
                <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div>
                <Label className="text-sm font-medium">Email Address * (Verified)</Label>
                <Input name="email" type="email" value={formData.email} disabled className="bg-gray-100" />
                <p className="text-xs text-gray-500 mt-1">Email verified ✓</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone Number *</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div>
                <Label className="text-sm font-medium">Country / Region *</Label>
                <Input name="countryRegion" value={formData.countryRegion} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Estimated Monthly Sales / Leads */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Estimated Monthly Sales / Leads</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="less-than-10"
                  name="estimatedMonthlySales"
                  value="LESS_THAN_10"
                  checked={formData.estimatedMonthlySales === "LESS_THAN_10"}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="less-than-10" className="text-sm">{"<10"}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="10-50"
                  name="estimatedMonthlySales"
                  value="BETWEEN_10_50"
                  checked={formData.estimatedMonthlySales === "BETWEEN_10_50"}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="10-50" className="text-sm">10–50</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="51-200"
                  name="estimatedMonthlySales"
                  value="BETWEEN_51_200"
                  checked={formData.estimatedMonthlySales === "BETWEEN_51_200"}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="51-200" className="text-sm">51–200</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="200-plus"
                  name="estimatedMonthlySales"
                  value="MORE_THAN_200"
                  checked={formData.estimatedMonthlySales === "MORE_THAN_200"}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="200-plus" className="text-sm">200+</Label>
              </div>
            </div>
          </div>

          {/* Technical Support */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Technical Support</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasTechnicalSupport"
                checked={formData.hasTechnicalSupport}
                onCheckedChange={(checked) => handleCheckboxChange('hasTechnicalSupport', checked as boolean)}
              />
              <Label htmlFor="hasTechnicalSupport" className="text-sm">Do you have a technical support team?</Label>
            </div>
          </div>

          {/* Partnership Reason */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Partnership Reason</h3>
            <div>
              <Label className="text-sm font-medium">Why would you like to become a partner? (Optional)</Label>
              <Textarea name="partnershipReason" value={formData.partnershipReason} onChange={handleChange} rows={3} />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || !canSubmit()} className="w-full bg-blue-600 text-white">
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </Button>
        </form>
      </div>

      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Registration Submitted Successfully!"
        message="Thank you for verifying your email. Your partner registration is now pending admin approval. We will review your application and get back to you within 24-48 hours."
      />
    </>
  );
};

export default PartnerApplicationForm;