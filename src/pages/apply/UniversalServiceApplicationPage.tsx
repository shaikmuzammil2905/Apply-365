import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveApplication } from '../../services/dbService';
import { serviceAppConfigs, ServiceAppConfig } from '../../data/serviceApplicationConfigs';
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
};

export const UniversalServiceApplicationPage: React.FC = () => {
  const { serviceSlug } = useParams<{ serviceSlug?: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const slug = (serviceSlug || 'aadhaar').toLowerCase();
  const config: ServiceAppConfig = serviceAppConfigs[slug] || serviceAppConfigs.aadhaar;
  const ServiceIcon = iconMap[config.id] || Fingerprint;

  // Stepper state: 1 = Details, 2 = Document Upload, 3 = Specific Request, 4 = Status Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

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
    const currentConfig = serviceAppConfigs[slug] || serviceAppConfigs.aadhaar;
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
      if (initial[f.name] === undefined) {
        initial[f.name] = f.options ? f.options[0].value : '';
      }
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
    setSubmittedApp(null);
  }, [slug, currentUser]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1 validation
  const handleProceedToDocs = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check mandatory fields
    for (const f of config.fields) {
      if (f.required && !formData[f.name]?.toString().trim()) {
        setErrorMsg(`Please fill in the required field: ${f.label}`);
        return;
      }
    }

    if (formData.mobile && formData.mobile.replace(/\D/g, '').length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setStep(2);
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

  // Proceed to Step 3
  const handleProceedToRequest = () => {
    const hasUploaded = documents.some((d) => d.status === 'uploaded');
    if (!hasUploaded) {
      const confirmContinue = window.confirm(
        'You have not uploaded any documents yet. Would you like to proceed and submit documents later or during verification?'
      );
      if (!confirmContinue) return;
    }
    setStep(3);
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
      setStep(4);
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
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFBFD]">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
              style={{ backgroundColor: `${config.accentColor}15`, color: config.accentColor }}
            >
              <ServiceIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#104A96] text-[11px] font-bold uppercase tracking-wide">
                <span>Customer Application Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
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

        {/* Stepper Indicator */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <div className="grid grid-cols-4 gap-2 text-center">
            
            <button
              type="button"
              onClick={() => step > 1 && step < 4 && setStep(1)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                step === 1 ? 'bg-blue-50 text-[#104A96] font-bold' : step > 1 ? 'text-emerald-700 font-semibold' : 'text-slate-400'
              }`}
            >
              <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                step === 1 ? 'bg-[#104A96] text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </span>
              <span className="text-[11px] sm:text-xs truncate">1. Details</span>
            </button>

            <button
              type="button"
              onClick={() => step > 2 && step < 4 && setStep(2)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                step === 2 ? 'bg-blue-50 text-[#104A96] font-bold' : step > 2 ? 'text-emerald-700 font-semibold' : 'text-slate-400'
              }`}
            >
              <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                step === 2 ? 'bg-[#104A96] text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </span>
              <span className="text-[11px] sm:text-xs truncate">2. Documents</span>
            </button>

            <button
              type="button"
              onClick={() => step > 3 && step < 4 && setStep(3)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                step === 3 ? 'bg-blue-50 text-[#104A96] font-bold' : step > 3 ? 'text-emerald-700 font-semibold' : 'text-slate-400'
              }`}
            >
              <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                step === 3 ? 'bg-[#104A96] text-white' : step > 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > 3 ? <Check className="w-4 h-4" /> : '3'}
              </span>
              <span className="text-[11px] sm:text-xs truncate">3. Request</span>
            </button>

            <div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
              step === 4 ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-400'
            }`}>
              <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                4
              </span>
              <span className="text-[11px] sm:text-xs truncate">4. Status</span>
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
        {/* STEP 1: SERVICE DETAILS FORM                                              */}
        {/* ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleProceedToDocs} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
            
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

            {/* Action Bar */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Save Draft</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all group"
              >
                <span>Submit Details & Continue to Upload</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DYNAMIC DOCUMENT UPLOADS (FRONT PIC, BACK PIC, PROOFS)             */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Required Proofs</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Upload Documents for {config.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Upload clear front photographs, back scans, or PDF files. You can preview, mark readiness, or replace anytime.
              </p>
            </div>

            {/* Document Upload Cards */}
            <div className="space-y-4">
              {documents.map((doc) => {
                const isUploaded = doc.status === 'uploaded';
                const docCfg = config.documents.find((d) => d.id === doc.id);

                return (
                  <div
                    key={doc.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isUploaded
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Document Meta */}
                      <div className="flex items-start gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isUploaded ? 'Uploaded' : 'Pending Upload'}
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
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        
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

                        {/* Preview */}
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

                        {/* Upload / Replace */}
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

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Details</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToRequest}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all group"
                >
                  <span>Continue to Specific Request</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SPECIFIC REQUEST & REMARKS                                        */}
        {/* ========================================================================= */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
            
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
                <div>Uploaded Proofs: <strong className="text-emerald-700">{documents.filter(d => d.status === 'uploaded').length} files</strong></div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Documents</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#FF8500] hover:bg-[#e67700] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: APPLICATION STATUS CONFIRMATION                                   */}
        {/* ========================================================================= */}
        {step === 4 && submittedApp && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-8 animate-in fade-in duration-300">
            
            <div className="text-center space-y-3 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {config.title} Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Your application and uploaded documents have been securely logged under your customer account.
              </p>
            </div>

            {/* Application ID Card */}
            <div className="bg-gradient-to-r from-[#104A96] to-[#07366F] rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-200 font-bold">Unique Application ID</span>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider mt-1 text-[#FF8500]">
                  {submittedApp.id}
                </div>
                <p className="text-xs text-blue-100 mt-1">Submitted on {submittedApp.submissionDate}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyAppId}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
                </button>

                <div className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-900 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-4 h-4" />
                  <span>{submittedApp.status}</span>
                </div>
              </div>
            </div>

            {/* Summary Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] border-b border-slate-200 pb-2">
                  Submitted Applicant Information
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Applicant:</span>
                    <span className="font-bold text-slate-900">{submittedApp.customerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold text-slate-900">{submittedApp.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Contact Mobile:</span>
                    <span className="font-bold text-slate-900">{submittedApp.customerMobile}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] border-b border-slate-200 pb-2">
                  Uploaded Proofs ({submittedApp.documents.filter(d => d.status === 'uploaded').length})
                </h4>
                <div className="space-y-2">
                  {submittedApp.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="w-3.5 h-3.5 text-[#104A96] shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                      </div>
                      {doc.status === 'uploaded' ? (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="text-[11px] font-bold text-[#104A96] hover:underline shrink-0"
                        >
                          View File
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not Uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Go to Customer Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSubmittedApp(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                Submit Another Application
              </button>
            </div>

          </div>
        )}

      </div>

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

    </div>
  );
};
