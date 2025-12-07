import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, User, Building, Phone, MapPin, AlertCircle, CheckCircle, Briefcase, ArrowLeft } from 'lucide-react';

export default function PartnerRegister() {
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    businessType: '',
    otherBusinessType: '',
    fullName: '',
    email: '',
    phone: '',
    countryRegion: '',
    estimatedMonthlySales: '',
    hasTechnicalSupport: false,
    partnershipReason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'form'>('email');
  const [otp, setOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailForVerification.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForVerification)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSendingOtp(true);

    try {
      // Check if email is already registered
      const checkResponse = await fetch(`http://localhost:3000/api/v1/partners/check-email?email=${encodeURIComponent(emailForVerification)}`);
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.exists) {
          setError('This email is already registered. Please use a different email.');
          return;
        }
      }

      // Send OTP
      const response = await fetch('http://localhost:3000/api/v1/partners/send-otp', {
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
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpForAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setError('');
    setIsVerifyingOtp(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/partners/verify-email-access', {
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
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Ensure email is verified before allowing registration
    if (!emailForVerification.trim()) {
      setError('Email verification is required. Please verify your email first.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        businessType: formData.businessType,
        otherBusinessType: formData.otherBusinessType || undefined,
        fullName: formData.fullName,
        email: emailForVerification, // Use verified email
        phone: formData.phone,
        countryRegion: formData.countryRegion,
        estimatedMonthlySales: formData.estimatedMonthlySales,
        partnershipReason: formData.partnershipReason || undefined,
        hasTechnicalSupport: formData.hasTechnicalSupport
      };

      console.log('Sending payload:', payload);

      const response = await fetch('http://localhost:3000/api/v1/partners/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Registration error:', data);
        throw new Error(data.message || data.error?.message || 'Failed to register partner');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setEmailForVerification('');
    setError('');
  };

  if (step === 'email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Partner Registration
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              To prevent spam and ensure quality partnerships, we require email verification before you can submit your registration.
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={emailForVerification}
                    onChange={(e) => setEmailForVerification(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="partner@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSendingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit OTP to <strong>{emailForVerification}</strong>
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleVerifyOtpForAccess}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP *
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="appearance-none block w-full text-center text-2xl tracking-widest pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isVerifyingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Verify Email
                    </>
                  )}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Email
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Ensure email verification before showing form
  if (step === 'form' && !emailForVerification.trim()) {
    setStep('email');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Partner Registration Form
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete your partner application
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Partner registration submitted successfully! Your email has been verified and your application is now pending admin approval. Our team will review your application and contact you via email within 24-48 hours.</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address * (Verified)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    disabled
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 bg-gray-50 text-gray-500"
                    placeholder="partner@example.com"
                  />
                </div>
                <p className="text-xs text-green-600 mt-1">✓ Email verified</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  required
                  value={formData.businessType}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Business Type</option>
                  <option value="RESELLER">Reseller</option>
                  <option value="IT_CONSULTANT">IT Consultant</option>
                  <option value="HOSTING_PROVIDER">Hosting Provider</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {formData.businessType === 'OTHER' && (
                <div>
                  <label htmlFor="otherBusinessType" className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Other Business Type *
                  </label>
                  <input
                    id="otherBusinessType"
                    name="otherBusinessType"
                    type="text"
                    required
                    value={formData.otherBusinessType}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Please specify your business type"
                  />
                </div>
              )}

              <div>
                <label htmlFor="countryRegion" className="block text-sm font-medium text-gray-700 mb-2">
                  Country / Region *
                </label>
                <input
                  id="countryRegion"
                  name="countryRegion"
                  type="text"
                  required
                  value={formData.countryRegion}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="India"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="estimatedMonthlySales" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Monthly Sales *
                </label>
                <select
                  id="estimatedMonthlySales"
                  name="estimatedMonthlySales"
                  required
                  value={formData.estimatedMonthlySales}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Range</option>
                  <option value="LESS_THAN_10">Less than 10</option>
                  <option value="BETWEEN_10_50">10–50</option>
                  <option value="BETWEEN_51_200">51–200</option>
                  <option value="MORE_THAN_200">200+</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  id="hasTechnicalSupport"
                  name="hasTechnicalSupport"
                  type="checkbox"
                  checked={formData.hasTechnicalSupport}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="hasTechnicalSupport" className="text-sm text-gray-700">
                  Do you have a technical support team?
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Company Address *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="companyAddress"
                  name="companyAddress"
                  rows={3}
                  required
                  value={formData.companyAddress}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Your company address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="partnershipReason" className="block text-sm font-medium text-gray-700 mb-2">
                Why would you like to become a partner?
              </label>
              <textarea
                id="partnershipReason"
                name="partnershipReason"
                rows={3}
                value={formData.partnershipReason}
                onChange={handleChange}
                className="appearance-none block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Tell us about your interest in partnership..."
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting Application...
                  </>
                ) : success ? (
                  'Success!'
                ) : (
                  <>
                    <Briefcase className="h-5 w-5" />
                    Submit Partner Application
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

