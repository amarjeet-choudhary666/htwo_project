import { Link } from 'react-router-dom';
import { User, Briefcase, ArrowRight } from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Join H2 Technologies
          </h2>
          <p className="text-lg text-gray-600">
            Choose how you'd like to register
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Registration Card */}
          <Link
            to="/user/register"
            className="group bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Register as User
              </h3>
              
              <p className="text-gray-600 mb-6">
                Create a personal account to access our cloud services, hosting solutions, and manage your subscriptions.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>Access to all cloud services</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>Manage your purchases and subscriptions</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <span>24/7 customer support</span>
                </li>
              </ul>

              <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700">
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Partner Registration Card */}
          <Link
            to="/partner/register"
            className="group bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-purple-500 transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Register as Partner
              </h3>
              
              <p className="text-gray-600 mb-6">
                Join our partner program to resell our services, earn commissions, and grow your business with us.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <span>Competitive commission rates</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <span>Dedicated partner dashboard</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <span>Priority technical support</span>
                </li>
              </ul>

              <div className="flex items-center justify-between text-purple-600 font-semibold group-hover:text-purple-700">
                <span>Apply Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
