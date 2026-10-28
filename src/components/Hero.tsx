import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Headphones, 
  Users, 
  ArrowRight, 
  ArrowDown,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToServices = () => {
    const el = document.getElementById('our-services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/services';
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F1F7FF] via-[#F8FBFF] to-white pt-8 pb-16 lg:pt-12 lg:pb-20 border-b border-slate-100">
      
      {/* Background Graphic Elements & Responsive Bright Hero BG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Desktop Hero Banner Background */}
        <div 
          className="hidden md:block absolute inset-0 opacity-[0.22] lg:opacity-[0.28] bg-center bg-no-repeat bg-cover filter brightness-110 contrast-105"
          style={{ backgroundImage: `url('/hero-desktop.png')` }}
        />
        {/* Mobile Hero Banner Background */}
        <div 
          className="md:hidden absolute inset-0 opacity-[0.24] bg-top bg-no-repeat bg-cover filter brightness-110 contrast-105"
          style={{ backgroundImage: `url('/hero-mobile.png')` }}
        />
        {/* Soft Ambient Radial Gradients */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#104A96]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#FF8500]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Hero Banner Graphic Card (Showing the User's Provided Images with Bright Vibrance) */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-white/80 bg-white/40 backdrop-blur-sm p-1.5 transition-all duration-300 hover:shadow-xl">
          {/* Desktop Banner Display */}
          <div className="hidden md:block relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-white to-blue-50">
            <img 
              src="/hero-desktop.png" 
              alt="Apply365 Hero Graphic — Services for People"
              className="w-full h-auto object-cover filter brightness-[1.04] contrast-[1.02] transition-transform duration-700 hover:scale-[1.01]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Mobile Banner Display */}
          <div className="md:hidden relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-blue-50 to-white">
            <img 
              src="/hero-mobile.png" 
              alt="Apply365 Mobile Hero Graphic — Services for People"
              className="w-full h-auto object-cover filter brightness-[1.05] contrast-[1.02]"
              loading="eager"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headings, Value Prop, Trust Indicators & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF8500] text-xs sm:text-sm font-bold tracking-wide shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FF8500]" />
              <span>Government & Business Services Made Easy</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <span className="text-[#104A96] block sm:inline">Your Documents.</span>{' '}
              <span className="text-[#FF8500] block sm:inline">Our Priority.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Apply365 provides fast, reliable and hassle-free assistance for your government documentation and business service needs — from Aadhaar & PAN Card to MSME and Labour Licensing.
            </p>

            {/* Four Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#104A96] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">Secure & Trusted</div>
                  <div className="text-[10px] text-slate-500">100% Confidential</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8500] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">Fast Processing</div>
                  <div className="text-[10px] text-slate-500">Quick Turnaround</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">Expert Support</div>
                  <div className="text-[10px] text-slate-500">Documentation Pros</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">People-First</div>
                  <div className="text-[10px] text-slate-500">Friendly Guidance</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={scrollToServices}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>Explore Our Services</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <Link
                to="/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>Apply Now Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base px-5 py-3.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4 text-[#104A96]" />
                <span>Contact Us</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Quick Highlights & Service Directory Cards */}
          <div className="lg:col-span-5">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-blue-100/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#35A936] animate-ping" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Services Assistance Active</span>
                </div>
                <span className="text-xs bg-[#F1F7FF] text-[#104A96] font-semibold px-2.5 py-1 rounded-full">
                  All 7 Services
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Aadhaar Card Address Update', route: '/services/aadhaar', time: '5-15 Days' },
                  { name: 'New PAN Card & Corrections', route: '/services/pan-card', time: 'Fast e-PAN' },
                  { name: 'Voter ID Enrolment & Shift', route: '/services/voter-id', time: 'Form 6 / 8' },
                  { name: 'MSME / Udyam Certificate', route: '/services/msme', time: 'Lifetime Valid' },
                  { name: 'Labour License (Shops & Est.)', route: '/services/labour-license', time: 'State Compliant' },
                  { name: 'EPFO / UAN & PF Services', route: '/services/uan-pf', time: 'KYC & Claims' },
                  { name: 'ESIC Details & Family Update', route: '/services/esi', time: 'Pehchan Card' },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.route}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1F7FF] transition-colors border border-transparent hover:border-blue-100 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#35A936]" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#104A96] transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 group-hover:bg-white px-2 py-0.5 rounded transition-colors">
                      {item.time}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/documents-required"
                  className="flex items-center justify-center gap-2 text-xs font-bold text-[#104A96] hover:text-[#FF8500] transition-colors py-1"
                >
                  <span>Check Required Documents Checklist Before Applying &rarr;</span>
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
