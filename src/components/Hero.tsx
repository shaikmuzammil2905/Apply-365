import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Headphones, 
  CheckCircle2, 
  ArrowRight, 
  ArrowDown, 
  Fingerprint, 
  CreditCard, 
  Vote, 
  Building2, 
  FileCheck2, 
  Landmark, 
  HeartHandshake,
  ChevronRight
} from 'lucide-react';

interface ServicePill {
  title: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  topPercent: number; // percentage in artwork
  color: string;
  bg: string;
}

const sevenServices: ServicePill[] = [
  { title: 'Aadhaar Card', slug: 'aadhaar', icon: Fingerprint, topPercent: 16.0, color: '#0066cd', bg: '#e8f3fc' },
  { title: 'PAN Card', slug: 'pan-card', icon: CreditCard, topPercent: 26.5, color: '#104A96', bg: '#eef4ff' },
  { title: 'Voter ID', slug: 'voter-id', icon: Vote, topPercent: 37.0, color: '#0284c7', bg: '#f0f9ff' },
  { title: 'MSME Registration', slug: 'msme', icon: Building2, topPercent: 47.5, color: '#FF8500', bg: '#fff7ed' },
  { title: 'Labour License', slug: 'labour-license', icon: FileCheck2, topPercent: 58.0, color: '#d97706', bg: '#fef3c7' },
  { title: 'UAN / PF Services', slug: 'uan-pf', icon: Landmark, topPercent: 68.5, color: '#0891b2', bg: '#ecfeff' },
  { title: 'ESI Details Update', slug: 'esi', icon: HeartHandshake, topPercent: 79.0, color: '#059669', bg: '#ecfdf5' },
];

export const Hero: React.FC = () => {
  const scrollToServices = () => {
    const el = document.getElementById('our-services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open('/services', '_blank');
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFBFD] border-b border-slate-200/70">
      
      {/* ========================================================================= */}
      {/* DESKTOP HERO: Full width composition using the SECOND approved reference artwork */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative w-full max-w-[1700px] mx-auto min-h-[580px] xl:min-h-[640px]">
        
        {/* Approved Reference Artwork (image copy 11.png) placed on right */}
        <div className="absolute inset-0 z-0 flex justify-end pointer-events-none">
          <div className="relative w-[65%] xl:w-[62%] h-full flex items-center justify-end">
            <img 
              src="/hero-approved.png" 
              alt="Apply365 — Government & Business Services Made Easy" 
              className="w-full h-full object-cover object-right select-none filter brightness-[1.03] contrast-[1.02]"
              loading="eager"
            />
            {/* Soft left gradient blending seamlessly with the negative space */}
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#FAFBFD] via-[#FAFBFD]/80 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Desktop Interactive Hotspots for the 7 Service Pills */}
        <div className="absolute inset-y-0 right-0 w-[65%] xl:w-[62%] z-20 pointer-events-auto">
          {sevenServices.map((service, idx) => (
            <a
              key={idx}
              href={`/services/${service.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                top: `${service.topPercent}%`,
                right: '2.5%',
                width: '28%',
                height: '7.8%',
              }}
              className="absolute group rounded-xl transition-all duration-200 hover:ring-2 hover:ring-[#FF8500] hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-[#104A96] flex items-center justify-end pr-2"
              title={`Open ${service.title} details in new tab`}
              aria-label={`View ${service.title} details`}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#07366F] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-lg mr-2 whitespace-nowrap flex items-center gap-1">
                <span>View & Apply</span>
                <ChevronRight className="w-3 h-3 text-[#FF8500]" />
              </div>
            </a>
          ))}
        </div>

        {/* LEFT ZONE: Positioned strictly in the deliberate white/light negative space */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 xl:px-12 py-14 xl:py-20 flex items-center min-h-[580px] xl:min-h-[640px]">
          <div className="max-w-xl xl:max-w-2xl space-y-6">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF8500] text-xs font-bold tracking-wide shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FF8500]" />
              <span>Government & Business Services Made Easy</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <span className="text-[#104A96] block">Your Documents.</span>
              <span className="text-[#FF8500] block mt-1">Our Priority.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base xl:text-lg text-slate-600 leading-relaxed font-normal max-w-lg">
              Apply365 provides fast, reliable and hassle-free assistance for all your government and business service needs.
            </p>

            {/* Four Trust Indicators */}
            <div className="grid grid-cols-2 gap-3 pt-1 max-w-lg">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#104A96] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Secure & Trusted</div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8500] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Fast Processing</div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Expert Support</div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">100% Genuine Services</div>
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="flex items-center gap-4 pt-3">
              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex items-center gap-2.5 bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-sm xl:text-base px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>Explore Our Services</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <a
                href="/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm xl:text-base px-6 py-3.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4 text-[#FF8500]" />
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET HERO: Dedicated responsive layout using SAME approved artwork */}
      {/* ========================================================================= */}
      <div className="lg:hidden px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Content area: Eyebrow, Headlines & Text */}
        <div className="text-center sm:text-left space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF8500] text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8500]" />
            <span>Government & Business Services Made Easy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-[#104A96]">Your Documents. </span>
            <span className="text-[#FF8500]">Our Priority.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Apply365 provides fast, reliable and hassle-free assistance for all your government and business service needs.
          </p>

          {/* 4 Trust Indicators Grid on Mobile */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 text-left">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white shadow-xs border border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-[#104A96]" />
              <span className="text-xs font-bold text-slate-800">Secure & Trusted</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white shadow-xs border border-slate-100">
              <Zap className="w-3.5 h-3.5 text-[#FF8500]" />
              <span className="text-xs font-bold text-slate-800">Fast Processing</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white shadow-xs border border-slate-100">
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Expert Support</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white shadow-xs border border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">100% Genuine</span>
            </div>
          </div>

          {/* Primary & Secondary Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="button"
              onClick={scrollToServices}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#104A96] hover:bg-[#07366F] text-white font-bold py-3 px-6 rounded-xl shadow-md text-sm"
            >
              <span>Explore Our Services</span>
              <ArrowDown className="w-4 h-4" />
            </button>
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-200 text-sm shadow-sm"
            >
              <span>Contact Us</span>
            </a>
          </div>
        </div>

        {/* Approved Reference Artwork Card on Mobile */}
        <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white p-1">
          <img 
            src="/hero-approved.png" 
            alt="Apply365 Approved Hero Banner" 
            className="w-full h-auto object-cover rounded-xl"
            loading="eager"
          />
        </div>

        {/* Clean, accessible 7 Services list below artwork for mobile users */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select a Service (Tap to View Details):
            </span>
            <span className="text-xs font-semibold text-[#FF8500]">All 7 Services</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sevenServices.map((service, idx) => {
              const IconComp = service.icon;
              return (
                <a
                  key={idx}
                  href={`/services/${service.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-[#104A96] bg-slate-50 hover:bg-[#F1F7FF] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: service.bg, color: service.color }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#104A96]">
                      {service.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF8500] transition-transform group-hover:translate-x-0.5" />
                </a>
              );
            })}
          </div>
        </div>

      </div>

    </section>
  );
};
