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
  PhoneCall,
  Fingerprint,
  CreditCard,
  Vote,
  Building2,
  FileCheck2,
  Landmark,
  HeartHandshake,
  ChevronRight
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

  const heroSevenServices = [
    { title: 'Aadhaar Card', slug: 'aadhaar', icon: Fingerprint, color: '#0066cd', bg: '#e8f3fc', tag: 'Address & Enrolment' },
    { title: 'PAN Card', slug: 'pan-card', icon: CreditCard, color: '#104A96', bg: '#eef4ff', tag: 'New & Correction' },
    { title: 'Voter ID', slug: 'voter-id', icon: Vote, color: '#0284c7', bg: '#f0f9ff', tag: 'Enrolment & Shift' },
    { title: 'MSME Registration', slug: 'msme', icon: Building2, color: '#FF8500', bg: '#fff7ed', tag: 'Udyam Certificate' },
    { title: 'Labour License', slug: 'labour-license', icon: FileCheck2, color: '#d97706', bg: '#fef3c7', tag: 'Shops & Establishments' },
    { title: 'UAN / PF Services', slug: 'uan-pf', icon: Landmark, color: '#0891b2', bg: '#ecfeff', tag: 'EPFO KYC & Claims' },
    { title: 'ESI Details Update', slug: 'esi', icon: HeartHandshake, color: '#059669', bg: '#ecfdf5', tag: 'Family & Pehchan' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F1F7FF] via-[#F8FBFF] to-white pt-6 pb-16 lg:pt-10 lg:pb-20 border-b border-slate-100">
      
      {/* Background Graphic from image copy 6.png with bright crisp styling */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.28] lg:opacity-[0.35] bg-center bg-no-repeat bg-cover filter brightness-110 contrast-105"
          style={{ backgroundImage: `url('/hero-bg-graphic.png')` }}
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#104A96]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#FF8500]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Hero Banner Graphic as-it-is from image copy 5.png */}
        <div className="mb-10 rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-white p-1 transition-all duration-300 hover:shadow-lg">
          <img 
            src="/hero-person-graphic.png" 
            alt="Apply365 — Government & Business Services Made Easy"
            className="w-full h-auto object-cover rounded-xl filter brightness-[1.03] contrast-[1.02]"
            loading="eager"
          />
        </div>

        {/* Main Hero Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Headings, Trust Badges & Action CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF8500] text-xs sm:text-sm font-bold tracking-wide shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FF8500]" />
              <span>Government & Business Services Made Easy</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
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

          {/* Right Column: 7 Services List Styled Exactly like image copy 7.png (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-blue-100/90 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#35A936] animate-ping" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Our 7 Core Services
                  </span>
                </div>
                <Link
                  to="/services"
                  className="text-xs font-semibold text-[#104A96] hover:text-[#FF8500] flex items-center gap-1"
                >
                  View All &rarr;
                </Link>
              </div>

              {/* The 7 Services Stack matching image copy 7.png */}
              <div className="space-y-2">
                {heroSevenServices.map((service, idx) => {
                  const IconComp = service.icon;
                  return (
                    <Link
                      key={idx}
                      to={`/services/${service.slug}`}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-[#F1F7FF] transition-all duration-200 border border-slate-100/80 hover:border-blue-200 group bg-white shadow-sm hover:shadow"
                    >
                      <div className="flex items-center gap-3">
                        {/* Circular icon badge matching image copy 7.png */}
                        <div 
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110"
                          style={{ 
                            backgroundColor: service.bg, 
                            color: service.color 
                          }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#104A96] transition-colors">
                            {service.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {service.tag}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-[#FF8500] transition-colors">
                        <span className="text-[11px] font-semibold hidden sm:inline group-hover:underline">
                          Details
                        </span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link
                  to="/documents-required"
                  className="flex items-center justify-center gap-2 text-xs font-bold text-[#104A96] hover:text-[#FF8500] transition-colors py-1 text-center"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#35A936]" />
                  <span>Check All Document Requirements Before Applying &rarr;</span>
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
