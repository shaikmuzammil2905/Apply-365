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
  Sparkles
} from 'lucide-react';

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

          {/* Seven Interactive Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {servicesData.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* View All Services Button */}
          <div className="mt-12 text-center">
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

