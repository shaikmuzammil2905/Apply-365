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
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  accentBorder: string;
}

const grandSevenServices: ServiceItem[] = [
  { 
    id: 'aadhaar', 
    title: 'Aadhaar Card', 
    slug: 'aadhaar', 
    tag: 'Address & Enrolment Guidance', 
    icon: Fingerprint, 
    color: '#0066cd', 
    bg: '#e8f3fc',
    accentBorder: 'hover:border-[#0066cd]/50'
  },
  { 
    id: 'pan-card', 
    title: 'PAN Card', 
    slug: 'pan-card', 
    tag: 'New Card & Correction Form 49A/CSF', 
    icon: CreditCard, 
    color: '#104A96', 
    bg: '#eef4ff',
    accentBorder: 'hover:border-[#104A96]/50'
  },
  { 
    id: 'voter-id', 
    title: 'Voter ID', 
    slug: 'voter-id', 
    tag: 'New Voter Form 6 & Shift Form 8', 
    icon: Vote, 
    color: '#0284c7', 
    bg: '#f0f9ff',
    accentBorder: 'hover:border-[#0284c7]/50'
  },
  { 
    id: 'msme', 
    title: 'MSME Registration', 
    slug: 'msme', 
    tag: 'Govt Udyam Lifetime Certificate', 
    icon: Building2, 
    color: '#FF8500', 
    bg: '#fff7ed',
    accentBorder: 'hover:border-[#FF8500]/50'
  },
  { 
    id: 'labour-license', 
    title: 'Labour License', 
    slug: 'labour-license', 
    tag: 'Shops & Establishments Compliance', 
    icon: FileCheck2, 
    color: '#d97706', 
    bg: '#fef3c7',
    accentBorder: 'hover:border-[#d97706]/50'
  },
  { 
    id: 'uan-pf', 
    title: 'UAN / PF Services', 
    slug: 'uan-pf', 
    tag: 'EPFO KYC Seeding & Online Claims', 
    icon: Landmark, 
    color: '#0891b2', 
    bg: '#ecfeff',
    accentBorder: 'hover:border-[#0891b2]/50'
  },
  { 
    id: 'esi', 
    title: 'ESI Details Update', 
    slug: 'esi', 
    tag: 'Family Dependants & Pehchan Card', 
    icon: HeartHandshake, 
    color: '#059669', 
    bg: '#ecfdf5',
    accentBorder: 'hover:border-[#059669]/50'
  },
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

  const handleOpenService = (slug: string) => {
    window.open(`/services/${slug}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative w-full bg-[#FAFBFD] border-b border-slate-200/60 pt-2 pb-6 sm:pb-8 lg:pt-3 lg:pb-8">
      
      {/* Background Graphic Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#104A96]/6 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-[#FF8500]/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grand Two-Zone Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT ZONE: Headlines, Trust Indicators & CTAs (7 cols on desktop) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left pt-2 sm:pt-4">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF8500] text-xs font-bold tracking-wide shadow-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FF8500]" />
              <span>Government & Business Services Made Easy</span>
            </div>

            {/* Main Grand Two-Color Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12]">
              <span className="text-[#104A96] block sm:inline">Your Documents.</span>{' '}
              <span className="text-[#FF8500] block sm:inline">Our Priority.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Apply365 provides fast, reliable and hassle-free assistance for all your government and business service needs — with verified checklists and zero confusion.
            </p>

            {/* Four Trust Indicators (2x2 grid) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-xs border border-slate-100 hover:border-blue-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#104A96] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">Secure & Trusted</div>
                  <div className="text-[10px] text-slate-500">100% Confidential</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-xs border border-slate-100 hover:border-orange-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF8500] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">Fast Processing</div>
                  <div className="text-[10px] text-slate-500">Quick Turnaround</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-xs border border-slate-100 hover:border-emerald-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">Expert Support</div>
                  <div className="text-[10px] text-slate-500">Documentation Pros</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white shadow-xs border border-slate-100 hover:border-amber-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">100% Genuine</div>
                  <div className="text-[10px] text-slate-500">Official Standards</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={scrollToServices}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>Explore Our Services</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <a
                href="/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-200 transition-colors shadow-xs"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4 text-[#FF8500]" />
              </a>
            </div>

            {/* Approved Artwork Card preview under text on medium screens */}
            <div className="hidden sm:block lg:hidden rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white p-1 mt-4">
              <img 
                src="/hero-approved.png" 
                alt="Apply365 Approved Hero Artwork"
                className="w-full h-auto object-cover rounded-xl"
                loading="eager"
              />
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT ZONE: GRAND LEVEL 7 SERVICES STACK (5 cols on desktop) */}
          {/* Matches image copy 12.png & image copy 13.png in Grand Level */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 w-full">
            
            <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl border border-blue-100/90 space-y-3">
              
              {/* Header inside the Grand Level card */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#35A936] animate-ping" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Our 7 Core Services
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#104A96] bg-[#F1F7FF] px-2.5 py-0.5 rounded-full">
                  Click opens in new tab
                </span>
              </div>

              {/* The Seven Grand-Level Interactive Service Pills */}
              <div className="space-y-2">
                {grandSevenServices.map((service, idx) => {
                  const IconComp = service.icon;
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleOpenService(service.slug)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenService(service.slug);
                        }
                      }}
                      className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 ${service.accentBorder} bg-white hover:bg-[#F8FBFF] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5`}
                      title={`Open ${service.title} details in new tab`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Grand Level Icon Circle matching image copy 13.png */}
                        <div 
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-110"
                          style={{ 
                            backgroundColor: service.bg, 
                            color: service.color 
                          }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>

                        {/* Title and Tag */}
                        <div className="truncate text-left">
                          <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#104A96] transition-colors truncate">
                            {service.title}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                            {service.tag}
                          </div>
                        </div>
                      </div>

                      {/* Right Indicator Arrow */}
                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-[#FF8500] shrink-0 pl-2">
                        <span className="text-[10px] font-bold hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">
                          Open
                        </span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Checklist Quick Link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href="/documents-required"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#104A96] hover:text-[#FF8500] transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>Check All Required Documents &rarr;</span>
                </a>
                <span className="text-[10px] text-slate-400">Official Assistance</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
