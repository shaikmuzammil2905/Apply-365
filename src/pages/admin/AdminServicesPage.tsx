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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const loadServices = async () => {
    const list = await getServices();
    setServices(list);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      slug: '',
      badge: 'Popular Service',
      accentColor: '#104A96',
      iconName: 'FileText',
      shortDescription: '',
      fullDescription: '',
      officialDisclaimer: 'Acceptable proof depends on current statutory requirements.',
    });
    setDocsText('Identity Proof: Valid government identification card\nAddress Proof: Recent utility bill or residential certificate');
    setBenefitsText('Guaranteed pre-verification of documents\nDirect portal submission assistance\nFast status tracking and support');
    setSaveError('');
    setSaveSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: ServiceDetail) => {
    setEditingService(svc);
    setFormData(svc);
    setDocsText(svc.documents.map(d => `${d.name}: ${d.description || ''}`).join('\n'));
    setBenefitsText(svc.benefits.join('\n'));
    setSaveError('');
    setSaveSuccess('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      setSaveError('Please enter a valid service title');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      // Parse docsText
      const parsedDocs = docsText.split('\n').filter(Boolean).map(line => {
        const parts = line.split(':');
        return {
          name: parts[0]?.trim() || line,
          description: parts.slice(1).join(':').trim() || undefined
        };
      });

      const parsedBenefits = benefitsText.split('\n').map(b => b.trim()).filter(Boolean);
      
      const slug = formData.slug?.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = editingService ? editingService.id : slug;

      const payload: ServiceDetail = {
        id,
        slug,
        title: formData.title.trim(),
        badge: formData.badge || (editingService ? editingService.badge : 'Popular Service'),
        accentColor: formData.accentColor || (editingService ? editingService.accentColor : '#104A96'),
        iconName: formData.iconName || (editingService ? editingService.iconName : 'FileText'),
        shortDescription: formData.shortDescription?.trim() || (editingService ? editingService.shortDescription : ''),
        fullDescription: formData.fullDescription?.trim() || (editingService ? editingService.fullDescription : formData.shortDescription?.trim() || ''),
        officialDisclaimer: formData.officialDisclaimer?.trim() || (editingService ? editingService.officialDisclaimer : 'Acceptable proof depends on current statutory requirements.'),
        documents: parsedDocs.length > 0 ? parsedDocs : (editingService ? editingService.documents : [{ name: 'Identity Proof', description: 'Valid government ID card.' }]),
        benefits: parsedBenefits.length > 0 ? parsedBenefits : (editingService ? editingService.benefits : ['Zero error processing', 'Official verification assistance']),
        processSteps: editingService?.processSteps || [
          { title: 'Document Verification', description: 'Our documentation team reviews your proof.' },
          { title: 'Form Submission', description: 'Accurate filing on official regulatory portal.' }
        ],
        faqs: editingService?.faqs || []
      };

      await saveService(payload);
      await loadServices();
      setSaveSuccess(editingService ? 'Service saved directly to Supabase and synchronized with live website!' : 'New service created and published live on website!');
      setTimeout(() => {
        setIsModalOpen(false);
      }, 700);
    } catch (err: any) {
      setSaveError('Save failed: ' + (err.message || 'Unknown error occurred while connecting to Supabase'));
    } finally {
      setIsSaving(false);
    }
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
            Manage titles, required document lists, regulatory disclaimers, and benefits for all statutory service lines.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
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

      {/* Edit / Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92dvh] overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {editingService ? `Edit Service: ${editingService.title}` : 'Add New Government / Business Service'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingService 
                    ? `Update guidelines, documents and public information for /${editingService.slug}`
                    : 'Publish a new statutory service directly to Supabase and live website'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                
                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <X className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{saveError}</span>
                  </div>
                )}

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{saveSuccess}</span>
                  </div>
                )}

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

              </div>

              {/* Modal Footer */}
              <div className="shrink-0 p-4 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Save & Synchronize</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

