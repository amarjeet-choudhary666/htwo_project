import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import TallyOnCloud from './pages/TallyOnCloud'
import NotFound from './pages/NotFound'
import LifeAtHtwo from './pages/LifeAtHTwo'
import TallyOnAws from './pages/TallyOnAws'
import TallyDemoSection from './pages/TallyPrimeApplication'
import LinuxHostingSection from './pages/LinuxHosting'
import BusyOnCloud from './pages/BusyOnCloud'
import { ThemeProvider } from './contexts/ThemeContext'
import { MargOnCloud } from './pages/MargOnCloud'
import { NavisionOnCloud } from './pages/NavisionOnCloud'
import { CloudForSapBone } from './pages/CloudForSapBOne'
import { WindowsHosting } from './pages/WindowsHosting'
import { VPSLinux } from './pages/VpsLinux'
import { VPSwindows } from './pages/VPSwindows'
import { DedicatedServer } from './pages/DedicatedServer'
import { StorageAsService } from './pages/StorageAsService'
import { BackupAndRecovery } from './pages/BackupAndRecovery'
import { DisasterServiceAsRecovery } from './pages/DisasterServiceAsRecovery'
import { JoinAsPartner } from './pages/JoinAsPartner'
import { GoogleWorkspace } from './pages/GoogleWorkspaces'
import { BusinessEmailZimbra } from './pages/BusinessEmailZimbra'
import UserDashboard from './pages/user/Dashboard'
import UserProfile from './pages/user/Profile'
import PartnerDashboard from './pages/partner/Dashboard'
import PartnerProfile from './pages/partner/Profile'
import PartnerServiceRequest from './pages/partner/ServiceRequest'
import PartnerServiceRequests from './pages/partner/ServiceRequests'
import PartnerUsers from './pages/partner/Users'
import PublicLayout from './components/PublicLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import UserRegister from './pages/auth/UserRegister'
import PartnerRegister from './pages/auth/PartnerRegister'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import { useAuth } from './hooks/useAuth'
import UserLayout from './components/UserLayout'
import PartnerLayout from './components/PartnerLayout'

function App() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <ScrollToTop />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'PARTNER' ? '/partner/dashboard' : '/user/dashboard'} replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={user?.role === 'PARTNER' ? '/partner/dashboard' : '/user/dashboard'} replace />} />
          <Route path="/user/register" element={!isAuthenticated ? <UserRegister /> : <Navigate to="/user/dashboard" replace />} />
          <Route path="/partner/register" element={!isAuthenticated ? <PartnerRegister /> : <Navigate to="/partner/dashboard" replace />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to={user?.role === 'PARTNER' ? '/partner/dashboard' : '/user/dashboard'} replace />} />
          <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to={user?.role === 'PARTNER' ? '/partner/dashboard' : '/user/dashboard'} replace />} />

          {/* User Dashboard Routes */}
          <Route
            path="/user/dashboard"
            element={
              isAuthenticated ? (
                user?.role === 'USER' ? (
                  <UserLayout><UserDashboard /></UserLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* User Profile Route */}
          <Route
            path="/user/profile"
            element={
              isAuthenticated ? (
                user?.role === 'USER' ? (
                  <UserLayout><UserProfile /></UserLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Partner Dashboard Routes */}
          <Route
            path="/partner/dashboard"
            element={
              isAuthenticated ? (
                user?.role === 'PARTNER' ? (
                  <PartnerLayout><PartnerDashboard /></PartnerLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Partner Profile Route */}
          <Route
            path="/partner/profile"
            element={
              isAuthenticated ? (
                user?.role === 'PARTNER' ? (
                  <PartnerLayout><PartnerProfile /></PartnerLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Partner Service Request Route */}
          <Route
            path="/partner/service-request"
            element={
              isAuthenticated ? (
                user?.role === 'PARTNER' ? (
                  <PartnerLayout><PartnerServiceRequest /></PartnerLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Partner Service Requests Status Route */}
          <Route
            path="/partner/service-requests"
            element={
              isAuthenticated ? (
                user?.role === 'PARTNER' ? (
                  <PartnerLayout><PartnerServiceRequests /></PartnerLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Partner Users Route */}
          <Route
            path="/partner/users"
            element={
              isAuthenticated ? (
                user?.role === 'PARTNER' ? (
                  <PartnerLayout><PartnerUsers /></PartnerLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/tally-on-cloud" element={<PublicLayout><TallyOnCloud /></PublicLayout>} />
          <Route path="/get-in-touch" element={<PublicLayout><LifeAtHtwo /></PublicLayout>} />
          <Route path="/tally-on-aws" element={<PublicLayout><TallyOnAws /></PublicLayout>} />
          <Route path="/tally-prime-application" element={<PublicLayout><TallyDemoSection /></PublicLayout>} />
          <Route path="/busy-on-cloud" element={<PublicLayout><BusyOnCloud /></PublicLayout>} />
          <Route path="/linuxhosting" element={<PublicLayout><LinuxHostingSection /></PublicLayout>} />
          <Route path="/marg-on-cloud" element={<PublicLayout><MargOnCloud /></PublicLayout>} />
          <Route path="/navision-on-cloud" element={<PublicLayout><NavisionOnCloud /></PublicLayout>} />
          <Route path="/sap-s4-hana-on-cloud" element={<PublicLayout><CloudForSapBone /></PublicLayout>} />
          <Route path="/windowshosting" element={<PublicLayout><WindowsHosting /></PublicLayout>} />
          <Route path="/vpslinux" element={<PublicLayout><VPSLinux /></PublicLayout>} />
          <Route path="/vpswindows" element={<PublicLayout><VPSwindows /></PublicLayout>} />
          <Route path="/dedicated-server" element={<PublicLayout><DedicatedServer /></PublicLayout>} />
          <Route path="/storage-as-a-service" element={<PublicLayout><StorageAsService /></PublicLayout>} />
          <Route path="/backup-recovery" element={<PublicLayout><BackupAndRecovery /></PublicLayout>} />
          <Route path="/disaster-recovery-as-a-service" element={<PublicLayout><DisasterServiceAsRecovery /></PublicLayout>} />
          <Route path="/join-as-a-partner" element={<PublicLayout><JoinAsPartner /></PublicLayout>} />
          <Route path="/email" element={<PublicLayout><GoogleWorkspace /></PublicLayout>} />
          <Route path="/email/business-zimbra" element={<PublicLayout><BusinessEmailZimbra /></PublicLayout>} />

          {/* 404 Route */}
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
