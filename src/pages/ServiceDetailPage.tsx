import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getServiceBySlug, servicesData } from '../data/servicesData';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  MessageSquare, 
  PhoneCall, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  ShieldCheck,
  Check,
  Building2,
  Fingerprint,
  CreditCard,
  Vote,
  FileCheck2,
  Landmark,
  HeartHandshake
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Fingerprint,
  CreditCard,
  Vote,
  Building2,
  FileCheck2,
  Landmark,
  HeartHandshake
};

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : undefined;

  // Local state for interactive document checklist checkboxes
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const IconComponent = iconMap[service.iconName] || Fingerprint;

  const toggleDoc = (docName: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const readyCount = service.documents.filter(d => checkedDocs[d.name]).length;
  const totalCount = service.documents.length;
  const completionPercentage = Math.round((readyCount / totalCount) * 100);

  const whatsappMessage = encodeURIComponent(
    `Hi Apply365, I need assistance with ${service.title}. I have checked the document requirements on your website and would like to proceed.`
  );

  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-20">
      
      {/* Top Breadcrumb & Hero Banner */}
      <div className="bg-white border-b border-slate-100 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Breadcrumbs 
            items={[
              { label: 'Services', path: '/services' },
              { label: service.title }
            ]} 
          />

          <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: service.accentColor }}
                >
                  {service.badge}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Official Guidance
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                  style={{ 
                    backgroundColor: `${service.accentColor}15`, 
                    color: service.accentColor 
                  }}
                >
                  <IconComponent className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {service.title}
                  </h1>
                  <p className="text-base text-slate-600 mt-1">
                    {service.shortDescription}
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to={`/apply?service=${service.id}`}
                className="inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all duration-200"
              >
                <span>Apply for This Service</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3.5 rounded-xl shadow-sm transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Assistance</span>
              </a>
            </div>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Main Content Area (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* 1. Service Overview & Assistance Offered */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Service Overview & Assistance Offered
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                {service.fullDescription}
              </p>

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Key Benefits with Apply365
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F1F7FF] border border-blue-100/60">
                    <CheckCircle2 className="w-4 h-4 text-[#104A96] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-slate-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Interactive Documents Required Checklist */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#FF8500]" />
                    <span>Documents Required Checklist</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Check off the documents you have ready. (Saved locally in your browser)
                  </p>
                </div>
                
                {/* Completion tracker */}
                <div className="flex items-center gap-2 self-start sm:self-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-700">
                    {readyCount} of {totalCount} Ready
                  </div>
                  <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#35A936] transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                {service.documents.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc.name];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleDoc(doc.name)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleDoc(doc.name);
                        }
                      }}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked 
                          ? 'bg-[#35A936] border-[#35A936] text-white' 
                          : 'bg-white border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isChecked ? 'text-emerald-900 line-through opacity-80' : 'text-slate-800'}`}>
                            {doc.name}
                          </span>
                          {doc.isOptional && (
                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              Correction Only
                            </span>
                          )}
                        </div>
                        {doc.description && (
                          <p className={`text-xs mt-0.5 ${isChecked ? 'text-emerald-700/80' : 'text-slate-500'}`}>
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Official Rules Disclaimer Box */}
              <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-bold">Official Document Rule:</strong> {service.officialDisclaimer}
                </div>
              </div>
            </div>

            {/* 3. Step-by-Step Assistance Process */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Step-by-Step Assistance Process
              </h2>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
                {service.processSteps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#104A96] text-white font-bold text-sm flex items-center justify-center shrink-0 z-10 shadow-sm">
                      {idx + 1}
                    </div>
                    <div className="pt-1.5 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-800">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Frequently Asked Questions */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                {service.faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-slate-800 hover:bg-slate-50 transition-colors"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#FF8500] shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#F7F9FC]">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar Area (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Apply Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900">
                Ready to Process?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Start your application online with our simple 5-step form, or talk to an advisor on WhatsApp.
              </p>

              <div className="space-y-2.5 pt-2">
                <Link
                  to={`/apply?service=${service.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors text-sm"
                >
                  <span>Start Online Application</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquire via WhatsApp</span>
                </a>

                <a
                  href="tel:+919876543210"
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-4 rounded-xl transition-colors text-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#104A96]" />
                  <span>Call +91 98765 43210</span>
                </a>
              </div>

              {/* Trust Box */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#35A936]" />
                  <span>No OTPs or Passwords Stored</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#35A936]" />
                  <span>Verified Indian Standards</span>
                </div>
              </div>

              {/* Other Services Navigation */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Other Services
                </div>
                <div className="space-y-1">
                  {servicesData
                    .filter(s => s.id !== service.id)
                    .slice(0, 4)
                    .map(other => (
                      <Link
                        key={other.id}
                        to={`/services/${other.slug}`}
                        className="block py-1.5 px-2 rounded-lg text-xs font-medium text-slate-600 hover:text-[#104A96] hover:bg-[#F1F7FF] transition-colors"
                      >
                        {other.title} &rarr;
                      </Link>
                    ))}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <Link
                    to="/services"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#104A96] hover:text-[#FF8500]"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to All Services</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
