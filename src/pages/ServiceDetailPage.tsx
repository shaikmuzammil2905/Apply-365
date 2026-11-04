import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getServiceBySlug, getInitialServiceBySlug, getWebsiteSettings, saveNewApplication } from '../services/dataSyncService';
import { servicesData } from '../data/servicesData';
import { ServiceDetail } from '../types/services';
import { WebsiteSettings } from '../types/admin';
import { getServiceAppConfig, ServiceAppConfig } from '../data/serviceApplicationConfigs';
import { useAuth } from '../context/AuthContext';
import { saveApplication } from '../services/dbService';
import { openRazorpayCheckout } from '../services/razorpayService';
import { CustomerApplication, ApplicationDocument } from '../types/application';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { generateInvoicePDF, formatINR } from '../utils/pdfGenerator';
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
  Zap
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

  // Dynamic service state with synchronous instant cache initialization
  const [service, setService] = useState<ServiceDetail>(() => getInitialServiceBySlug(activeSlug));
  const config: ServiceAppConfig = getServiceAppConfig(activeSlug);

  // Sync service from Supabase / dataSyncService and listen for Admin updates
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showInfoAccordion, setShowInfoAccordion] = useState(false);

  // Settings & Mandatory Payment Gate State
  const sessionPaymentKey = `apply365_verified_payment_${activeSlug}`;
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const [isPaymentVerified, setIsPaymentVerified] = useState<boolean>(false);
  const [paymentTxnId, setPaymentTxnId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(50);
  const [paymentVerifiedDate, setPaymentVerifiedDate] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [showPreDocPreview, setShowPreDocPreview] = useState<boolean>(true);

  // Load website settings & verify session payment status
  useEffect(() => {
    let isMounted = true;
    getWebsiteSettings().then(st => {
      if (isMounted && st) {
        setWebsiteSettings(st);
        const fee = st.applicationFee !== undefined ? Number(st.applicationFee) : 50;
        setPaymentAmount(fee);
        // If mandatory payment is disabled or fee is 0, unlock immediately
        if (st.requirePaymentBeforeApply === false || fee <= 0) {
          setIsPaymentVerified(true);
        }
      }
    });

    // Check if customer already paid for this service in current browser session
    try {
      const stored = sessionStorage.getItem(sessionPaymentKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.txnId) {
          setIsPaymentVerified(true);
          setPaymentTxnId(parsed.txnId);
          if (parsed.amount) setPaymentAmount(parsed.amount);
          if (parsed.date) setPaymentVerifiedDate(parsed.date);
        }
      }
    } catch (e) {
      console.warn('Session payment check error', e);
    }

    return () => {
      isMounted = false;
    };
  }, [activeSlug, sessionPaymentKey]);

  // Initialize or re-initialize when slug or service data changes
  useEffect(() => {
    if (!service) return;

    // Default first sub-service option if available
    const firstOption = (service.subServices && service.subServices.length > 0)
      ? service.subServices[0].value
      : config.fields.find(f => f.options && f.options.length > 0)?.options?.[0]?.value || '';
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
      const isServiceSelect = f.name.toLowerCase().includes('service') || f.name === 'serviceType' || f.name === 'passportServiceType';
      if (isServiceSelect && service.subServices && service.subServices.length > 0) {
        initial[f.name] = service.subServices[0].value;
      } else {
        initial[f.name] = f.options ? f.options[0].value : '';
      }
    });
    setFormData(initial);

    // Initial documents dynamically loaded from Supabase service.documents or static config fallback
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

    setSubmittedApp(null);
    setErrorMsg('');
  }, [activeSlug, currentUser, service, config]);

  const activeService = service || getInitialServiceBySlug(activeSlug);
  const IconComponent = iconMap[activeService.iconName] || Fingerprint;

  const validateField = (fieldName: string, rawVal: any): string => {
    const val = rawVal ? String(rawVal).trim() : '';
    const lower = fieldName.toLowerCase();

    // 1. Aadhaar Number (strictly 12 digits, numbers only)
    if (lower.includes('aadhaar')) {
      if (!val) return '';
      const digits = val.replace(/\D/g, '');
      if (digits.length !== 12) {
        return 'Aadhaar number must be exactly 12 digits';
      }
    }

    // 2. PIN Code (strictly 6 digits, numbers only)
    if (lower.includes('pincode') || lower.includes('pin') || lower.includes('postal')) {
      if (!val) return '';
      const digits = val.replace(/\D/g, '');
      if (digits.length !== 6) {
        return 'PIN Code must be exactly 6 digits';
      }
    }

    // 3. Mobile Number (strictly 10 digits starting with 6, 7, 8, 9)
    if (lower.includes('mobile') || lower.includes('phone')) {
      if (!val) return '';
      const digits = val.replace(/\D/g, '');
      if (digits.length !== 10) {
        return 'Mobile number must be exactly 10 digits';
      }
      if (!/^[6-9]\d{9}$/.test(digits)) {
        return 'Mobile number must start with 6, 7, 8, or 9';
      }
    }

    // 4. Date of Birth (cannot be in the future)
    if (lower === 'dob' || lower.includes('birth')) {
      if (!val) return '';
      const selectedDate = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (isNaN(selectedDate.getTime())) {
        return 'Please select a valid date';
      }
      if (selectedDate > today) {
        return 'Date of birth cannot be in the future';
      }
    }

    // 5. PAN Number (10 alphanumeric characters)
    if (lower.includes('pan') && !lower.includes('company') && !lower.includes('expand')) {
      if (!val) return '';
      const panClean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (panClean.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panClean)) {
        return 'PAN must be 10 characters (e.g. ABCDE1234F)';
      }
    }

    // 6. Email validation
    if (lower.includes('email')) {
      if (!val) return '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return 'Please enter a valid email address';
      }
    }

    return '';
  };

  const handleInputChange = (field: string, rawValue: any) => {
    let value = rawValue;
    const lower = field.toLowerCase();

    // Prevent non-digits and extra characters from being entered
    if (lower.includes('aadhaar')) {
      value = String(rawValue).replace(/\D/g, '').slice(0, 12);
    } else if (lower.includes('pincode') || lower.includes('pin') || lower.includes('postal')) {
      value = String(rawValue).replace(/\D/g, '').slice(0, 6);
    } else if (lower.includes('mobile') || lower.includes('phone')) {
      value = String(rawValue).replace(/\D/g, '').slice(0, 10);
    } else if (lower.includes('pan') && !lower.includes('company') && !lower.includes('expand')) {
      value = String(rawValue).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');

    // Real-time error evaluation
    const fieldErr = validateField(field, value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: fieldErr,
    }));
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

  const handleInitiatePayment = async () => {
    setErrorMsg('');
    setIsProcessingPayment(true);

    try {
      const payerName = formData.fullName || currentUser?.name || 'Customer';
      const payerEmail = formData.email || currentUser?.email || 'applyallservices365@gmail.com';
      const payerPhone = formData.mobile || currentUser?.mobile || '9121992365';
      const customKeyId = websiteSettings?.paymentGateway?.keyId;

      const response = await openRazorpayCheckout({
        amount: paymentAmount,
        currency: 'INR',
        name: websiteSettings?.siteName || 'Apply365 — Services for People',
        description: `Application Fee: ${service.title}`,
        customerName: payerName,
        customerEmail: payerEmail,
        customerPhone: payerPhone,
        themeColor: websiteSettings?.paymentGateway?.themeColor || '#104A96',
        notes: {
          service_slug: activeSlug,
          service_title: service.title,
          customer_name: payerName,
          customer_phone: payerPhone,
          purpose: 'Mandatory Application Processing Fee'
        }
      }, customKeyId);

      if (response && response.razorpay_payment_id) {
        const txnId = response.razorpay_payment_id;
        const nowIso = new Date().toISOString();
        const payData = {
          txnId,
          amount: paymentAmount,
          date: nowIso
        };
        sessionStorage.setItem(sessionPaymentKey, JSON.stringify(payData));
        setIsPaymentVerified(true);
        setPaymentTxnId(txnId);
        setPaymentVerifiedDate(nowIso);

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.5 }
          });
        } catch {}

        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.warn('Payment failed or cancelled:', err);
      setErrorMsg(err?.message || 'Payment was not completed. Please complete payment to unlock the application form.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check mandatory payment gate
    const requiresPayment = websiteSettings?.requirePaymentBeforeApply !== false && paymentAmount > 0;
    if (requiresPayment && !isPaymentVerified) {
      setErrorMsg(`Payment of ₹${paymentAmount} is mandatory before submitting your application. Please complete payment above.`);
      window.scrollTo({ top: 280, behavior: 'smooth' });
      return;
    }

    // Comprehensive Field Validation
    const errors: Record<string, string> = {};
    for (const f of config.fields) {
      const val = formData[f.name];
      if (f.required && (!val || String(val).trim() === '')) {
        errors[f.name] = `${f.label} is required.`;
      } else if (val) {
        const customErr = validateField(f.name, val);
        if (customErr) {
          errors[f.name] = customErr;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstMsg = Object.values(errors)[0];
      setErrorMsg(firstMsg || 'Please correct the highlighted fields in red before submitting.');
      window.scrollTo({ top: 380, behavior: 'smooth' });
      return;
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
        customerEmail: formData.email || currentUser?.email || 'applyallservices365@gmail.com',
        customerMobile: formData.mobile || currentUser?.mobile || '9121992365',
        serviceId: config.id,
        serviceSlug: activeSlug,
        serviceTitle: config.title,
        serviceType: selectedSubService || 'Standard',
        status: 'Submitted',
        paymentStatus: isPaymentVerified ? 'payment_completed' : 'free_tier',
        paymentAmount: isPaymentVerified ? paymentAmount : 0,
        paymentTransactionId: paymentTxnId || `pay_verified_${Date.now()}`,
        paymentDate: isPaymentVerified ? (paymentVerifiedDate || now.toISOString()) : undefined,
        paymentMethod: 'Razorpay',
        submissionDate: now.toISOString(),
        createdAt: now.toISOString(),
        formData: formData as any,
        documents,
        updatedAt: now.toISOString(),
      };

      await saveApplication(appRecord);
      await saveNewApplication(appRecord);
      try {
        sessionStorage.removeItem(sessionPaymentKey);
      } catch {}
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

  const handleDownloadReceipt = () => {
    if (!submittedApp) return;
    try {
      const invPdf = generateInvoicePDF({
        id: `inv_${submittedApp.id}`,
        invoiceNumber: `INV-${submittedApp.id.replace('APP365-', '')}`,
        applicationId: submittedApp.id,
        customerId: submittedApp.customerId,
        customerName: submittedApp.customerName,
        customerEmail: submittedApp.customerEmail,
        customerMobile: submittedApp.customerMobile,
        serviceName: submittedApp.serviceTitle,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        items: [
          {
            id: 'item-1',
            description: `${submittedApp.serviceTitle} — Statutory Application Facilitation Fee`,
            quantity: 1,
            unitPrice: submittedApp.paymentAmount || paymentAmount || 50,
            total: submittedApp.paymentAmount || paymentAmount || 50
          }
        ],
        subtotal: submittedApp.paymentAmount || paymentAmount || 50,
        taxAmount: 0,
        discount: 0,
        taxRate: 0,
        totalAmount: submittedApp.paymentAmount || paymentAmount || 50,
        amountPaid: submittedApp.paymentAmount || paymentAmount || 50,
        balanceDue: 0,
        paymentStatus: 'paid',
        invoiceStatus: 'finalized',
        payments: [
          {
            id: `pay_${submittedApp.id}`,
            amount: submittedApp.paymentAmount || paymentAmount || 50,
            paymentDate: new Date().toISOString().slice(0, 10),
            paymentMethod: 'razorpay',
            referenceNumber: submittedApp.paymentTransactionId || paymentTxnId || 'Verified',
            recordedBy: 'Razorpay Payment Gateway',
            notes: 'Application fee paid online via Razorpay'
          }
        ],
        notes: `Official payment receipt for application ${submittedApp.id}. All fees inclusive.`
      });
      invPdf.save(`Apply365_${submittedApp.id}_Receipt.pdf`);
    } catch (err) {
      console.warn('PDF download error:', err);
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
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Application Status</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Application Received
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Status</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Fee Paid: ₹{submittedApp.paymentAmount || paymentAmount || 50}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Razorpay Txn ID</span>
                <span className="text-[11px] font-mono font-bold text-slate-700 truncate block">
                  {submittedApp.paymentTransactionId || paymentTxnId || 'Verified'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 max-w-md mx-auto space-y-3">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Payment Receipt (PDF)</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedApp(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  Apply for Another Service
                </button>

                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors text-center"
                >
                  Go to Customer Dashboard
                </Link>
              </div>
            </div>

          </div>
        ) : (websiteSettings?.requirePaymentBeforeApply !== false && paymentAmount > 0 && !isPaymentVerified) ? (
          /* ========================================================================= */
          /* MANDATORY PAYMENT GATEWAY SCREEN (Step 1 of Application)                  */
          /* ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Payment Gate Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold tracking-wide uppercase mb-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Step 1: Mandatory Application Fee</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Statutory Facilitation Fee for {service.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                    As per Apply365 regulatory facilitation policy, a mandatory fee of <strong>₹{paymentAmount}</strong> is required to unlock your official application form and document checklist.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 self-start sm:self-auto">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">Form Locked Until Payment</span>
                </div>
              </div>

              {/* Fee Breakdown & Razorpay Checkout Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Summary & Benefits */}
                <div className="lg:col-span-7 space-y-6">
                  
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payment Summary
                    </h3>

                    <div className="space-y-3 divide-y divide-slate-200/60 text-xs sm:text-sm">
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-semibold text-slate-700">Selected Service</span>
                        <span className="font-bold text-slate-900">{service.title}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-slate-600">Statutory Facilitation Fee</span>
                        <span className="font-bold text-slate-900">₹{paymentAmount}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-slate-600">Document Verification & KYC Check</span>
                        <span className="font-bold text-emerald-600">Included (₹0)</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-slate-600">SMS & WhatsApp Status Alerts</span>
                        <span className="font-bold text-emerald-600">Included (₹0)</span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-slate-600">Payment Gateway Platform Charges</span>
                        <span className="font-bold text-emerald-600">Waived (₹0)</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 text-sm sm:text-base">
                        <span className="font-extrabold text-slate-900">Total Amount Payable</span>
                        <span className="font-black text-2xl text-[#104A96]">₹{paymentAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust & Guarantee Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#104A96] shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 block">256-Bit SSL</span>
                        <span className="text-[10px] text-slate-500 block">Bank Grade Security</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2.5">
                      <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 block">Instant Unlock</span>
                        <span className="text-[10px] text-slate-500 block">Immediate Access</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                      <Receipt className="w-5 h-5 text-purple-600 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-800 block">Tax Receipt</span>
                        <span className="text-[10px] text-slate-500 block">Instant PDF Invoice</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Side: Payer Confirmation & Pay Button */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#104A96] block">
                      Applicant Contact Information
                    </span>
                    <p className="text-xs text-slate-500">
                      Payment receipt and application tracking details will be sent to:
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName || ''}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your official full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.mobile || ''}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Email Address <span className="text-slate-400 font-normal">(for receipt)</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white"
                      />
                    </div>
                  </div>

                  {/* Primary Pay Now Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleInitiatePayment}
                      disabled={isProcessingPayment}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#104A96] to-[#0A2F63] hover:from-[#0c3c7d] hover:to-[#07244c] text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Connecting to Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 text-amber-300" />
                          <span>Pay ₹{paymentAmount} & Unlock Application</span>
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-500 font-medium">
                      <span>Powered by</span>
                      <span className="font-bold text-slate-800">Razorpay</span>
                      <span>• UPI / Cards / NetBanking / QR</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* PRE-PAYMENT DOCUMENT CHECKLIST PREVIEW */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div 
                onClick={() => setShowPreDocPreview(!showPreDocPreview)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#104A96] flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Documents You Will Need to Upload After Payment ({service.documents.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Preview the document requirements before proceeding with your payment.
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                  {showPreDocPreview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {showPreDocPreview && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                  {service.documents.map((doc, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-[#104A96] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            doc.isMandatory !== false 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {doc.isMandatory !== false ? 'Mandatory' : 'Optional'}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-8">
            
            {/* ========================================================================= */}
            {/* VERIFIED PAYMENT REASSURANCE BANNER                                       */}
            {/* ========================================================================= */}
            {isPaymentVerified && (websiteSettings?.requirePaymentBeforeApply !== false) && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-950">
                        Payment Verified: ₹{paymentAmount}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900 uppercase tracking-wider">
                        Form Unlocked
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Razorpay Payment ID: <span className="font-mono font-bold">{paymentTxnId || 'Verified'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-emerald-700 bg-white/80 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-medium self-start sm:self-auto shrink-0 shadow-2xs">
                  ✓ Ready for Document Upload & Submission
                </div>
              </div>
            )}
            
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
                    const isServiceSelect = 
                      field.name.toLowerCase().includes('service') || 
                      field.name === 'serviceType' || 
                      field.name === 'passportServiceType';

                    const optionsToRender = (isServiceSelect && service.subServices && service.subServices.length > 0)
                      ? service.subServices.map(s => ({ value: s.value, label: s.label }))
                      : field.options;

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
                          {optionsToRender?.map((opt) => (
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

                  const lower = field.name.toLowerCase();
                  const err = fieldErrors[field.name];
                  const hasError = !!err;
                  const isAadhaar = lower.includes('aadhaar');
                  const isPincode = lower.includes('pincode') || lower.includes('pin') || lower.includes('postal');
                  const isMobile = lower.includes('mobile') || lower.includes('phone');
                  const isDate = field.type === 'date' || lower === 'dob' || lower.includes('birth');
                  const isPan = lower.includes('pan') && !lower.includes('company') && !lower.includes('expand');

                  const maxDate = isDate ? new Date().toISOString().split('T')[0] : undefined;
                  const maxLength = isAadhaar ? 12 : isPincode ? 6 : isMobile ? 10 : isPan ? 10 : undefined;
                  const inputMode = (isAadhaar || isPincode) ? 'numeric' : isMobile ? 'tel' : undefined;

                  return (
                    <div key={field.name} className={isSpan2 ? 'sm:col-span-2' : ''}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {isAadhaar && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            formData[field.name]?.length === 12 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : hasError 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {formData[field.name]?.length || 0} / 12 Digits
                          </span>
                        )}
                        {isPincode && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            formData[field.name]?.length === 6 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : hasError 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {formData[field.name]?.length || 0} / 6 Digits
                          </span>
                        )}
                        {isMobile && (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            formData[field.name]?.length === 10 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : hasError 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {formData[field.name]?.length || 0} / 10 Digits
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type={isDate ? 'date' : field.type}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                          max={maxDate}
                          maxLength={maxLength}
                          inputMode={inputMode}
                          placeholder={field.placeholder}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                            hasError
                              ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20 text-red-900 focus:ring-red-500'
                              : 'border-slate-200 focus:ring-[#104A96] text-slate-800 bg-white'
                          }`}
                        />
                      </div>

                      {hasError && (
                        <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                          <span>{err}</span>
                        </p>
                      )}
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
                  const isOptional = (doc as any).isOptional === true || 
                                     (doc as any).isMandatory === false || 
                                     (docCfg as any)?.isOptional === true || 
                                     doc.name.toLowerCase().includes('(optional)');
                  const isRequired = !isOptional;

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
                                isUploaded 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : isRequired 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {isUploaded ? 'Uploaded' : isRequired ? 'Required' : 'Optional'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-1">
                              {doc.fileName ? (
                                <strong className="text-slate-800">{doc.fileName} ({doc.fileSize})</strong>
                              ) : (
                                (doc as any).description || docCfg?.description || 'Accepted formats: JPG, JPEG, PNG, PDF (Max 10MB)'
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
