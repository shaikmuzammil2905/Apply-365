import React, { useState, useEffect } from 'react';
import { getServices, saveService } from '../../services/dataSyncService';
import { ServiceDetail } from '../../types/services';
import { 
  Layers, 
  Edit, 
  ExternalLink, 
  Search, 
  Check, 
  X, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Plus
} from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingService, setEditingService] = useState<ServiceDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ServiceDetail>>({});
  const [docsText, setDocsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');

  const loadServices = async () => {
    const list = await getServices();
    setServices(list);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenEdit = (svc: ServiceDetail) => {
    setEditingService(svc);
    setFormData(svc);
    setDocsText(svc.documents.map(d => `${d.name}: ${d.description || ''}`).join('\n'));
    setBenefitsText(svc.benefits.join('\n'));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !formData.title) return;

    // Parse docsText
    const parsedDocs = docsText.split('\n').filter(Boolean).map(line => {
      const parts = line.split(':');
      return {
        name: parts[0]?.trim() || line,
        description: parts.slice(1).join(':').trim() || undefined
      };
    });

    const parsedBenefits = benefitsText.split('\n').map(b => b.trim()).filter(Boolean);

    const updated: ServiceDetail = {
      ...editingService,
      title: formData.title || editingService.title,
      badge: formData.badge || editingService.badge,
      accentColor: formData.accentColor || editingService.accentColor,
      shortDescription: formData.shortDescription || editingService.shortDescription,
      fullDescription: formData.fullDescription || editingService.fullDescription,
      officialDisclaimer: formData.officialDisclaimer || editingService.officialDisclaimer,
      documents: parsedDocs.length > 0 ? parsedDocs : editingService.documents,
      benefits: parsedBenefits.length > 0 ? parsedBenefits : editingService.benefits,
    };

    await saveService(updated);
    await loadServices();
    setIsModalOpen(false);
  };

  const filtered = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#104A96]" />
            <span>Government & Business Services Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage titles, required document lists, regulatory disclaimers, and benefits for all 8 statutory service lines.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span 
                  className="w-3.5 h-3.5 rounded-full" 
                  style={{ backgroundColor: service.accentColor }} 
                />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {service.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {service.title}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {service.shortDescription}
              </p>

              {/* Required Documents count */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Required Documents:</span>
                </span>
                <span className="font-bold text-slate-900">{service.documents.length} Items</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-500 hover:text-[#104A96] inline-flex items-center gap-1"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => handleOpenEdit(service)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#104A96] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Service</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Service Modal */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Edit Service: {editingService.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Update guidelines, documents and public information for /{editingService.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Badge Label</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    placeholder="e.g. Fast & Secure"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Short Summary</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Guidance Description</label>
                <textarea
                  rows={3}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Regulatory Disclaimer</label>
                <textarea
                  rows={2}
                  value={formData.officialDisclaimer}
                  onChange={(e) => setFormData(prev => ({ ...prev, officialDisclaimer: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Required Documents Checklist (Format: "Document Name: Description" on each line)
                </label>
                <textarea
                  rows={4}
                  value={docsText}
                  onChange={(e) => setDocsText(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Key Benefits (One per line)
                </label>
                <textarea
                  rows={3}
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Save & Update Website
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
