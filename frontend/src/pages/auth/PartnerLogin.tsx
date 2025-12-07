import { Link } from 'react-router-dom';
import { UserPlus, Briefcase } from 'lucide-react';
import PartnerSignInForm from '../../components/PartnerSignInForm';

export default function PartnerLogin() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Partner Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your partner account
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
          <PartnerSignInForm />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New partner?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/partner/register"
                className="inline-flex items-center gap-2 font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Register as Partner
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}