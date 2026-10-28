import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BackToTop } from './components/BackToTop';

import { HomePage } from './pages/HomePage';
import { AllServicesPage } from './pages/AllServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { DocumentsRequiredPage } from './pages/DocumentsRequiredPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ApplyPage } from './pages/ApplyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

// Scroll to top on route change component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-[#F7F9FC] text-slate-800 antialiased font-sans selection:bg-[#FF8500] selection:text-white">
        
        {/* Sticky Premium Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* All Services & Individual Service Routes */}
            <Route path="/services" element={<AllServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            
            {/* Explicit direct routes matching prompt specifications */}
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

        {/* Floating WhatsApp and Scroll to Top Widgets */}
        <FloatingWhatsApp />
        <BackToTop />

      </div>
    </Router>
  );
};

export default App;
