import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Fingerprint, 
  CreditCard, 
  Vote, 
  Building2, 
  FileCheck2, 
  Landmark, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { ServiceDetail } from '../types/services';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Fingerprint,
  CreditCard,
  Vote,
  Building2,
  FileCheck2,
  Landmark,
  HeartHandshake
};

interface ServiceCardProps {
  service: ServiceDetail;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const navigate = useNavigate();
  const IconComponent = iconMap[service.iconName] || Fingerprint;

  const handleCardClick = () => {
    navigate(`/services/${service.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="group relative bg-white rounded-2xl p-6 sm:p-7 shadow-card hover:shadow-card-hover border border-slate-100 hover:border-blue-200/80 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#104A96] focus:ring-offset-2"
    >
      {/* Top Section */}
      <div>
        {/* Accent Bar */}
        <div 
          className="w-12 h-1.5 rounded-full mb-5 transition-all duration-300 group-hover:w-20"
          style={{ backgroundColor: service.accentColor }}
        />

        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Icon */}
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm"
            style={{ 
              backgroundColor: `${service.accentColor}15`, 
              color: service.accentColor 
            }}
          >
            <IconComponent className="w-7 h-7" />
          </div>

          {/* Badge */}
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-[#F1F7FF] group-hover:text-[#104A96] transition-colors">
            {service.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#104A96] transition-colors mb-2">
          {service.title}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {service.shortDescription}
        </p>

        {/* Key Documents Required Snippet */}
        <div className="pt-3 border-t border-slate-100 mb-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Documents:
          </div>
          <div className="space-y-1">
            {service.documents.slice(0, 3).map((doc, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#35A936] shrink-0" />
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
            {service.documents.length > 3 && (
              <div className="text-[11px] text-slate-400 pl-5">
                +{service.documents.length - 3} more details required
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / CTA Link */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm font-bold text-[#104A96] group-hover:text-[#FF8500] inline-flex items-center gap-1.5 transition-colors">
          <span>View Details & Apply</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
        <span className="text-xs text-slate-400 font-medium">Official assistance</span>
      </div>
    </div>
  );
};
