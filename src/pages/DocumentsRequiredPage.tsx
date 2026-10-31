import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getServices } from '../services/dataSyncService';
import { servicesData } from '../data/servicesData';
import { ServiceDetail } from '../types/services';
import { 
  FileCheck, 
  Search, 
  Printer, 
  Download, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Fingerprint,
  CreditCard,
  Vote,
  Building2,
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

export const DocumentsRequiredPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDetail[]>(servicesData);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    getServices().then(setServices);
    const handleSync = () => getServices().then(setServices);
    window.addEventListener('apply365_data_sync', handleSync);
    return () => window.removeEventListener('apply365_data_sync', handleSync);
  }, []);

  // State for which service accordions are expanded (default all true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'aadhaar': true,
    'pan-card': true,
    'voter-id': true,
    'msme': true,
    'labour-license': true,
    'uan-pf': true,
    'esi': true
  });

  // State for checked documents key = `${serviceId}:${docName}`
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    services.forEach(s => { all[s.id] = true; });
    setExpandedSections(all);
  };

  const collapseAll = () => {
    const none: Record<string, boolean> = {};
    services.forEach(s => { none[s.id] = false; });
    setExpandedSections(none);
  };

  const toggleDoc = (serviceId: string, docName: string) => {
    const key = `${serviceId}:${docName}`;
    setCheckedDocs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetChecklist = () => {
    if (window.confirm('Are you sure you want to clear all checked documents?')) {
      setCheckedDocs({});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    let content = 'APPLY365 — REQUIRED DOCUMENTS CHECKLIST\n';
    content += 'Website: https://apply365.in | Helpline: +91 98765 43210\n';
    content += '==================================================\n\n';

    services.forEach(s => {
      content += `SERVICE: ${s.title.toUpperCase()}\n`;
      content += `Note: ${s.officialDisclaimer}\n`;
      content += 'Documents Required:\n';
      s.documents.forEach(d => {
        const isDone = checkedDocs[`${s.id}:${d.name}`] ? '[X]' : '[ ]';
        content += `  ${isDone} ${d.name} ${d.description ? '- ' + d.description : ''}\n`;
      });
      content += '\n--------------------------------------------------\n\n';
    });

    content += 'Disclaimer: Checklists are informational. Final document acceptance is subject to the relevant authority\'s current statutory requirements.\n';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Apply365-Document-Checklist.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter services by search term
  const filteredServices = services.filter(s => {
    const term = searchTerm.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(term);
    const docMatch = s.documents.some(d => d.name.toLowerCase().includes(term) || (d.description && d.description.toLowerCase().includes(term)));
    return titleMatch || docMatch;
  });

  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-24 print-area">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-100 py-10 sm:py-14 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Documents Required' }]} />
          
          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verification Checklists</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Documents Required Checklist
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Check off items you have ready, download a copy, or print this checklist before submitting your request.
              </p>
            </div>

            {/* Quick Action Buttons for Checklist */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
                title="Print this document checklist"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Checklist</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
                title="Download text checklist file"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download Checklist</span>
              </button>

              <button
                type="button"
                onClick={resetChecklist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
                title="Reset all checkboxes"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Accordion Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search required documents or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs font-semibold text-[#104A96] hover:underline px-2 py-1"
              >
                Expand All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-xs font-semibold text-slate-500 hover:underline px-2 py-1"
              >
                Collapse All
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Checklist Accordions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Printable Header (Visible only on print) */}
        <div className="hidden print:block mb-6 pb-4 border-b border-black">
          <h1 className="text-2xl font-bold">Apply365 — Official Documents Checklist</h1>
          <p className="text-xs text-gray-600">Web: apply365.in | Helpline: +91 98765 43210</p>
        </div>

        <div className="space-y-6">
          {filteredServices.map((service) => {
            const isExpanded = expandedSections[service.id] ?? true;
            const IconComponent = iconMap[service.iconName] || Fingerprint;
            
            // Calculate completion for this service
            const checkedCount = service.documents.filter(d => checkedDocs[`${service.id}:${d.name}`]).length;
            const totalCount = service.documents.length;
            const pct = Math.round((checkedCount / totalCount) * 100);

            return (
              <div 
                key={service.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-all duration-200"
              >
                
                {/* Accordion Header */}
                <div
                  onClick={() => toggleSection(service.id)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ 
                        backgroundColor: `${service.accentColor}15`, 
                        color: service.accentColor 
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                          {service.title}
                        </h2>
                        <span 
                          className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: service.accentColor }}
                        >
                          {service.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {service.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Right side: completion status + expand chevron */}
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">
                        {checkedCount}/{totalCount}
                      </span>
                      <div className="w-14 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#35A936] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-[#FAFBFD]">
                    
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pt-2">
                      Required Proofs & Information ({totalCount} items)
                    </div>

                    {/* Document Checkbox List */}
                    <div className="space-y-2.5">
                      {service.documents.map((doc, idx) => {
                        const key = `${service.id}:${doc.name}`;
                        const isChecked = !!checkedDocs[key];

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleDoc(service.id, doc.name)}
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleDoc(service.id, doc.name);
                              }
                            }}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked 
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
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

                    {/* Official Authority Disclaimer Note */}
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 leading-relaxed">
                        <strong className="font-semibold">Statutory Authority Rule:</strong> {service.officialDisclaimer}
                      </div>
                    </div>

                    {/* Footer Actions inside accordion */}
                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 no-print">
                      <Link
                        to={`/services/${service.slug}`}
                        className="text-xs font-bold text-[#104A96] hover:text-[#FF8500] flex items-center gap-1"
                      >
                        <span>View Detailed Process & FAQs for {service.title}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to={`/apply/${service.slug || service.id}`}
                        className="text-xs font-bold bg-[#FF8500] hover:bg-[#e67700] text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                      >
                        Apply for {service.title} &rarr;
                      </Link>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Global Informational Disclaimer Box */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
            <AlertCircle className="w-4 h-4 text-[#FF8500]" />
            <span>Important Information Regarding Document Acceptance</span>
          </div>
          <p className="leading-relaxed">
            The checklists provided on Apply365 are compiled based on official guidance published by the respective government bodies (UIDAI, NSDL, ECI, Ministry of MSME, State Labour Departments, EPFO, and ESIC). Checklists are informational and final document acceptance is subject to the relevant authority's current rules, active gazette notifications, and jurisdiction requirements. Apply365 never requests or retains original identity cards or authentication secrets.
          </p>
        </div>

      </div>

    </div>
  );
};

