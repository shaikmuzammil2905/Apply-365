import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Users, 
  ShieldCheck, 
  Eye, 
  Target, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const coreValues = [
    {
      title: 'Trust and Transparency',
      desc: 'We are completely upfront regarding our status as a private assistance service, applicable fees, official processing norms, and authority timelines.',
      icon: ShieldCheck,
      color: '#104A96'
    },
    {
      title: 'Customer Convenience',
      desc: 'We minimize confusion and eliminate repeated trips to centers by reviewing document eligibility before submission.',
      icon: Clock,
      color: '#FF8500'
    },
    {
      title: 'Accuracy and Responsibility',
      desc: 'Every document name, spelling, and phonetic record is double-checked to avoid rejections on government portals.',
      icon: CheckCircle2,
      color: '#35A936'
    },
    {
      title: 'Clear Communication',
      desc: 'No confusing bureaucratic jargon. We explain requirements simply in English, Telugu, or Hindi.',
      icon: HeartHandshake,
      color: '#0284C7'
    },
    {
      title: 'Respect for Privacy',
      desc: 'We never store confidential passwords, biometric identifiers, or OTPs. Customer data is handled with strict confidentiality.',
      icon: Eye,
      color: '#D97706'
    },
    {
      title: 'Service for People',
      desc: 'Our fundamental motto is putting human convenience at the center of civic and commercial paperwork.',
      icon: Users,
      color: '#059669'
    }
  ];

  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-20">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-100 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'About Us' }]} />

          <div className="mt-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F7FF] text-[#104A96] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8500]" />
              <span>Services for People</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              About Apply365
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Apply365 is committed to making essential documentation and government-related service assistance simpler, more accessible, and easier to understand. Our goal is to help people navigate documentation requirements with clear guidance and a convenient customer experience.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#104A96] flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              To be the most trusted and transparent documentation assistance partner for citizens and growing enterprises across India — transforming intimidating paperwork into an effortless, understandable, and dignified experience.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF8500] flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              To bridge the gap between complex digital governance frameworks and everyday citizens by providing verified document checklists, patient human assistance, and error-free application guidance.
            </p>
          </div>

        </div>

        {/* Core Values Section */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Our Core Values
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The fundamental principles that guide every interaction at Apply365.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((v, idx) => {
              const IconComp = v.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-[#F8FBFF] border border-blue-50 space-y-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: v.color }}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{v.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How We Help & Our Service Commitment */}
        <div className="bg-gradient-to-r from-[#104A96] to-[#07366F] rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-emerald-300">
              Our Service Commitment
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Dedicated to Integrity & Clarity
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              We never fabricate promises of "instant government approvals" or pretend to hold official governmental authority. Instead, we do the thorough, detail-oriented preparatory work that guarantees your applications meet every single published statutory standard the very first time.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors text-sm"
            >
              <span>Explore Our Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-colors text-sm"
            >
              <span>Get in Touch with Our Team</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

