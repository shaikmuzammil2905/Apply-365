import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getServiceBySlug, getInitialServiceBySlug, getWebsiteSettings, saveNewApplication } from '../services/dataSyncService';
import { servicesData } from '../data/servicesData';
import { ServiceDetail } from '../types/services';
import { WebsiteSettings } from '../types/admin';
import { getServiceAppConfig, ServiceAppConfig } from '../data/serviceApplicationConfigs';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { saveApplication } from '../services/dbService';
import { openRazorpayCheckout } from '../services/razorpayService';
import { CustomerApplication, ApplicationDocument } from '../types/application';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { downloadDocumentFile } from '../utils/fileDownloadHelper';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { generateInvoicePDF, generateApplicationSummaryPDF, formatINR } from '../utils/pdfGenerator';
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
  HelpCircle,
  Lock,
  Unlock,
  Download,
  Receipt,
  BadgeCheck,
  Zap,
  Edit3,
  Calendar,
  User,
  Clock
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

type ApplicationStep = 'form' | 'documents' | 'review' | 'payment' | 'success';

export const ServiceDetailPage: React.FC = () => {
  const { slug: paramSlug, serviceSlug } = useParams<{ slug?: string; serviceSlug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Robust slug extraction
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pathSlug = pathParts.length > 0 ? pathParts[pathParts.length - 1] : undefined;
  const activeSlug = (paramSlug || serviceSlug || pathSlug || 'aadhaar').toLowerCase().trim();

  // Dynamic service state
  const [service, setService] = useState<ServiceDetail>(() => getInitialServiceBySlug(activeSlug));
  const config: ServiceAppConfig = getServiceAppConfig(activeSlug);

  // Sync service from Supabase / dataSyncService
  useEffect(() => {
    let isMounted = true;
    getServiceBySlug(activeSlug).then((data) => {
      if (isMounted && data) {
        setService(data);
      }
    });

    const handleSync = () => {
      getServiceBySlug(activeSlug).then((data) => {
        if (isMounted && data) {
          setService(data);
        }
      });
    };

    window.addEventListener('apply365_data_sync', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('apply365_data_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [activeSlug]);

  // Selected sub-service
  const [selectedSubService, setSelectedSubService] = useState<string>('');

  // Multi-step Application-First State
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('form');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  
  // App in Progress / Submitted
  const [pendingApp, setPendingApp] = useState<CustomerApplication | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Document Preview Modal State
  const [previewDocIndex, setPreviewDocIndex] = useState<number>(-1);

  // Settings
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const feeAmount = websiteSettings?.applicationFee ?? 50;

  useEffect(() => {
    getWebsiteSettings().then(st => {
      if (st) setWebsiteSettings(st);
    });
  }, []);

  // Initialize or re-initialize form & documents when slug changes
  useEffect(() => {
    if (!service) return;

    const firstOption = (service.subServices && service.subServices.length > 0)
      ? service.subServices[0].value
      : config.fields.find(f => f.options && f.options.length > 0)?.options?.[0]?.value || '';
    setSelectedSubService(firstOption);

    const initial: Record<string, any> = {
      fullName: currentUser?.name || '',
      mobile: currentUser?.mobile || '',
      email: currentUser?.email || '',
      city: currentUser?.city || '',
      specificRequest: `Assistance in filing and verification for ${service.title}.`,
      urgency: 'Standard (Within normal timeline)',
      customerRemarks: '',
    };
    config.fields.forEach((f) => {
      const isServiceSelect = f.name.toLowerCase().includes('service') || f.name === 'serviceType' || f.name === 'passportServiceType';
      if (isServiceSelect && service.subServices && service.subServices.length > 0) {
        initial[f.name] = service.subServices[0].value;
      } else {
        initial[f.name] = f.options ? f.options[0].value : '';
      }
    });
    setFormData(initial);

    // Documents
    const dynamicDocsSource = (service.documents && service.documents.length > 0)
      ? service.documents.map((d, idx) => ({
          id: d.id || `doc-${activeSlug}-${idx}`,
          name: d.name,
          type: (d.category || 'proof') as any,
          isReady: true,
          status: 'pending' as const,
          description: d.description || d.instructions,
          isMandatory: d.isMandatory !== false,
          isOptional: d.isOptional === true || d.isMandatory === false || d.name.toLowerCase().includes('(optional)')
        }))
      : config.documents.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type as any,
          isReady: true,
          status: 'pending' as const,
          description: d.description,
          isMandatory: d.isMandatory !== false,
          isOptional: (d as any).isOptional === true || d.name.toLowerCase().includes('(optional)')
        }));

    setDocuments(dynamicDocsSource);

    const initialChecklist: Record<string, boolean> = {};
    if (service.documents && Array.isArray(service.documents)) {
      service.documents.forEach((d) => {
        initialChecklist[d.name] = true;
      });
    }
    setCheckedDocs(initialChecklist);
    setCurrentStep('form');
    setPendingApp(null);
    setErrorMsg('');
  }, [activeSlug, currentUser, service, config]);

  const activeService = service || getInitialServiceBySlug(activeSlug);
  const IconComponent = iconMap[activeService.iconName] || Fingerprint;

  // Validation
  const validateField = (fieldName: string, rawVal: any): string => {
    const val = rawVal ? String(rawVal).trim() : '';
    const lower = fieldName.toLowerCase();

    // 1. Aadhaar Number (12 digits)
    if (lower.includes('aadhaar')) {
      if (!val) return '';
      const digits = val.replace(/\D/g, '');
      if (digits.length !== 12) {
        return 'Aadhaar number must be exactly 12 digits.';
      }
    }

    // 2. PIN Code (6 digits)
    if (lower.includes('pin') || lower.includes('pincode') || lower.includes('postal')) {
      if (!val) return '';
      const digits = val.replace(/\D/g, '');
      if (digits.length !== 6) {
        return 'PIN code must be exactly 6 digits.';
      }
    }

    // 3. Mobile Number (10 digits)
    if (lower.includes('mobile') || lower.includes('phone')) {
      if (!val) return '';
      const digits = val.replace(/\D/g, '');
      if (digits.length !== 10) {
        return 'Mobile number must be exactly 10 digits.';
      }
    }

    // 4. Email
    if (lower.includes('email')) {
      if (!val) return '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return 'Enter a valid email address.';
      }
    }

    // 5. PAN Number (10 alphanumeric chars: ABCDE1234F)
    if (lower.includes('pan') && !lower.includes('company') && !lower.includes('span')) {
      if (!val) return '';
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!panRegex.test(val)) {
        return 'PAN format must be 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).';
      }
    }

    return '';
  };

  const handleInputChange = (name: string, value: any) => {
    let cleanVal = value;
    const lower = name.toLowerCase();

    // Enforce digit-only constraints on Aadhaar, PIN, Mobile
    if (lower.includes('aadhaar')) {
      cleanVal = String(value).replace(/\D/g, '').slice(0, 12);
    } else if (lower.includes('pin') || lower.includes('pincode')) {
      cleanVal = String(value).replace(/\D/g, '').slice(0, 6);
    } else if (lower.includes('mobile') || lower.includes('phone')) {
      cleanVal = String(value).replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: cleanVal }));

    // Instant live validation
    const err = validateField(name, cleanVal);
    setFieldErrors((prev) => {
      const copy = { ...prev };
      if (err) {
        copy[name] = err;
      } else {
        delete copy[name];
      }
      return copy;
    });
  };

  // Step 2 -> Step 3: Validate form fields
  const handleProceedToDocuments = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const errors: Record<string, string> = {};
    for (const f of config.fields) {
      const val = formData[f.name];
      if (f.required && (!val || String(val).trim() === '')) {
        errors[f.name] = `${f.label} is required.`;
      } else if (val) {
        const customErr = validateField(f.name, val);
        if (customErr) errors[f.name] = customErr;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please correct the highlighted fields in red before proceeding.');
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    setCurrentStep('documents');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Step 3: File Upload Handler
  const handleFileUpload = (docId: string, file: File) => {
    if (!file) return;

    // File size check: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

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

  const handleRemoveFile = (docId: string) => {
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

  // Step 3 -> Step 4: Proceed to Review
  const handleProceedToReview = () => {
    setErrorMsg('');
    // Check if mandatory documents are uploaded
    const missingMandatory = documents.filter((d) => d.isMandatory && (!d.fileUrl || d.status !== 'uploaded'));
    if (missingMandatory.length > 0) {
      setErrorMsg(`Please upload all mandatory documents (${missingMandatory.map(d => d.name).join(', ')}) before proceeding to review.`);
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    setCurrentStep('review');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Step 4 -> Step 5: Save Application & Advance to Payment Step
  const handleSaveAndProceedToPayment = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const uniqueId = `APP365-${config.prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const customerId = currentUser?.id || `guest_${Date.now()}`;

      const appRecord: CustomerApplication = {
        id: uniqueId,
        customerId,
        customerName: formData.fullName || currentUser?.name || 'Customer',
        customerEmail: formData.email || currentUser?.email || 'applyallservices365@gmail.com',
        customerMobile: formData.mobile || currentUser?.mobile || '9121992365',
        serviceId: config.id,
        serviceSlug: activeSlug,
        serviceTitle: config.title,
        serviceType: selectedSubService || 'Standard',
        status: 'Submitted',
        paymentStatus: 'payment_pending',
        paymentAmount: feeAmount,
        submissionDate: now.toISOString(),
        createdAt: now.toISOString(),
        formData: formData as any,
        documents,
        updatedAt: now.toISOString(),
      };

      // 1. Save in local database and Supabase with payment_pending status
      await saveApplication(appRecord);
      await saveNewApplication(appRecord);

      setPendingApp(appRecord);
      setCurrentStep('payment');
      window.scrollTo({ top: 250, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Save application error:', err);
      setErrorMsg('Error saving application. Please verify details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 6: Final Razorpay Payment Execution
  const handleCompletePayment = async () => {
    if (!pendingApp) return;
    setErrorMsg('');
    setIsProcessingPayment(true);

    try {
      const payerName = pendingApp.customerName;
      const payerEmail = pendingApp.customerEmail;
      const payerPhone = pendingApp.customerMobile;
      const customKeyId = websiteSettings?.paymentGateway?.keyId;

      const response = await openRazorpayCheckout({
        amount: feeAmount,
        currency: 'INR',
        name: websiteSettings?.siteName || 'Apply365 — Services for People',
        description: `Apply-365 Service Processing Fee: ${pendingApp.serviceTitle}`,
        invoiceId: pendingApp.id,
        customerName: payerName,
        customerEmail: payerEmail,
        customerPhone: payerPhone,
        themeColor: websiteSettings?.paymentGateway?.themeColor || '#104A96',
        notes: {
          application_id: pendingApp.id,
          service_title: pendingApp.serviceTitle,
          customer_name: payerName,
          fee_type: 'Apply-365 Service Processing Fee'
        }
      }, customKeyId);

      if (response && response.razorpay_payment_id) {
        const txnId = response.razorpay_payment_id;
        const nowIso = new Date().toISOString();

        // Update application to fully verified and submitted state
        const updatedApp: CustomerApplication = {
          ...pendingApp,
          status: 'Completed',
          paymentStatus: 'payment_completed',
          paymentTransactionId: txnId,
          paymentDate: nowIso,
          paymentMethod: 'Razorpay',
          updatedAt: nowIso
        };

        await saveApplication(updatedApp);
        await saveNewApplication(updatedApp);
        setPendingApp(updatedApp);
        setCurrentStep('success');

        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.5 }
          });
        } catch {}

        window.scrollTo({ top: 150, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.warn('Payment failed or cancelled:', err);
      setErrorMsg(err?.message || 'Payment was not completed. Your application details remain safely saved; you can complete payment anytime.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // PDF Download Handlers
  const handleDownloadReceipt = () => {
    if (!pendingApp) return;
    try {
      const invPdf = generateInvoicePDF({
        id: `inv_${pendingApp.id}`,
        invoiceNumber: `INV-${pendingApp.id.replace('APP365-', '')}`,
        applicationId: pendingApp.id,
        customerId: pendingApp.customerId,
        customerName: pendingApp.customerName,
        customerEmail: pendingApp.customerEmail,
        customerMobile: pendingApp.customerMobile,
        serviceName: pendingApp.serviceTitle,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        items: [
          {
            id: 'item-1',
            description: `${pendingApp.serviceTitle} — Apply-365 Service Processing Fee`,
            quantity: 1,
            unitPrice: feeAmount,
            total: feeAmount
          }
        ],
        subtotal: feeAmount,
        taxAmount: 0,
        discount: 0,
        taxRate: 0,
        totalAmount: feeAmount,
        amountPaid: feeAmount,
        balanceDue: 0,
        paymentStatus: 'paid',
        invoiceStatus: 'finalized',
        payments: [
          {
            id: `pay_${pendingApp.id}`,
            amount: feeAmount,
            paymentDate: new Date().toISOString().slice(0, 10),
            paymentMethod: 'Razorpay',
            referenceNumber: pendingApp.paymentTransactionId || 'Razorpay Verified',
            recordedBy: 'Razorpay Payment Gateway',
            notes: 'Apply-365 Service Processing Fee paid online'
          }
        ],
        notes: `Official payment receipt for application ${pendingApp.id}. Apply-365 service facilitation charge.`
      });
      invPdf.save(`Apply365_${pendingApp.id}_Receipt.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handleDownloadSoftCopy = () => {
    if (!pendingApp) return;
    try {
      const appPdf = generateApplicationSummaryPDF(pendingApp);
      appPdf.save(`Apply365_${pendingApp.id}_Application_Dossier.pdf`);
    } catch (err) {
      console.error('Application PDF download error:', err);
    }
  };

  const copyAppId = () => {
    if (!pendingApp) return;
    navigator.clipboard.writeText(pendingApp.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen pb-24">
      
      {/* Top Header & Breadcrumb */}
      <div className="bg-white border-b border-slate-200/80 py-6 sm:py-9">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <Breadcrumbs 
            items={[
              { label: t('nav.services', 'Services'), path: '/services' },
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
                    {t('services.dedicatedPortal', 'Dedicated Service Portal')}
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
              <span>{t('app.back', 'Back to Services')}</span>
            </Link>
          </div>

          {/* Stepper Progress Bar */}
          {currentStep !== 'success' && (
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                {[
                  { step: 'form', label: `1. ${t('app.step2', 'Details')}` },
                  { step: 'documents', label: `2. ${t('app.step3', 'Documents')}` },
                  { step: 'review', label: `3. ${t('app.step4', 'Review')}` },
                  { step: 'payment', label: `4. ${t('app.step5', 'Payment')}` }
                ].map((s, idx) => {
                  const isCurrent = currentStep === s.step;
                  const isDone = 
                    (s.step === 'form' && currentStep !== 'form') ||
                    (s.step === 'documents' && (currentStep === 'review' || currentStep === 'payment')) ||
                    (s.step === 'review' && currentStep === 'payment');

                  return (
                    <div 
                      key={s.step} 
                      className={`p-2 rounded-xl transition-all ${
                        isCurrent 
                          ? 'bg-[#104A96] text-white shadow-xs' 
                          : isDone 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <span className="truncate block">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Main Form Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1 & 2: APPLICANT INFORMATION & DETAILS FORM                          */}
        {/* ========================================================================= */}
        {currentStep === 'form' && (
          <form onSubmit={handleProceedToDocuments} className="space-y-8 animate-in fade-in duration-200">
            
            {/* Sub-Service Option Selector */}
            {service.subServices && service.subServices.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <BadgeCheck className="w-5 h-5 text-[#104A96]" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    {t('app.serviceType', 'Select Specific Service Type')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {service.subServices.map((sub) => (
                    <div
                      key={sub.value}
                      onClick={() => setSelectedSubService(sub.value)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedSubService === sub.value
                          ? 'border-[#104A96] bg-blue-50/60 shadow-xs ring-2 ring-[#104A96]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{sub.label}</span>
                        {selectedSubService === sub.value && (
                          <div className="w-5 h-5 rounded-full bg-[#104A96] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      {sub.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{sub.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applicant Personal & Contact Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-5 h-5 text-[#104A96]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {t('app.step2', 'Applicant Information & Contact Details')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('app.fullName', 'Full Name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder={t('app.fullNamePlaceholder', 'Enter official name')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 bg-white ${
                      fieldErrors.fullName ? 'border-red-400 focus:ring-red-400 bg-red-50/30' : 'border-slate-300 focus:ring-[#104A96]'
                    }`}
                  />
                  {fieldErrors.fullName && <p className="text-[11px] text-red-600 font-semibold">{fieldErrors.fullName}</p>}
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('app.mobile', 'Mobile Number')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile || ''}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder={t('app.mobilePlaceholder', '10-digit mobile number')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 bg-white ${
                      fieldErrors.mobile ? 'border-red-400 focus:ring-red-400 bg-red-50/30' : 'border-slate-300 focus:ring-[#104A96]'
                    }`}
                  />
                  {fieldErrors.mobile && <p className="text-[11px] text-red-600 font-semibold">{fieldErrors.mobile}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('app.email', 'Email Address')} <span className="text-slate-400 font-normal">(for receipt)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('app.emailPlaceholder', 'yourname@gmail.com')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 bg-white ${
                      fieldErrors.email ? 'border-red-400 focus:ring-red-400 bg-red-50/30' : 'border-slate-300 focus:ring-[#104A96]'
                    }`}
                  />
                  {fieldErrors.email && <p className="text-[11px] text-red-600 font-semibold">{fieldErrors.email}</p>}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('app.city', 'City / Town')}
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white"
                  />
                </div>

                {/* Dynamic Config Fields (Service Specific) */}
                {config.fields.map((f) => {
                  if (['fullName', 'mobile', 'email', 'city'].includes(f.name)) return null;
                  const hasErr = fieldErrors[f.name];

                  return (
                    <div key={f.name} className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        {f.label} {f.required && <span className="text-red-500">*</span>}
                      </label>
                      {f.type === 'select' && f.options ? (
                        <select
                          value={formData[f.name] || ''}
                          onChange={(e) => handleInputChange(f.name, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white"
                        >
                          {f.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type || 'text'}
                          value={formData[f.name] || ''}
                          onChange={(e) => handleInputChange(f.name, e.target.value)}
                          placeholder={f.placeholder || f.label}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 bg-white ${
                            hasErr ? 'border-red-400 focus:ring-red-400 bg-red-50/30' : 'border-slate-300 focus:ring-[#104A96]'
                          }`}
                        />
                      )}
                      {hasErr && <p className="text-[11px] text-red-600 font-semibold">{hasErr}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Specific Request / Remarks */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('app.remarks', 'Specific Request / Customer Remarks')}
                </label>
                <textarea
                  rows={3}
                  value={formData.specificRequest || ''}
                  onChange={(e) => handleInputChange('specificRequest', e.target.value)}
                  placeholder="Provide any specific details or corrections needed..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white resize-none"
                />
              </div>

              {/* Continue to Documents Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{t('app.continueToDocs', 'Continue to Document Upload')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DOCUMENT UPLOAD CHECKLIST                                         */}
        {/* ========================================================================= */}
        {currentStep === 'documents' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold tracking-wide uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('docs.title', 'Required Supporting Documents')}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Documents Checklist for {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('docs.subtitle', 'Upload clear photos or scans (PDF, JPG, PNG). Ensure all text and dates are legible.')}
                  </p>
                </div>

                <div className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
                  {documents.filter((d) => d.status === 'uploaded').length} / {documents.length} Files Attached
                </div>
              </div>

              {/* Documents Cards Grid */}
              <div className="space-y-3.5">
                {documents.map((doc, idx) => {
                  const isUploaded = doc.status === 'uploaded' && doc.fileUrl;

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isUploaded 
                          ? 'border-emerald-300 bg-emerald-50/30' 
                          : doc.isMandatory 
                            ? 'border-slate-200 bg-white hover:border-slate-300' 
                            : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                            isUploaded ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isUploaded ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900">{doc.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                doc.isMandatory ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {doc.isMandatory ? t('docs.mandatory', 'Mandatory') : t('docs.optional', 'Optional')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {doc.description || 'Statutory proof document.'}
                            </p>
                            {isUploaded && (
                              <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold text-emerald-800">
                                <span>✓ {doc.fileName}</span>
                                {doc.fileSize && <span>({doc.fileSize})</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Upload & Action Buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          {isUploaded && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPreviewDocIndex(idx)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#104A96] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{t('docs.preview', 'Preview')}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveFile(doc.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Remove file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <label className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isUploaded
                              ? 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
                              : 'bg-[#104A96] hover:bg-[#07366F] text-white'
                          }`}>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(doc.id, file);
                              }}
                            />
                            {isUploaded ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{t('docs.replace', 'Replace')}</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>{t('docs.upload', 'Upload File')}</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('app.back', 'Back to Details')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToReview}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{t('docs.reviewAndProceed', 'Review Application Before Submission')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: APPLICATION REVIEW                                                */}
        {/* ========================================================================= */}
        {currentStep === 'review' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold tracking-wide uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('review.title', 'Review Application Details')}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {service.title} Application Summary
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('review.subtitle', 'Please verify all entered details and uploaded documents carefully before proceeding to payment.')}
                </p>
              </div>

              {/* Personal Details Summary */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#104A96]" />
                    <span>{t('review.personalDetails', 'Personal & Contact Information')}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('form')}
                    className="text-xs font-bold text-[#104A96] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('review.edit', 'Edit')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant Name</span>
                    <span className="font-bold text-slate-900 block truncate">{formData.fullName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile</span>
                    <span className="font-bold text-slate-900 block font-mono">{formData.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                    <span className="font-bold text-slate-900 block truncate">{formData.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Type</span>
                    <span className="font-bold text-[#104A96] block truncate capitalize">
                      {selectedSubService?.replace('-', ' ') || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Summary */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#104A96]" />
                    <span>{t('review.documentsAttached', 'Uploaded Supporting Documents')} ({documents.filter(d => d.status === 'uploaded').length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('documents')}
                    className="text-xs font-bold text-[#104A96] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('review.edit', 'Edit')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {documents.filter(d => d.status === 'uploaded').map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">{doc.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewDocIndex(idx)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#104A96] text-[11px] font-bold shrink-0"
                      >
                        Preview
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Notice */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-[#104A96] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-900 block">
                    {t('pay.serviceFeeTitle', 'Apply-365 Service Processing Fee')}: ₹{feeAmount}
                  </span>
                  <p className="text-slate-600">
                    {t('pay.disclaimer', 'This is a nominal Apply-365 platform processing and facilitation fee, not a government statutory tax.')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('documents')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('app.back', 'Back to Documents')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndProceedToPayment}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#104A96] to-[#0A2F63] hover:from-[#0c3c7d] hover:to-[#07244c] text-white font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Application...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('review.proceedToPayment', 'Submit Details & Proceed to Payment (₹50)')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: FINAL PAYMENT PAGE (PAYMENT-LAST)                                  */}
        {/* ========================================================================= */}
        {currentStep === 'payment' && pendingApp && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
              
              <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Application Saved (Reference: {pendingApp.id})</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {t('pay.title', 'Complete Your Application Payment')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {t('pay.pendingNotice', 'Your application is securely saved. Please complete the ₹50 fee to submit for officer review.')}
                  </p>
                </div>

                <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-left self-start sm:self-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Tracking Number</span>
                  <span className="font-mono font-black text-sm sm:text-base text-[#104A96] block">{pendingApp.id}</span>
                </div>
              </div>

              {/* Payment Summary Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <div className="lg:col-span-7 space-y-5">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {t('pay.summary', 'Payment Summary')}
                    </h3>

                    <div className="space-y-3 divide-y divide-slate-200/60 text-xs sm:text-sm">
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-600">{t('pay.service', 'Selected Service')}</span>
                        <span className="font-bold text-slate-900">{pendingApp.serviceTitle}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-slate-600">Applicant</span>
                        <span className="font-bold text-slate-900">{pendingApp.customerName}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <div>
                          <span className="text-slate-700 font-semibold block">{t('pay.serviceFeeTitle', 'Apply-365 Service Processing Fee')}</span>
                          <span className="text-[11px] text-slate-400 block">{t('pay.disclaimer', 'Private documentation facilitation charge')}</span>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">₹{feeAmount}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-slate-600">{t('pay.verification', 'Document Verification & Legal Review')}</span>
                        <span className="font-bold text-emerald-600">{t('pay.included', 'Included (₹0)')}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-slate-600">{t('pay.smsUpdates', 'SMS & WhatsApp Updates')}</span>
                        <span className="font-bold text-emerald-600">{t('pay.included', 'Included (₹0)')}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 text-base">
                        <span className="font-black text-slate-900">{t('pay.total', 'Total Amount Payable')}</span>
                        <span className="font-black text-2xl text-[#104A96]">₹{feeAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#104A96] shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block">256-Bit SSL</span>
                        <span className="text-[10px] text-slate-400">Bank Grade Security</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block">Instant Receipt</span>
                        <span className="text-[10px] text-slate-400">PDF Generated</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Pay Card */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-wider text-[#104A96] block">
                      Pay via Razorpay Gateway
                    </span>
                    <p className="text-xs text-slate-500">
                      Supports UPI (GPay, PhonePe, Paytm), Debit/Credit Cards & Net Banking.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Applicant Contact:</span>
                      <span className="font-mono font-bold text-slate-800">{pendingApp.customerMobile}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Payable:</span>
                      <span className="font-bold text-[#104A96]">₹{feeAmount}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCompletePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Connecting to Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>{t('pay.button', 'Pay ₹50 & Complete Application')}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    {t('pay.secureNotice', 'Secured by Razorpay • UPI, Cards, Net Banking & Wallets Accepted')}
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: SUCCESS CONFIRMATION                                              */}
        {/* ========================================================================= */}
        {currentStep === 'success' && pendingApp && (
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-slate-100 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('success.title', 'Your Application Has Been Successfully Submitted!')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Application Received & Processing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                {t('success.desc', 'Our documentation team has received your application and documents.')}
              </p>
            </div>

            {/* Application Tracking Number Card */}
            <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {t('success.trackingNo', 'Application Tracking Number')}
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-[#104A96]">
                  {pendingApp.id}
                </span>
              </div>
              <button
                type="button"
                onClick={copyAppId}
                className="px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-[#104A96] text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('success.copied', 'Copied!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('success.copy', 'Copy')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Application Overview Grid */}
            <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Service</span>
                <span className="text-xs font-bold text-slate-800 truncate block">{pendingApp.serviceTitle}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Status</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  {t('success.initialStatus', 'Application Received')}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Status</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Paid: ₹{feeAmount}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Razorpay Txn</span>
                <span className="text-[11px] font-mono font-bold text-slate-700 truncate block">
                  {pendingApp.paymentTransactionId || 'Verified'}
                </span>
              </div>
            </div>

            {/* PDF Downloads & Navigation */}
            <div className="pt-2 max-w-md mx-auto space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('success.downloadReceipt', 'Payment Receipt (PDF)')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSoftCopy}
                  className="w-full py-3 px-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('success.downloadSoftCopy', 'Soft Copy (PDF)')}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('form');
                    setPendingApp(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  {t('success.applyAnother', 'Apply for Another Service')}
                </button>

                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors text-center"
                >
                  {t('success.goToDashboard', 'Go to Citizen Dashboard')}
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Global Document Preview Modal */}
      {previewDocIndex >= 0 && documents[previewDocIndex] && (
        <DocumentPreviewModal
          document={documents[previewDocIndex]}
          documents={documents}
          currentIndex={previewDocIndex}
          onNavigate={(newIdx) => setPreviewDocIndex(newIdx)}
          onClose={() => setPreviewDocIndex(-1)}
          customerName={formData.fullName || currentUser?.name || 'Applicant'}
          applicationId={pendingApp?.id || 'Draft Application'}
        />
      )}

    </div>
  );
};
