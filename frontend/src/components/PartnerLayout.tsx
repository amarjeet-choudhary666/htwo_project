import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  LogOut,
  Menu,
  X,
  Briefcase,
  FileText,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface PartnerLayoutProps {
  children: ReactNode;
}

export default function PartnerLayout({ children }: PartnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'My Clients', href: '/partner/users', icon: Users },
    { name: 'Service Request', href: '/partner/service-request', icon: FileText },
    { name: 'My Requests', href: '/partner/service-requests', icon: FileText },
    { name: 'Profile', href: '/partner/profile', icon: UserCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-white" />
              <span className="text-xl font-bold text-white">Partner Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r shadow-sm">
          <div className="flex items-center h-16 px-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
            <Briefcase className="h-6 w-6 text-white mr-2" />
            <span className="text-xl font-bold text-white">Partner Portal</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center mb-4 px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                  {user?.firstname?.charAt(0) || 'P'}
                </div>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">{user?.firstname || 'Partner'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center flex-1 px-4">
            <Briefcase className="h-6 w-6 text-purple-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">Partner Portal</span>
          </div>
        </div>
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
