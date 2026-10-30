import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BackToTop } from './components/BackToTop';
import { QuickEnquiryModal } from './components/QuickEnquiryModal';
import { PhoneCall } from 'lucide-react';

import { HomePage } from './pages/HomePage';
import { AllServicesPage } from './pages/AllServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
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
import { AadhaarApplicationPage } from './pages/apply/AadhaarApplicationPage';
import { ApplicationDetailsPage } from './pages/dashboard/ApplicationDetailsPage';

// Scroll to top on route change component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-[#FAFBFD] text-slate-800 antialiased font-sans selection:bg-[#FF8500] selection:text-white">
          
          {/* Sticky Premium Navbar with Customer Login */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              
              {/* Customer Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Customer Dashboard & Application Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <CustomerDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/apply/aadhaar" 
                element={
                  <ProtectedRoute>
                    <AadhaarApplicationPage />
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

              {/* All Services & Individual Service Routes */}
              <Route path="/services" element={<AllServicesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage />} />
              
              {/* Explicit direct service routes */}
              <Route path="/services/aadhaar" element={<ServiceDetailPage />} />
              <Route path="/services/pan-card" element={<ServiceDetailPage />} />
              <Route path="/services/voter-id" element={<ServiceDetailPage />} />
              <Route path="/services/msme" element={<ServiceDetailPage />} />
              <Route path="/services/labour-license" element={<ServiceDetailPage />} />
              <Route path="/services/uan-pf" element={<ServiceDetailPage />} />
              <Route path="/services/esi" element={<ServiceDetailPage />} />

              {/* Other Core Pages */}
              <Route path="/documents-required" element={<DocumentsRequiredPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/apply" element={<ApplyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>

          {/* Global Dark Navy Footer */}
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

        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
