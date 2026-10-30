import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ServiceCard } from '../components/ServiceCard';
import { servicesData } from '../data/servicesData';
import { 
  ArrowRight, 
  FileCheck, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle,
  FileText,
  PhoneCall,
  Sparkles,
  Fingerprint,
  CreditCard,
  Vote,
  Building2,
  FileCheck2,
  Landmark,
  HeartHandshake,
  ChevronRight
} from 'lucide-react';

const mobileServicesList = [
  {
    title: 'Aadhaar Card',
    subtitle: 'New, Update & Correction',
    slug: 'aadhaar-card',
    icon: Fingerprint,
    bgColor: 'bg-[#EFF6FF]',
    borderColor: 'border-blue-100',
    iconBg: 'bg-blue-100 text-[#104A96]',
  },
  {
    title: 'PAN Card',
    subtitle: 'New & Correction',
    slug: 'pan-card',
    icon: CreditCard,
    bgColor: 'bg-[#ECFDF5]',
    borderColor: 'border-emerald-100',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Voter ID',
    subtitle: 'New & Update',
    slug: 'voter-id',
    icon: Vote,
    bgColor: 'bg-[#FFF1F2]',
    borderColor: 'border-rose-100',
    iconBg: 'bg-rose-100 text-rose-700',
  },
  {
    title: 'MSME Registration',
    subtitle: 'Registration & Udyam',
    slug: 'msme-registration',
    icon: Building2,
    bgColor: 'bg-[#FAF5FF]',
    borderColor: 'border-purple-100',
    iconBg: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Labour License',
    subtitle: 'New & Renewal',
    slug: 'labour-license',
    icon: FileCheck2,
    bgColor: 'bg-[#FFFBEB]',
    borderColor: 'border-amber-100',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'UAN / PF Services',
    subtitle: 'Registration & Updates',
    slug: 'uan-pf-services',
    icon: Landmark,
    bgColor: 'bg-[#F0F9FF]',
    borderColor: 'border-sky-100',
    iconBg: 'bg-sky-100 text-sky-700',
  },
  {
    title: 'ESI Details Update',
    subtitle: 'Details Update',
    slug: 'esi-details-update',
    icon: HeartHandshake,
    bgColor: 'bg-[#F0FDF4]',
    borderColor: 'border-teal-100',
    iconBg: 'bg-teal-100 text-teal-700',
  },
];

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Our Services Section - Seamless transition with zero awkward gap */}
      <section id="our-services" className="pt-6 pb-14 sm:pt-8 sm:pb-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header matching image copy 8.png */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F1F7FF] text-[#104A96] text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8500]" />
              <span>Comprehensive Facilitation</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Documentation & Business Services
            </h2>
            
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Select any service below to view detailed requirements, acceptable documents, process steps, and apply immediately.
            </p>
          </div>

          {/* Desktop Seven Interactive Service Cards Grid */}
          <div className="hidden lg:grid grid-cols-3 gap-6 xl:gap-8">
            {servicesData.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* Mobile Seven Horizontal Service Cards List (Matching image copy 16.png) */}
          <div className="lg:hidden space-y-3">
            {mobileServicesList.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={idx}
                  to={`/services/${item.slug}`}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border ${item.borderColor} ${item.bgColor} hover:shadow-md transition-all duration-200 group active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${item.iconBg}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#104A96] transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-slate-400 group-hover:text-[#104A96] group-hover:border-[#104A96]/30 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}

            {/* Mobile View All Services Outlined Button */}
            <div className="pt-2">
              <Link
                to="/services"
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#104A96] font-bold py-3.5 px-4 rounded-xl border-2 border-[#104A96] text-sm shadow-xs transition-colors"
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Desktop View All Services Button */}
          <div className="hidden lg:block mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-[#F1F7FF] hover:bg-blue-100/80 text-[#104A96] font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-blue-200/60 transition-all duration-200 group"
            >
              <span>View All 7 Services with Full Breakdown</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. How Apply365 Works (4-Step Process) */}
      <section className="py-16 lg:py-20 bg-[#F7F9FC] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How Apply365 Works
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Four straightforward steps to get your documentation verified and filed correctly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
              <div className="w-10 h-10 rounded-xl bg-[#104A96] text-white flex items-center justify-center font-bold text-base mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Select Your Service</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Choose the required service — Aadhaar update, PAN, Voter ID, MSME, Labour License, UAN/PF, or ESI.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FF8500] text-white flex items-center justify-center font-bold text-base mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Check Required Documents</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Review our exact document checklist so you have valid proofs ready before initiating.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
              <div className="w-10 h-10 rounded-xl bg-[#35A936] text-white flex items-center justify-center font-bold text-base mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Submit Your Details</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Fill our quick form or connect directly with our support team on WhatsApp for hands-on review.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
              <div className="w-10 h-10 rounded-xl bg-[#07366F] text-white flex items-center justify-center font-bold text-base mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Guided Processing</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We assist portal filings, appointment bookings, and tracking until your document is processed.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Document Checklist Feature Banner */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#104A96] to-[#07366F] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <FileCheck className="w-4 h-4" />
                <span>Interactive Checklist Tool</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Not Sure Which Documents You Need?
              </h2>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Use our comprehensive document checklist with interactive checkboxes, printable sheets, and clear guidance for each authority requirement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <Link
                to="/documents-required"
                className="inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-colors text-sm sm:text-base text-center"
              >
                <FileText className="w-4 h-4" />
                <span>Open Document Checklist</span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3.5 rounded-xl border border-white/20 transition-colors text-sm sm:text-base text-center"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Talk to an Expert</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

