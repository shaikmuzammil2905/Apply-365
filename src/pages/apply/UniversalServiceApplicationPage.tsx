import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveApplication } from '../../services/dbService';
import { serviceAppConfigs, ServiceAppConfig, getServiceAppConfig } from '../../data/serviceApplicationConfigs';
import { 
  CustomerApplication, 
  ApplicationDocument 
} from '../../types/application';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { 
  Fingerprint, 
  CreditCard, 
  Vote, 
  Building2, 
  FileCheck2, 
  Landmark, 
  HeartHandshake,
  Globe,
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  ShieldCheck, 
  Clock, 
  Check, 
  HelpCircle,
  Copy,
  Sparkles
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  aadhaar: Fingerprint,
  'pan-card': CreditCard,
  'voter-id': Vote,
  msme: Building2,
  'labour-license': FileCheck2,
  'uan-pf': Landmark,
  esi: HeartHandshake,
  passport: Globe,
};

export const UniversalServiceApplicationPage: React.FC = () => {
  const { serviceSlug } = useParams<{ serviceSlug?: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const slug = (serviceSlug || 'aadhaar').toLowerCase();
  const config: ServiceAppConfig = getServiceAppConfig(slug);
  const ServiceIcon = iconMap[config.id] || Fingerprint;

  // Stepper state: 1 = Details & Documents, 2 = Specific Request, 3 = Status Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Data dynamic state initialized from config fields
  const [formData, setFormData] = useState<Record<string, any>>(() => {
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
      if (initial[f.name] === undefined) {
        initial[f.name] = f.options ? f.options[0].value : '';
      }
    });
    return initial;
  });

  // Dynamic Documents initialized from config
  const [documents, setDocuments] = useState<ApplicationDocument[]>(() => {
    return config.documents.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type as any,
      isReady: true,
      status: 'pending',
    }));
  });

  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);
  const [submittedApp, setSubmittedApp] = useState<CustomerApplication | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset / reload when service slug changes
  useEffect(() => {
    const currentConfig = getServiceAppConfig(slug);
    const initial: Record<string, any> = {
      fullName: currentUser?.name || '',
      mobile: currentUser?.mobile || '',
      email: currentUser?.email || '',
      city: currentUser?.city || '',
      specificRequest: `Please assist in filing and processing my ${currentConfig.title} with verified documentation.`,
      urgency: 'Standard (Within normal timeline)',
      customerRemarks: '',
    };
    currentConfig.fields.forEach((f) => {
      initial[f.name] = f.options ? f.options[0].value : '';
    });
    setFormData(initial);

    setDocuments(
      currentConfig.documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type as any,
        isReady: true,
        status: 'pending',
      }))
    );
    setStep(1);
    setErrorMsg('');
  }, [slug, currentUser]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  // Toggle Ready / Not Ready
  const toggleDocReady = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isReady: !d.isReady } : d))
    );
  };

  // Handle File Upload
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

  // Validate Step 1 details and proceed to Step 2 (Specific Request)
  const handleProceedToRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check required fields
    for (const f of config.fields) {
      if (f.required && !formData[f.name]) {
        setErrorMsg(`Please fill in "${f.label}" before proceeding.`);
        window.scrollTo({ top: 100, behavior: 'smooth' });
        return;
      }
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const appId = submittedApp?.id || `APP365-${config.prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      const appRecord: CustomerApplication = {
        id: appId,
        customerId: currentUser.id,
        customerName: formData.fullName || currentUser.name,
        customerEmail: formData.email || currentUser.email,
        customerMobile: formData.mobile || currentUser.mobile,
        serviceId: config.id,
        serviceTitle: config.title,
        status: 'Draft',
        submissionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        formData: formData as any,
        documents,
        updatedAt: new Date().toISOString(),
      };

      await saveApplication(appRecord);
      alert('Draft saved successfully in your customer dashboard!');
      navigate('/dashboard');
    } catch {
      alert('Failed to save draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final Submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    try {
      const uniqueId = `APP365-${config.prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const appRecord: CustomerApplication = {
        id: uniqueId,
        customerId: currentUser.id,
        customerName: formData.fullName || currentUser.name,
        customerEmail: formData.email || currentUser.email,
        customerMobile: formData.mobile || currentUser.mobile,
        serviceId: config.id,
        serviceTitle: config.title,
        status: 'Submitted',
        submissionDate: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formData: formData as any,
        documents,
        updatedAt: now.toISOString(),
      };

      await saveApplication(appRecord);
      setSubmittedApp(appRecord);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      alert('Application submission error. Please try again.');
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
    <div className="min-h-screen bg-[#FAFBFD] py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
              style={{ backgroundColor: `${config.accentColor}15`, color: config.accentColor }}
            >
              <ServiceIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#104A96] text-[10px] sm:text-[11px] font-bold uppercase tracking-wide">
                <span>Customer Application Portal</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1">
                {config.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {config.tagline}
              </p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#104A96] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 transition-colors shrink-0"
          >
            <span>Customer Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stepper Indicator (Clean 3-Step Flow: Details & Documents -> Specific Request -> Confirmation) */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-slate-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            
            <button
              type="button"
              onClick={() => step > 1 && step < 3 && setStep(1)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                step === 1 ? 'bg-blue-50 text-[#104A96] font-bold' : step > 1 ? 'text-emerald-700 font-semibold' : 'text-slate-400'
              }`}
            >
              <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                step === 1 ? 'bg-[#104A96] text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </span>
              <span className="text-[11px] sm:text-xs truncate">1. Details & Uploads</span>
            </button>

            <button
              type="button"
              onClick={() => step === 3 && setStep(2)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                step === 2 ? 'bg-blue-50 text-[#104A96] font-bold' : step > 2 ? 'text-emerald-700 font-semibold' : 'text-slate-400'
              }`}
            >
              <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                step === 2 ? 'bg-[#104A96] text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </span>
              <span className="text-[11px] sm:text-xs truncate">2. Specific Request</span>
            </button>

            <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
              step === 3 ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-400'
            }`}>
              <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                3
              </span>
              <span className="text-[11px] sm:text-xs truncate">3. Status</span>
            </div>

          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: SERVICE DETAILS & DIRECT DOCUMENT UPLOADS (FRONT PIC, BACK, ETC)  */}
        {/* ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleProceedToRequest} className="bg-white rounded-3xl p-5 sm:p-10 shadow-xl border border-slate-100 space-y-8">
            
            {/* Header info */}
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Enter Application Details</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Please enter accurate information as registered under government and official databases.
              </p>
            </div>

            {/* Dynamic Grid of Fields configured for this service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.fields.map((field) => {
                const isSpan2 = field.gridSpan === 2;

                if (field.type === 'select') {
                  return (
                    <div key={field.name} className={isSpan2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {field.label} {field.required && '*'}
                      </label>
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white"
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
                        {field.label} {field.required && '*'}
                      </label>
                      <textarea
                        rows={3}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.name} className={isSpan2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {field.label} {field.required && '*'}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                    />
                  </div>
                );
              })}
            </div>

            {/* DIRECT DOCUMENT UPLOADS SECTION (FRONT PIC, BACK PIC, PROOFS) */}
            <div className="pt-8 border-t border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Required Documents</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Upload Documents for {config.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload clear front & back photos or scans. You can also preview or replace anytime.
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
                        
                        {/* Document Meta */}
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.name}</h4>
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
                                docCfg?.description || 'Accepted: JPG, PNG, PDF (Max 10MB)'
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Ready Toggle & Actions */}
                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                          {/* Ready Toggle */}
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
                                <span>Upload Document</span>
                              </>
                            )}
                          </label>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Save Draft</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all group"
              >
                <span>Proceed to Specific Request</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SPECIFIC REQUEST & REMARKS                                        */}
        {/* ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="bg-white rounded-3xl p-5 sm:p-10 shadow-xl border border-slate-100 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Application Specifics & Remarks
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Provide any special instructions, urgent timelines, or notes for our executive team.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Specific Request / Scope of Work *
              </label>
              <textarea
                rows={3}
                required
                value={formData.specificRequest}
                onChange={(e) => handleInputChange('specificRequest', e.target.value)}
                placeholder="Describe your exact requirement..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
              />
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
                Customer Message / Remarks (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.customerRemarks}
                onChange={(e) => handleInputChange('customerRemarks', e.target.value)}
                placeholder="Any special remarks or convenient contact timings..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
              />
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">Submission Snapshot</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                <div>Applicant: <strong className="text-slate-800">{formData.fullName || currentUser?.name}</strong></div>
                <div>Service: <strong className="text-slate-800">{config.title}</strong></div>
                <div>Uploaded Proofs: <strong className="text-emerald-700">{documents.filter((d) => d.status === 'uploaded').length} files</strong></div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Details & Uploads</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF8500] hover:bg-[#e67700] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SUBMITTED APPLICATION CONFIRMATION & UNIQUE ID TRACKING            */}
        {/* ========================================================================= */}
        {step === 3 && submittedApp && (
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-slate-100 text-center space-y-6">
            
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
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
                Our documentation team has received your application and documents. You can track status anytime in your dashboard.
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
                <span className="text-xs font-bold text-slate-800">{submittedApp.serviceTitle}</span>
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
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                Go to Customer Dashboard
              </Link>

              <Link
                to={`/applications/${submittedApp.id}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors"
              >
                View Application Details
              </Link>
            </div>

          </div>
        )}

      </div>

      {/* Reusable Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

    </div>
  );
};
