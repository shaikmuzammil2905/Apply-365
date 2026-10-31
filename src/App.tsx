import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BackToTop } from './components/BackToTop';
import { QuickEnquiryModal } from './components/QuickEnquiryModal';
import { PhoneCall } from 'lucide-react';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AllServicesPage } from './pages/AllServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { DocumentsRequiredPage } from './pages/DocumentsRequiredPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ApplyPage } from './pages/ApplyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

// Customer Auth & Portal Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { CustomerDashboardPage } from './pages/dashboard/CustomerDashboardPage';
import { ApplicationDetailsPage } from './pages/dashboard/ApplicationDetailsPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminLeadsPage } from './pages/admin/AdminLeadsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminWebContentPage } from './pages/admin/AdminWebContentPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminActivityLogsPage } from './pages/admin/AdminActivityLogsPage';

// Scroll to top on route change component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout Controller: Renders Public Navbar/Footer for regular pages, but isolates Admin Panel
const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFD] text-slate-800 antialiased font-sans selection:bg-[#FF8500] selection:text-white">
      
      {/* Public Header - Only rendered on public website */}
      {!isAdmin && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          {/* ========================================================================= */}
          {/* 1. PUBLIC WEBSITE ROUTES                                                  */}
          {/* ========================================================================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />

          {/* Customer Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Customer Protected Portal */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <CustomerDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/applications/:id" 
            element={
              <ProtectedRoute>
                <ApplicationDetailsPage />
              </ProtectedRoute>
            } 
          />

          {/* Services & Individual Service Form Pages */}
          <Route path="/services" element={<AllServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/apply/:slug" element={<ServiceDetailPage />} />
          <Route path="/apply" element={<ServiceDetailPage />} />

          {/* Static Service Aliases for 100% Reliability */}
          <Route path="/services/aadhaar" element={<ServiceDetailPage />} />
          <Route path="/services/aadhaar-card" element={<ServiceDetailPage />} />
          <Route path="/services/pan-card" element={<ServiceDetailPage />} />
          <Route path="/services/voter-id" element={<ServiceDetailPage />} />
          <Route path="/services/msme" element={<ServiceDetailPage />} />
          <Route path="/services/msme-registration" element={<ServiceDetailPage />} />
          <Route path="/services/labour-license" element={<ServiceDetailPage />} />
          <Route path="/services/uan-pf" element={<ServiceDetailPage />} />
          <Route path="/services/uan-pf-services" element={<ServiceDetailPage />} />
          <Route path="/services/esi" element={<ServiceDetailPage />} />
          <Route path="/services/esi-details-update" element={<ServiceDetailPage />} />
          <Route path="/services/passport" element={<ServiceDetailPage />} />

          {/* Informational Pages */}
          <Route path="/documents-required" element={<DocumentsRequiredPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* ========================================================================= */}
          {/* 2. SEPARATE SUPER ADMIN PANEL ROUTES                                     */}
          {/* ========================================================================= */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminCoursesPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminServicesPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminLeadsPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminApplicationsPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminCustomersPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/media"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminMediaPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/website-content"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminWebContentPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminSettingsPage />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/activity-logs"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminActivityLogsPage />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Public Footer & Floating Widgets - Only rendered on public website */}
      {!isAdmin && (
        <>
          <Footer />

          {/* Floating Action Trigger for Instant Callback Popup */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-20 right-6 z-40 flex items-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FF8500]"
            title="Request Free Callback & Document Assessment"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">Free Callback</span>
          </button>

          {/* Quick Enquiry Callback Popup Modal */}
          <QuickEnquiryModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />

          {/* Floating WhatsApp and Scroll to Top Widgets */}
          <FloatingWhatsApp />
          <BackToTop />
        </>
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
};

export default App;
