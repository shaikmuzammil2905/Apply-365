import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ServiceCard } from '../components/ServiceCard';
import { getServices } from '../services/dataSyncService';
import { servicesData } from '../data/servicesData';
import { ServiceDetail } from '../types/services';
import { Search, Sparkles, HelpCircle } from 'lucide-react';

export const AllServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDetail[]>(servicesData);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getServices().then(setServices);
    const handleSync = () => getServices().then(setServices);
    window.addEventListener('apply365_data_sync', handleSync);
    return () => window.removeEventListener('apply365_data_sync', handleSync);
  }, []);

  const filteredServices = services.filter((service) => {
    const term = searchTerm.toLowerCase();
    const matchesTitle = service.title.toLowerCase().includes(term);
    const matchesDesc = service.shortDescription.toLowerCase().includes(term);
    const matchesDocs = service.documents.some(doc => doc.name.toLowerCase().includes(term));
    return matchesTitle || matchesDesc || matchesDocs;
  });

  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-20">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-100 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'All Services' }]} />
          
          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F7FF] text-[#104A96] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8500]" />
                <span>Apply365 Full Portfolio</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Government & Business Services
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Select any service below to view detailed requirements, acceptable documents, process steps, and application options.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services or documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-slate-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 max-w-lg mx-auto shadow-sm">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Services Found</h3>
            <p className="text-sm text-slate-600 mt-1 mb-4">
              We couldn't find any services matching "{searchTerm}".
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-[#104A96] text-white rounded-lg text-sm font-semibold hover:bg-[#07366F]"
            >
              Clear Search Filter
            </button>
          </div>
        )}

        {/* Bottom Consultation Box */}
        <div className="mt-14 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-slate-900">
              Need personalized documentation advice?
            </h3>
            <p className="text-sm text-slate-600">
              Our specialists can guide you through specific requirements, mismatches, or multi-member updates.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/apply"
              className="px-5 py-2.5 rounded-xl bg-[#FF8500] hover:bg-[#e67700] text-white text-sm font-bold shadow-sm transition-colors"
            >
              Apply Now
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

