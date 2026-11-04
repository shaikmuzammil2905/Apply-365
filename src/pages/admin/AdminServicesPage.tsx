import React, { useState, useEffect } from 'react';
import { getServices, saveService, getDefaultSubServices } from '../../services/dataSyncService';
import { ServiceDetail, SubServiceOption, PricingModel } from '../../types/services';
import { calculateServicePrice, getStartingPrice } from '../../utils/pricingHelper';
import { 
  Layers, 
  Edit, 
  ExternalLink, 
  Search, 
  Check, 
  X, 
  FileText, 
  CheckCircle2, 
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  ListPlus,
  RotateCcw,
  IndianRupee,
  Tag,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingService, setEditingService] = useState<ServiceDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ServiceDetail>>({});
  const [subServices, setSubServices] = useState<SubServiceOption[]>([]);
  const [newSubServiceLabel, setNewSubServiceLabel] = useState('');
  const [docsText, setDocsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [subServicesSuccess, setSubServicesSuccess] = useState('');

  // Service Pricing Configuration State
  const [pricingEnabled, setPricingEnabled] = useState(true);
  const [pricingModel, setPricingModel] = useState<PricingModel>('subservice_based');
  const [servicePrice, setServicePrice] = useState<number>(50);
  const [currency, setCurrency] = useState('₹');
  const [priceLabel, setPriceLabel] = useState('Service Processing Fee');
  const [priceDescription, setPriceDescription] = useState('Complete your application and document submission.');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [discountedPrice, setDiscountedPrice] = useState<string>('');
  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);

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
    setSubServices([
      { value: 'standard-filing', label: 'Standard Service Application', price: 50, isActive: true },
      { value: 'priority-filing', label: 'Priority / Fast-Track Assistance', price: 80, isActive: true }
    ]);
    setNewSubServiceLabel('');
    setDocsText('Identity Proof: Valid government identification card\nAddress Proof: Recent utility bill or residential certificate');
    setBenefitsText('Guaranteed pre-verification of documents\nDirect portal submission assistance\nFast status tracking and support');
    
    // Pricing Defaults
    setPricingEnabled(true);
    setPricingModel('subservice_based');
    setServicePrice(50);
    setCurrency('₹');
    setPriceLabel('Service Processing Fee');
    setPriceDescription('Complete your application and document submission.');
    setOriginalPrice('');
    setDiscountedPrice('');
    setAdditionalFee(0);
    setTaxRate(0);

    setSaveError('');
    setSaveSuccess('');
    setSubServicesSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: ServiceDetail) => {
    setEditingService(svc);
    setFormData(svc);
    
    const subs = (svc.subServices && svc.subServices.length > 0)
      ? svc.subServices
      : getDefaultSubServices(svc.slug);
    setSubServices(subs);
    setNewSubServiceLabel('');
    setDocsText(svc.documents.map(d => `${d.name}: ${d.description || ''}`).join('\n'));
    setBenefitsText(svc.benefits.join('\n'));

    // Populate Pricing State
    setPricingEnabled(svc.pricingEnabled !== false);
    setPricingModel(svc.pricingModel || 'subservice_based');
    setServicePrice(svc.servicePrice !== undefined ? Number(svc.servicePrice) : 50);
    setCurrency(svc.currency || '₹');
    setPriceLabel(svc.priceLabel || 'Service Processing Fee');
    setPriceDescription(svc.priceDescription || 'Complete your application and document submission.');
    setOriginalPrice(svc.originalPrice !== undefined ? String(svc.originalPrice) : '');
    setDiscountedPrice(svc.discountedPrice !== undefined ? String(svc.discountedPrice) : '');
    setAdditionalFee(svc.additionalFee !== undefined ? Number(svc.additionalFee) : 0);
    setTaxRate(svc.taxRate !== undefined ? Number(svc.taxRate) : 0);

    setSaveError('');
    setSaveSuccess('');
    setSubServicesSuccess('');
    setIsModalOpen(true);
  };

  const handleQuickSaveSubServices = async () => {
    if (!editingService) return;
    setIsSaving(true);
    setSaveError('');
    setSubServicesSuccess('');
    try {
      const updatedService: ServiceDetail = {
        ...editingService,
        subServices: subServices.length > 0 ? subServices : undefined,
        pricingEnabled,
        pricingModel,
        servicePrice: Number(servicePrice) || 50,
        currency,
        priceLabel,
        priceDescription,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
        additionalFee: Number(additionalFee) || 0,
        taxRate: Number(taxRate) || 0
      };
      await saveService(updatedService);
      await loadServices();
      setSubServicesSuccess('Sub-services and fee configuration saved and synchronized with live website!');
      setTimeout(() => setSubServicesSuccess(''), 4000);
    } catch (err: any) {
      setSaveError('Sub-service save failed: ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  // Fixed Add Option handler: immediately appends an editable option row
  const handleAddSubService = () => {
    const rawLabel = newSubServiceLabel.trim();
    const label = rawLabel || `New Option ${subServices.length + 1}`;
    const slugBase = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `option-${subServices.length + 1}`;
    const uniqueValue = subServices.some(s => s.value === slugBase)
      ? `${slugBase}-${Date.now().toString().slice(-4)}`
      : slugBase;

    const defaultPrice = Number(servicePrice) || 50;

    setSubServices(prev => [
      ...prev,
      { 
        value: uniqueValue, 
        label, 
        price: defaultPrice,
        isActive: true,
        displayOrder: prev.length + 1
      }
    ]);
    setNewSubServiceLabel('');
  };

  const handleUpdateSubService = (index: number, key: keyof SubServiceOption, val: any) => {
    setSubServices(prev => {
      const next = [...prev];
      const current = next[index];
      if (key === 'label') {
        const oldAutoSlug = current.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const isAutoSlug = !current.value || current.value === oldAutoSlug;
        next[index] = {
          ...current,
          label: val,
          value: isAutoSlug ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : current.value
        };
      } else {
        next[index] = { ...current, [key]: val };
      }
      return next;
    });
  };

  const handleDeleteSubService = (index: number) => {
    setSubServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveSubService = (index: number, dir: 'up' | 'down') => {
    if (dir === 'up' && index === 0) return;
    if (dir === 'down' && index === subServices.length - 1) return;
    setSubServices(prev => {
      const next = [...prev];
      const targetIdx = dir === 'up' ? index - 1 : index + 1;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleResetDefaultSubServices = () => {
    const slug = formData.slug || editingService?.slug || '';
    const def = getDefaultSubServices(slug);
    setSubServices(def);
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
        subServices: subServices.length > 0 ? subServices : undefined,
        documents: parsedDocs.length > 0 ? parsedDocs : (editingService ? editingService.documents : [{ name: 'Identity Proof', description: 'Valid government ID card.' }]),
        benefits: parsedBenefits.length > 0 ? parsedBenefits : (editingService ? editingService.benefits : ['Zero error processing', 'Official verification assistance']),
        processSteps: editingService?.processSteps || [
          { title: 'Document Verification', description: 'Our documentation team reviews your proof.' },
          { title: 'Form Submission', description: 'Accurate filing on official regulatory portal.' }
        ],
        faqs: editingService?.faqs || [],

        // Pricing Configuration
        pricingEnabled,
        pricingModel,
        servicePrice: Number(servicePrice) || 50,
        currency,
        priceLabel,
        priceDescription,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
        additionalFee: Number(additionalFee) || 0,
        taxRate: Number(taxRate) || 0,
      };

      await saveService(payload);
      await loadServices();
      setSaveSuccess(editingService ? 'Service and dynamic pricing saved and synchronized with live website!' : 'New service created and published live on website!');
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
            Manage titles, required document lists, dynamic pricing, sub-service fees, and regulatory guidance for all statutory services.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
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
        {filtered.map((service) => {
          const priceInfo = getStartingPrice(service);
          return (
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {priceInfo.isFree ? 'Free' : `From ${priceInfo.formatted}`}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {service.badge}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {service.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.shortDescription}
                </p>

                {/* Sub-services count & Fee summary */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium flex items-center gap-1">
                    <ListPlus className="w-3.5 h-3.5 text-[#104A96]" />
                    <span>Sub-Services:</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {(service.subServices && service.subServices.length > 0) ? service.subServices.length : getDefaultSubServices(service.slug).length} Options
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Configured Fee:</span>
                  </span>
                  <span className="font-bold text-emerald-700">
                    {service.pricingEnabled === false ? 'Free' : `₹${service.servicePrice ?? 50} (${service.pricingModel === 'subservice_based' ? 'Per Option' : 'Flat'})`}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-slate-600">
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#104A96] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Service</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[94dvh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header without top-right close/cancel as requested */}
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#104A96] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {editingService ? `Edit Service: ${editingService.title}` : 'Add New Government / Business Service'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingService 
                      ? `Update guidelines, documents, fee configuration and public information for /${editingService.slug}`
                      : 'Publish a new statutory service directly to Supabase and live website'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
                
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

                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Service Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Badge Label</label>
                    <input
                      type="text"
                      value={formData.badge || ''}
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
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Guidance Description</label>
                  <textarea
                    rows={3}
                    value={formData.fullDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Official Regulatory Disclaimer</label>
                  <textarea
                    rows={2}
                    value={formData.officialDisclaimer || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, officialDisclaimer: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>

                {/* ========================================================================= */}
                {/* DEDICATED SECTION: SERVICE PRICING & FEE CONFIGURATION                    */}
                {/* ========================================================================= */}
                <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-200/80 rounded-2xl shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#104A96] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                          <span>Service Pricing & Fee Configuration</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Live Gateway Linked
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Set base facilitation fee, currency, fee descriptions, and choose your customer pricing model.
                        </p>
                      </div>
                    </div>

                    {/* Enable / Disable Pricing Toggle */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-bold text-slate-700">Enable Pricing:</span>
                      <button
                        type="button"
                        onClick={() => setPricingEnabled(!pricingEnabled)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          pricingEnabled 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {pricingEnabled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>ON (Fee Charged)</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>OFF (Free / ₹0)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {pricingEnabled && (
                    <div className="space-y-3.5">
                      {/* Pricing Model Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-[#104A96]" />
                          <span>Pricing Model Structure</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            {
                              id: 'subservice_based',
                              title: 'Sub-Service Level (Recommended)',
                              desc: 'Each option has its own fee (e.g. Name: ₹50, DOB: ₹70)'
                            },
                            {
                              id: 'service_based',
                              title: 'Fixed Service Price',
                              desc: 'Flat rate applied to all sub-services uniformly'
                            },
                            {
                              id: 'free',
                              title: 'Free Statutory Service',
                              desc: 'Filing & guidance provided completely free (₹0)'
                            }
                          ].map((model) => (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => setPricingModel(model.id as PricingModel)}
                              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                                pricingModel === model.id
                                  ? 'border-[#104A96] bg-white ring-2 ring-[#104A96]/20 shadow-xs'
                                  : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                              }`}
                            >
                              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                                <span>{model.title}</span>
                                {pricingModel === model.id && <Check className="w-3.5 h-3.5 text-[#104A96]" />}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                {model.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pricing Input Fields Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Default Service Fee (₹) *</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min={0}
                              value={servicePrice}
                              onChange={(e) => setServicePrice(Math.max(0, Number(e.target.value)))}
                              className="w-full bg-white border border-slate-300 rounded-xl pl-6 pr-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Currency</label>
                          <input
                            type="text"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                            placeholder="₹"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Additional Handling Fee (₹)</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min={0}
                              value={additionalFee}
                              onChange={(e) => setAdditionalFee(Math.max(0, Number(e.target.value)))}
                              className="w-full bg-white border border-slate-300 rounded-xl pl-6 pr-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Original MRP / Strikethrough (₹)</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min={0}
                              value={originalPrice}
                              onChange={(e) => setOriginalPrice(e.target.value)}
                              placeholder="e.g. 100"
                              className="w-full bg-white border border-slate-300 rounded-xl pl-6 pr-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Price Display Label</label>
                          <input
                            type="text"
                            value={priceLabel}
                            onChange={(e) => setPriceLabel(e.target.value)}
                            placeholder="e.g. Service Processing Fee"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Customer Price Description</label>
                          <input
                            type="text"
                            value={priceDescription}
                            onChange={(e) => setPriceDescription(e.target.value)}
                            placeholder="e.g. Complete your application and document submission."
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Live Calculation Preview Banner */}
                      <div className="p-3 bg-white rounded-xl border border-blue-200/80 flex items-center justify-between text-xs shadow-2xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Info className="w-4 h-4 text-[#104A96] shrink-0" />
                          <span>
                            {pricingModel === 'subservice_based'
                              ? 'Per-option fees active. Select/edit each sub-service below.'
                              : pricingModel === 'free'
                              ? 'Filing marked 100% Free for citizens.'
                              : `Flat Base: ₹${servicePrice} + Extra: ₹${additionalFee} =`}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-emerald-700 text-sm">
                          {pricingModel === 'free' 
                            ? 'Free (₹0)' 
                            : pricingModel === 'subservice_based'
                            ? `Base: ₹${servicePrice} (or Sub-Service Fee)`
                            : `Total Payable: ₹${Number(servicePrice) + Number(additionalFee)}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ========================================================================= */}
                {/* APPLICATION OPTIONS & SUB-SERVICES (WITH INDIVIDUAL PRICING)             */}
                {/* ========================================================================= */}
                <div className="space-y-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <label className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <ListPlus className="w-4 h-4 text-[#104A96]" />
                        <span>Application Options & Sub-Services ({subServices.length} Options)</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Customize what options customers see under "Service Required *" and configure individual prices for each option.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleResetDefaultSubServices}
                        title="Reset to official statutory defaults"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#104A96] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        <span>Reset Defaults</span>
                      </button>
                      {editingService && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleQuickSaveSubServices}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Sub-Services</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {subServicesSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{subServicesSuccess}</span>
                    </div>
                  )}

                  {/* Sub-services Table Header */}
                  <div className="hidden sm:grid grid-cols-12 gap-2 px-3 text-[10px] uppercase font-bold text-slate-400">
                    <span className="col-span-1 text-center">#</span>
                    <span className="col-span-5">Sub-Service Name</span>
                    <span className="col-span-3">Slug / Code</span>
                    <span className="col-span-2">Price (₹)</span>
                    <span className="col-span-1 text-right">Actions</span>
                  </div>

                  {/* Sub-services list */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {subServices.length === 0 ? (
                      <div className="p-6 bg-white border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                        No sub-service options added yet. Click <strong>+ Add Option</strong> below to create the first option row.
                      </div>
                    ) : (
                      subServices.map((sub, idx) => (
                        <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 bg-white p-2.5 border border-slate-200 rounded-xl shadow-2xs items-center">
                          <div className="hidden sm:block col-span-1 text-[11px] font-bold text-slate-400 text-center">
                            {idx + 1}.
                          </div>
                          
                          {/* Option Label */}
                          <div className="w-full sm:col-span-5">
                            <input
                              type="text"
                              value={sub.label}
                              onChange={(e) => handleUpdateSubService(idx, 'label', e.target.value)}
                              placeholder="Option Label (e.g. Address Update Assistance)"
                              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-[#104A96] focus:outline-none"
                            />
                          </div>

                          {/* Slug / Code */}
                          <div className="w-full sm:col-span-3">
                            <input
                              type="text"
                              value={sub.value}
                              onChange={(e) => handleUpdateSubService(idx, 'value', e.target.value)}
                              placeholder="option-code"
                              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-mono text-slate-500 focus:ring-1 focus:ring-[#104A96] focus:outline-none"
                            />
                          </div>

                          {/* Individual Price (₹) */}
                          <div className="w-full sm:col-span-2 flex items-center gap-1">
                            <div className="relative w-full">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min={0}
                                value={sub.price !== undefined ? sub.price : 50}
                                onChange={(e) => handleUpdateSubService(idx, 'price', Math.max(0, Number(e.target.value)))}
                                title="Sub-Service Price in INR"
                                className="w-full border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 text-xs font-bold text-emerald-800 focus:ring-1 focus:ring-[#104A96] focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="w-full sm:col-span-1 flex items-center justify-end gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSubService(idx, 'up')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded hover:bg-slate-100 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === subServices.length - 1}
                              onClick={() => handleMoveSubService(idx, 'down')}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded hover:bg-slate-100 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubService(idx)}
                              className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                              title="Remove Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Sub-Service Input with resilient + Add Option */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <input
                      type="text"
                      value={newSubServiceLabel}
                      onChange={(e) => setNewSubServiceLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubService();
                        }
                      }}
                      placeholder="Type new option name (e.g. Address Update Assistance) or click Add Option directly..."
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubService}
                      className="px-4 py-2 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Option</span>
                    </button>
                  </div>
                </div>

                {/* Required Documents Checklist */}
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

                {/* Key Benefits */}
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

              {/* Modal Footer (Sticky at bottom so Save is ALWAYS visible) */}
              <div className="shrink-0 sticky bottom-0 p-4 sm:p-5 border-t border-slate-200 flex items-center justify-between sm:justify-end gap-3 bg-white/95 backdrop-blur-md shadow-lg z-30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving & Synchronizing...</span>
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
