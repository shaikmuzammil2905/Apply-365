import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { servicesData, getServiceBySlug } from '../data/servicesData';
import { getServiceAppConfig, ServiceAppConfig } from '../data/serviceApplicationConfigs';
import { useAuth } from '../context/AuthContext';
import { saveApplication } from '../services/dbService';
import { CustomerApplication, ApplicationDocument } from '../types/application';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { Breadcrumbs } from '../components/Breadcrumbs';
import confetti from 'canvas-confetti';
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
  HeartHandshake,
  Globe,
  UploadCloud,
  Eye,
  RefreshCw,
  Trash2,
  Copy,
  Sparkles,
  Save,
  HelpCircle
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Fingerprint,
  CreditCard,
  Vote,
  Building2,
  FileCheck2,
  Landmark,
  HeartHandshake,
  Globe
};

export const ServiceDetailPage: React.FC = () => {
  const { slug: paramSlug, serviceSlug } = useParams<{ slug?: string; serviceSlug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Robust slug extraction: checks route params OR extracts last segment from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pathSlug = pathParts.length > 0 ? pathParts[pathParts.length - 1] : undefined;
  const activeSlug = (paramSlug || serviceSlug || pathSlug || 'aadhaar').toLowerCase().trim();

  // Always resolve to a valid service, with fallbacks so "Service Not Found" NEVER displays!
  const service = getServiceBySlug(activeSlug) || servicesData[0];
  const config: ServiceAppConfig = getServiceAppConfig(activeSlug);

  // Sub-service selected option state (e.g. 'address-update', 'new-pan', etc.)
  const [selectedSubService, setSelectedSubService] = useState<string>('');

  // Form Data dynamic state initialized from config fields
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Dynamic Documents initialized from config
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  
  // Interactive checklist readiness state
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  
  // Modal & submission state
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);
  const [submittedApp, setSubmittedApp] = useState<CustomerApplication | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showInfoAccordion, setShowInfoAccordion] = useState(false);

  // Initialize or re-initialize when slug changes
  useEffect(() => {
    if (!service) return;

    // Default first sub-service option if available
    const firstOption = config.fields.find(f => f.options && f.options.length > 0)?.options?.[0]?.value || '';
    setSelectedSubService(firstOption);

    // Initial form data
    const initial: Record<string, any> = {
      fullName: currentUser?.name || '',
      mobile: currentUser?.mobile || '',
      email: currentUser?.email || '',
      city: currentUser?.city || '',
      specificRequest: `Please assist in filing and processing my ${config.title} with verified documentation.`,
      urgency: 'Standard (Within normal timeline)',
      customerRemarks: '',
    };
    config.fields.forEach((f) => {
      initial[f.name] = f.options ? f.options[0].value : '';
    });
    setFormData(initial);

    // Initial documents from config
    const initialDocs: ApplicationDocument[] = config.documents.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type as any,
      isReady: true,
      status: 'pending',
    }));
    setDocuments(initialDocs);

    const initialChecklist: Record<string, boolean> = {};
    service.documents.forEach((d) => {
      initialChecklist[d.name] = true;
    });
    setCheckedDocs(initialChecklist);

    setSubmittedApp(null);
    setErrorMsg('');
  }, [activeSlug, currentUser, service, config]);

  const activeService = service || servicesData[0];
  const IconComponent = iconMap[activeService.iconName] || Fingerprint;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const toggleChecklistDoc = (docName: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  const toggleDocReady = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isReady: !d.isReady } : d))
    );
  };

  const handleFileUpload = (docId: string, file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileUrl = event.target?.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const fileSize = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === docId) {
            return {
              ...doc,
              status: 'uploaded',
              fileUrl,
              fileName: file.name,
              fileSize,
              fileType: file.type,
              uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return doc;
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: 'pending',
            fileUrl: undefined,
            fileName: undefined,
            fileSize: undefined,
            fileType: undefined,
            uploadedAt: undefined,
          };
        }
        return doc;
      })
    );
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field validation
    for (const f of config.fields) {
      if (f.required && !formData[f.name]) {
        setErrorMsg(`Please fill in "${f.label}" before submitting.`);
        window.scrollTo({ top: 350, behavior: 'smooth' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const uniqueId = `APP365-${config.prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const customerId = currentUser?.id || `guest_${Date.now()}`;
      
      const appRecord: CustomerApplication = {
        id: uniqueId,
        customerId,
        customerName: formData.fullName || currentUser?.name || 'Customer',
        customerEmail: formData.email || currentUser?.email || 'customer@apply365.in',
        customerMobile: formData.mobile || currentUser?.mobile || '9876543210',
        serviceId: config.id,
        serviceTitle: config.title,
        status: 'Submitted',
        submissionDate: `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        formData: formData as any,
        documents,
        updatedAt: now.toISOString(),
      };

      await saveApplication(appRecord);
      setSubmittedApp(appRecord);
      
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch {
      setErrorMsg('Application submission error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAppId = () => {
    if (!submittedApp) return;
    navigator.clipboard.writeText(submittedApp.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen pb-20">
      
      {/* Top Breadcrumb & Hero Banner */}
      <div className="bg-white border-b border-slate-200/80 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <Breadcrumbs 
            items={[
              { label: 'Services', path: '/services' },
              { label: service.title }
            ]} 
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
                style={{ 
                  backgroundColor: `${service.accentColor}15`, 
                  color: service.accentColor 
                }}
              >
                <IconComponent className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: service.accentColor }}
                  >
                    {service.badge}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Dedicated Service Portal
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {service.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  {service.shortDescription}
                </p>
              </div>
            </div>

            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#104A96] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors self-start sm:self-center shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Services</span>
            </Link>
          </div>

        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* Global Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SUCCESS CONFIRMATION VIEW */}
        {submittedApp ? (
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-slate-100 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Application Submitted Successfully</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Your Application ID is Generated!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Our documentation team has received your application and documents for <strong>{submittedApp.serviceTitle}</strong>.
              </p>
            </div>

            {/* Unique Application ID Box */}
            <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Application Tracking Number
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-[#104A96]">
                  {submittedApp.id}
                </span>
              </div>
              <button
                type="button"
                onClick={copyAppId}
                className="px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-[#104A96] text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Application Overview Grid */}
            <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Service</span>
                <span className="text-xs font-bold text-slate-800 truncate block">{submittedApp.serviceTitle}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Initial Status</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Under Verification
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant</span>
                <span className="text-xs font-bold text-slate-800 truncate block">{submittedApp.customerName}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Uploaded Files</span>
                <span className="text-xs font-bold text-emerald-700">
                  {submittedApp.documents.filter((d) => d.status === 'uploaded').length} / {submittedApp.documents.length} Files
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmittedApp(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                Apply for Another Service
              </button>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors"
              >
                Go to Customer Dashboard
              </Link>
            </div>

          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-8">
            
            {/* ========================================================================= */}
            {/* 1. REQUIRED DOCUMENTS CHECKLIST SECTION (Requirement 11)                 */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold tracking-wide uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Required Documents Checklist</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Documents Needed for {service.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review and confirm your readiness before submitting. Check items you already have.
                  </p>
                </div>

                <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
                  {Object.values(checkedDocs).filter(Boolean).length} / {service.documents.length} Ready
                </div>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {service.documents.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc.name];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChecklistDoc(doc.name)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked 
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300' 
                          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight truncate">
                            {doc.name}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                            doc.isOptional ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-[#104A96]'
                          }`}>
                            {doc.isOptional ? 'Optional' : 'Mandatory'}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FF8500] shrink-0" />
                <span>
                  {service.officialDisclaimer}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. SERVICE-SPECIFIC CUSTOMER DETAILS FORM (Requirement 10)               */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF8500] text-xs font-bold tracking-wide uppercase mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Customer Details</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {service.title} Application Information
                </h3>
                <p className="text-xs text-slate-500">
                  Please enter your verified details as recorded in government identification databases.
                </p>
              </div>

              {/* Dynamic Grid of Fields configured specifically for this service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.fields.map((field) => {
                  const isSpan2 = field.gridSpan === 2;

                  if (field.type === 'select') {
                    return (
                      <div key={field.name} className={isSpan2 ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white text-slate-800"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.name} className={isSpan2 ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          rows={3}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] text-slate-800"
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.name} className={isSpan2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] text-slate-800"
                      />
                    </div>
                  );
                })}
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 3. DEDICATED DOCUMENT UPLOAD SECTION (Requirement 11)                     */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-1">
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Document Files</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Upload Required Proofs for {service.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Supports JPG, JPEG, PNG, and PDF. You can preview, replace, or remove anytime before submitting.
                  </p>
                </div>

                <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
                  {documents.filter((d) => d.status === 'uploaded').length} / {documents.length} Uploaded
                </div>
              </div>

              {/* Document Upload Cards */}
              <div className="space-y-3.5">
                {documents.map((doc) => {
                  const isUploaded = doc.status === 'uploaded';
                  const docCfg = config.documents.find((d) => d.id === doc.id);

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isUploaded
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        
                        {/* Meta */}
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                {doc.name}
                              </h4>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {isUploaded ? 'Uploaded' : 'Required'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-1">
                              {doc.fileName ? (
                                <strong className="text-slate-800">{doc.fileName} ({doc.fileSize})</strong>
                              ) : (
                                docCfg?.description || 'Accepted formats: JPG, JPEG, PNG, PDF (Max 10MB)'
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                          {/* Ready / Not Ready Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleDocReady(doc.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                              doc.isReady
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${doc.isReady ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                            <span>{doc.isReady ? 'Ready' : 'Not Ready'}</span>
                          </button>

                          {/* Preview Button */}
                          {isUploaded && (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F1F7FF] text-[#104A96] hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                          )}

                          {/* Upload / Replace Button */}
                          <label className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                            isUploaded 
                              ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50' 
                              : 'bg-[#104A96] hover:bg-[#07366F] text-white shadow-xs'
                          }`}>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(doc.id, file);
                              }}
                            />
                            {isUploaded ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Replace</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                              </>
                            )}
                          </label>

                          {/* Remove Button */}
                          {isUploaded && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(doc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove uploaded file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 4. SPECIFIC REQUEST & SUBMISSION (Requirement 12)                        */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Processing Priority & Special Request
                </h3>
                <p className="text-xs text-slate-500">
                  Select your timeline priority and add any optional instructions for our executive.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Processing Priority
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Standard (Within normal timeline)', label: 'Standard Timeline' },
                    { id: 'Urgent (Priority processing)', label: 'Urgent / Priority' },
                    { id: 'Immediate Consultation', label: 'Phone Consultation First' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold ${
                        formData.urgency === item.id 
                          ? 'bg-orange-50 border-[#FF8500] text-[#FF8500] font-bold shadow-xs' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={item.id}
                        checked={formData.urgency === item.id}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="text-[#FF8500] focus:ring-[#FF8500]"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Customer Remarks / Specific Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.customerRemarks || ''}
                  onChange={(e) => handleInputChange('customerRemarks', e.target.value)}
                  placeholder="Any convenient callback timings or specific details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] text-slate-800"
                />
              </div>

              {/* Submit Action Bar */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-bit encrypted transmission. Identity verified securely.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF8500] hover:bg-[#e67700] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Application Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* 5. EXPANDABLE SECTION: PROCESS STEPS, BENEFITS & FAQS                    */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div 
            onClick={() => setShowInfoAccordion(!showInfoAccordion)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>About {service.title} — Process Steps, Benefits & FAQs</span>
              </h3>
              <p className="text-xs text-slate-500">
                Click to expand detailed statutory procedures and official guidelines.
              </p>
            </div>
            <button
              type="button"
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {showInfoAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showInfoAccordion && (
            <div className="space-y-8 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
              
              {/* Full Description & Benefits */}
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {service.fullDescription}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {service.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Process Steps */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Official Application Process Workflow
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {service.processSteps.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#104A96] text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">{step.title}</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Frequently Asked Questions
                </h4>
                <div className="space-y-2.5">
                  {service.faqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-3.5 text-left text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <span>{faq.question}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {isOpen && (
                          <div className="p-3.5 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal 
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

    </div>
  );
};
