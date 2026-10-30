import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Fingerprint, 
  CreditCard, 
  Vote, 
  Building2, 
  FileCheck2, 
  Landmark, 
  HeartHandshake,
  CheckCircle2,
  FileText,
  ExternalLink
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
  const IconComponent = iconMap[service.iconName] || Fingerprint;

  const handleCardClick = (e: React.MouseEvent) => {
    // Open service in new page
    window.open(`/services/${service.slug}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(`/services/${service.slug}`, '_blank', 'noopener,noreferrer');
        }
      }}
      className="group relative bg-white rounded-2xl p-6 sm:p-7 shadow-card hover:shadow-card-hover border border-slate-200/80 hover:border-[#104A96]/40 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#104A96] focus:ring-offset-2"
    >
      {/* Top Section */}
      <div>
        {/* Accent Bar */}
        <div 
          className="w-12 h-1.5 rounded-full mb-5 transition-all duration-300 group-hover:w-20"
          style={{ backgroundColor: service.accentColor }}
        />

        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Circular Icon matching design system */}
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm"
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
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#104A96] transition-colors mb-2 flex items-center justify-between">
          <span>{service.title}</span>
          <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {service.shortDescription}
        </p>

        {/* Key Documents Required Snippet */}
        <div className="pt-3 border-t border-slate-100 mb-5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Documents Checklist:</span>
          </div>
          <div className="space-y-1.5">
            {service.documents.slice(0, 3).map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#35A936] shrink-0" />
                <span className="truncate font-medium">{doc.name}</span>
              </div>
            ))}
            {service.documents.length > 3 && (
              <div className="text-[11px] text-slate-400 pl-5 font-medium">
                +{service.documents.length - 3} more required items
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
        <a
          href={`/services/${service.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F1F7FF] hover:bg-blue-100/80 text-[#104A96] font-bold text-xs sm:text-sm transition-colors text-center"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>

        <Link
          to={`/apply/${service.slug || service.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FF8500] hover:bg-[#e67700] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all text-center"
        >
          <span>Apply Now</span>
        </Link>
      </div>
    </div>
  );
};
