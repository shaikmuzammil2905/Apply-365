import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Headphones, 
  CheckCircle2, 
  ArrowRight, 
  ArrowDown, 
  Phone,
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
  shortTitle: string;
  slug: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  desktopTop: number;
  mobileTop: number;
  color: string;
}

const sevenServices: ServicePill[] = [
  { title: 'Aadhaar Card', shortTitle: 'Aadhaar', slug: 'aadhaar', icon: Fingerprint, desktopTop: 16.0, mobileTop: 12.0, color: '#0066cd' },
  { title: 'PAN Card', shortTitle: 'PAN', slug: 'pan-card', icon: CreditCard, desktopTop: 26.5, mobileTop: 23.0, color: '#104A96' },
  { title: 'Voter ID', shortTitle: 'Voter ID', slug: 'voter-id', icon: Vote, desktopTop: 37.0, mobileTop: 34.0, color: '#0284c7' },
  { title: 'MSME Registration', shortTitle: 'MSME', slug: 'msme', icon: Building2, desktopTop: 47.5, mobileTop: 45.0, color: '#FF8500' },
  { title: 'Labour License', shortTitle: 'Labour License', slug: 'labour-license', icon: FileCheck2, desktopTop: 58.0, mobileTop: 56.0, color: '#d97706' },
  { title: 'UAN / PF Services', shortTitle: 'UAN / PF', slug: 'uan-pf', icon: Landmark, desktopTop: 68.5, mobileTop: 67.0, color: '#0891b2' },
  { title: 'ESI Details Update', shortTitle: 'ESI', slug: 'esi', icon: HeartHandshake, desktopTop: 79.0, mobileTop: 78.0, color: '#059669' },
];

export const Hero: React.FC = () => {
  const scrollToServices = () => {
    const el = document.getElementById('our-services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open('/services', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFBFD] border-b border-slate-200/60">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP HERO COMPOSITION (Screen width >= 1024px)                     */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative w-full max-w-[1700px] mx-auto min-h-[580px] xl:min-h-[640px]">
        
        {/* Approved Reference Artwork (hero-approved.png) on the right */}
        <div className="absolute inset-0 z-0 flex justify-end pointer-events-none">
          <div className="relative w-[65%] xl:w-[62%] h-full flex items-center justify-end">
            <img 
              src="/hero-approved.png" 
              alt="Apply365 — Government & Business Services Made Easy" 
              className="w-full h-full object-cover object-right select-none filter brightness-[1.03] contrast-[1.02]"
              loading="eager"
            />
            {/* Seamless gradient fade into the left negative space */}
            <div className="absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-[#FAFBFD] via-[#FAFBFD]/80 to-transparent pointer-events-none" />
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
                top: `${service.desktopTop}%`,
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

        {/* Left Negative Space Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 xl:px-12 py-12 xl:py-16 flex items-center min-h-[580px] xl:min-h-[640px]">
          <div className="max-w-xl xl:max-w-2xl space-y-5">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF8500] text-xs font-bold tracking-wide shadow-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FF8500]" />
              <span>Government & Business Services Made Easy</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.12]">
              <span className="text-[#104A96] block">Your Documents.</span>
              <span className="text-[#FF8500] block mt-1">Our Priority.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base xl:text-lg text-slate-600 leading-relaxed font-normal max-w-lg">
              Apply365 provides fast, reliable and hassle-free assistance for all your government and business service needs.
            </p>

            {/* Four Trust Indicators */}
            <div className="grid grid-cols-2 gap-3 pt-1 max-w-lg">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-xs border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#104A96] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Secure & Trusted</div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-xs border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8500] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Fast Processing</div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-xs border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">Expert Support</div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-xs border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800">100% Genuine Services</div>
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
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
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#104A96] font-semibold text-sm xl:text-base px-6 py-3.5 rounded-xl border-2 border-[#104A96]/30 hover:border-[#104A96] transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4 text-[#104A96]" />
                <span>Contact Us</span>
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE HERO EXACT IMPLEMENTATION (Matching image copy 16.png)         */}
      {/* Completely removes the old box from image copy 15.png                      */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full">
        
        {/* Light-blue upper content area */}
        <div className="px-4 sm:px-6 pt-5 pb-6 bg-[#F1F7FF]/70 space-y-4 text-center sm:text-left">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF8500] text-xs font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8500]" />
            <span>Government & Business Services Made Easy</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.15]">
            <span className="text-[#104A96] block sm:inline">Your Documents.</span>{' '}
            <span className="text-[#FF8500] block sm:inline">Our Priority.</span>
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto sm:mx-0">
            Apply365 provides fast, reliable and hassle-free assistance for all your government and business service needs.
          </p>

          {/* 4 Trust Indicators in 2-column grid with clean blue line icons */}
          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto sm:mx-0 pt-1 text-left">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white shadow-xs border border-blue-100">
              <ShieldCheck className="w-4 h-4 text-[#104A96] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-800">Secure & Trusted</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white shadow-xs border border-blue-100">
              <Zap className="w-4 h-4 text-[#104A96] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-800">Fast Processing</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white shadow-xs border border-blue-100">
              <Headphones className="w-4 h-4 text-[#104A96] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-800">Expert Support</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white shadow-xs border border-blue-100">
              <CheckCircle2 className="w-4 h-4 text-[#104A96] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-800">100% Genuine</span>
            </div>
          </div>

          {/* Two CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto sm:mx-0 pt-2">
            {/* Explore Our Services button (Orange gradient/solid, white text, right arrow) */}
            <button
              type="button"
              onClick={scrollToServices}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold py-3 px-5 rounded-xl shadow-md text-sm active:scale-98 transition-all"
            >
              <span>Explore Our Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Contact Us button (White background, blue border, blue phone icon, blue text) */}
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#104A96] font-bold py-3 px-5 rounded-xl border-2 border-[#104A96] text-sm shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4 text-[#104A96]" />
              <span>Contact Us</span>
            </a>
          </div>

        </div>

        {/* Hero Artwork Area: Displays the approved artwork with the person, laptop, curves, and the 7 service pills matching Reference Image 2 */}
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#F1F7FF]/70 to-[#FAFBFD] px-2 sm:px-4 pt-2 pb-4">
          <div className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-md border border-slate-200/90 bg-white">
            <img 
              src="/mobile-hero-artwork.png" 
              alt="Apply365 Mobile Hero Artwork" 
              className="w-full h-auto object-cover select-none filter brightness-[1.02]"
              loading="eager"
            />

            {/* Dedicated 7 Service Pills Column Matching Reference Image 2 (image copy 18.png) */}
            <div className="absolute top-[6%] bottom-[6%] right-[2%] w-[44%] min-[380px]:w-[40%] z-20 flex flex-col justify-between py-1 pointer-events-auto">
              {sevenServices.map((service, idx) => {
                const IconComp = service.icon;
                return (
                  <a
                    key={idx}
                    href={`/services/${service.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200/90 shadow-[0_2px_4px_rgba(0,0,0,0.08)] hover:shadow-md rounded-full px-2 py-1 min-[360px]:py-1.5 transition-all duration-150 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                    title={`Open ${service.title} details in new tab`}
                    aria-label={`View ${service.title} details`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                        <IconComp className="w-3.5 h-3.5" style={{ color: service.color }} />
                      </div>
                      <span className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-[#104A96] transition-colors truncate leading-none">
                        {service.shortTitle}
                      </span>
                    </div>

                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#FF8500] group-hover:translate-x-0.5 transition-transform shrink-0 ml-0.5" />
                  </a>
                );
              })}
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};
