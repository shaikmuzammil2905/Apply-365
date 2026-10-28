import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Phone, 
  MessageSquare, 
  ArrowRight,
  Fingerprint,
  CreditCard,
  Vote,
  Building2,
  FileCheck2,
  Landmark,
  HeartHandshake
} from 'lucide-react';

interface ServiceNavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const serviceNavItems: ServiceNavItem[] = [
  { title: 'Aadhaar Card', path: '/services/aadhaar', icon: Fingerprint, tag: 'Address & Enrolment' },
  { title: 'PAN Card', path: '/services/pan-card', icon: CreditCard, tag: 'New & Correction' },
  { title: 'Voter ID', path: '/services/voter-id', icon: Vote, tag: 'New & Shift' },
  { title: 'MSME Registration', path: '/services/msme', icon: Building2, tag: 'Udyam Certificate' },
  { title: 'Labour License', path: '/services/labour-license', icon: FileCheck2, tag: 'Commercial License' },
  { title: 'UAN / PF Services', path: '/services/uan-pf', icon: Landmark, tag: 'KYC & Claims' },
  { title: 'ESI Details Update', path: '/services/esi', icon: HeartHandshake, tag: 'Family & Dispensary' },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setServicesOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md ${
        isScrolled ? 'shadow-md border-b border-slate-100 py-2.5' : 'border-b border-slate-100/80 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo - Clean transparent, clearly visible, zero patchwork */}
          <Link to="/" className="flex items-center group focus:outline-none transition-transform duration-200 hover:scale-[1.02]">
            <img 
              src="/apply365_transparent_logo.png" 
              alt="Apply365 — Services for People" 
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'text-[#104A96] bg-[#F1F7FF]'
                  : 'text-slate-700 hover:text-[#104A96] hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            {/* Our Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive('/services')
                    ? 'text-[#104A96] bg-[#F1F7FF]'
                    : 'text-slate-700 hover:text-[#104A96] hover:bg-slate-50'
                }`}
                onClick={() => setServicesOpen(!servicesOpen)}
                aria-expanded={servicesOpen}
              >
                <span>Our Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180 text-[#FF8500]' : 'text-slate-400'}`} />
              </button>

              {/* Dropdown Menu */}
              {servicesOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 py-2.5 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">All 7 Services</span>
                    <Link 
                      to="/services" 
                      className="text-xs font-semibold text-[#104A96] hover:text-[#FF8500] flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-0.5 px-1.5">
                    {serviceNavItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F1F7FF] transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#104A96] flex items-center justify-center transition-colors">
                            <IconComponent className="w-4 h-4 text-[#104A96] group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-800 group-hover:text-[#104A96]">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.tag}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/documents-required"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/documents-required')
                  ? 'text-[#104A96] bg-[#F1F7FF]'
                  : 'text-slate-700 hover:text-[#104A96] hover:bg-slate-50'
              }`}
            >
              Documents Required
            </Link>

            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/about')
                  ? 'text-[#104A96] bg-[#F1F7FF]'
                  : 'text-slate-700 hover:text-[#104A96] hover:bg-slate-50'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/contact')
                  ? 'text-[#104A96] bg-[#F1F7FF]'
                  : 'text-slate-700 hover:text-[#104A96] hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Phone Quick Link */}
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 text-slate-700 hover:text-[#104A96] text-xs font-semibold py-2 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              title="Call Apply365 Support"
            >
              <div className="w-7 h-7 rounded-full bg-[#104A96]/10 flex items-center justify-center text-[#104A96]">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="hidden xl:inline">+91 98765 43210</span>
            </a>

            {/* WhatsApp Quick Link */}
            <a
              href="https://wa.me/919876543210?text=Hi%20Apply365,%20I%20need%20assistance%20with%20documentation%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors border border-emerald-200/60"
              title="Chat on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
              <span>WhatsApp</span>
            </a>

            {/* Orange Apply Now Button */}
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#FF8500] focus:ring-offset-2"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/apply"
              className="bg-[#FF8500] hover:bg-[#e67700] text-white text-xs font-bold px-3.5 py-1.5 rounded-md shadow-sm"
            >
              Apply Now
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-[#104A96] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2.5 rounded-lg text-base font-semibold ${
                isActive('/') && location.pathname === '/'
                  ? 'text-[#104A96] bg-[#F1F7FF]'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            {/* Mobile Services Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span>Our Services</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180 text-[#FF8500]' : 'text-slate-400'}`} />
              </button>

              {mobileServicesOpen && (
                <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-[#104A96]/20 ml-3 mt-1">
                  <Link
                    to="/services"
                    className="block px-3 py-2 text-sm font-bold text-[#104A96] hover:underline"
                  >
                    View All Services &rarr;
                  </Link>
                  {serviceNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-[#104A96] hover:bg-[#F1F7FF]"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/documents-required"
              className={`block px-3 py-2.5 rounded-lg text-base font-semibold ${
                isActive('/documents-required')
                  ? 'text-[#104A96] bg-[#F1F7FF]'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              Documents Required
            </Link>

            <Link
              to="/about"
              className={`block px-3 py-2.5 rounded-lg text-base font-semibold ${
                isActive('/about')
                  ? 'text-[#104A96] bg-[#F1F7FF]'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`block px-3 py-2.5 rounded-lg text-base font-semibold ${
                isActive('/contact')
                  ? 'text-[#104A96] bg-[#F1F7FF]'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Mobile Direct Action Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200"
            >
              <Phone className="w-4 h-4 text-[#104A96]" />
              <span>Call +91 98765 43210</span>
            </a>

            <a
              href="https://wa.me/919876543210?text=Hi%20Apply365,%20I%20need%20assistance%20with%20documentation%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>

            <Link
              to="/apply"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-[#FF8500] hover:bg-[#e67700] text-white text-base font-bold shadow-md"
            >
              <span>Start Application</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

