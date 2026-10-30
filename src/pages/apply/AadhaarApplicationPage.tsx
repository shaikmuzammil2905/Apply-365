import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveApplication } from '../../services/dbService';
import { 
  CustomerApplication, 
  AadhaarFormData, 
  ApplicationDocument, 
  DocumentType,
  DocumentStatus 
} from '../../types/application';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { 
  Fingerprint, 
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
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const initialDocs: ApplicationDocument[] = [
  {
    id: 'doc-aadhaar-front',
    name: 'Aadhaar Card — Front Side',
    type: 'aadhaar-front',
    isReady: true,
    status: 'pending',
  },
  {
    id: 'doc-aadhaar-back',
    name: 'Aadhaar Card — Back Side',
    type: 'aadhaar-back',
    isReady: true,
    status: 'pending',
  },
  {
    id: 'doc-electricity-bill',
    name: 'Electricity Utility Bill (Address Proof)',
    type: 'electricity-bill',
    isReady: true,
    status: 'pending',
  },
  {
    id: 'doc-passport',
    name: 'Indian Passport (Identity & Address Proof)',
    type: 'passport',
    isReady: false,
    status: 'pending',
  },
];

export const AadhaarApplicationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Multi-step progress: 1 = Details, 2 = Document Upload, 3 = Specific Request, 4 = Status Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Data (pre-populated with customer info)
  const [formData, setFormData] = useState<AadhaarFormData>({
    fullName: currentUser?.name || '',
    aadhaarNumber: '',
    dob: '',
    gender: 'Male',
    guardianName: '',
    mobile: currentUser?.mobile || '',
    email: currentUser?.email || '',
    isMobileLinked: true,
    serviceType: 'address-update',
    doorNo: '',
    street: '',
    landmark: '',
    city: currentUser?.city || '',
    district: '',
    state: '',
    pincode: '',
    specificRequest: 'Please assist in updating my current residential address as per the attached electricity bill.',
    urgency: 'Standard (Within normal timeline)',
    customerRemarks: '',
  });

  // Documents
  const [documents, setDocuments] = useState<ApplicationDocument[]>(initialDocs);
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

  // Completed Application
  const [submittedApp, setSubmittedApp] = useState<CustomerApplication | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Handle Form Input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1 Validation -> proceed to Document Upload
  const handleProceedToDocs = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter applicant full name as per official records.');
      return;
    }
    if (!formData.mobile || formData.mobile.replace(/\D/g, '').length !== 10) {
      setErrorMsg('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (formData.aadhaarNumber && formData.aadhaarNumber.replace(/\D/g, '').length !== 12) {
      setErrorMsg('If provided, Aadhaar Number must be 12 digits.');
      return;
    }

    setStep(2);
  };

  // Toggle Document Ready / Not Ready
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
      const fileSizeKb = Math.round(file.size / 1024);
      const fileSizeStr = fileSizeKb > 1024 
        ? `${(fileSizeKb / 1024).toFixed(1)} MB` 
        : `${fileSizeKb} KB`;

      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === docId) {
            return {
              ...doc,
              status: 'uploaded',
              fileUrl,
              fileName: file.name,
              fileSize: fileSizeStr,
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

  // Proceed from Step 2 to Step 3 (Specific Request)
  const handleProceedToRequest = () => {
    // Check if at least one document is uploaded or marked ready
    const hasUploaded = documents.some((d) => d.status === 'uploaded');
    if (!hasUploaded) {
      const confirmContinue = window.confirm(
        'You have not uploaded any documents yet. Would you like to proceed anyway and upload them later or during verification?'
      );
      if (!confirmContinue) return;
    }
    setStep(3);
  };

  // Save Draft Application
  const handleSaveDraft = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const appId = submittedApp?.id || `APP365-AAD-${Math.floor(100000 + Math.random() * 900000)}`;
      const appRecord: CustomerApplication = {
        id: appId,
        customerId: currentUser.id,
        customerName: formData.fullName || currentUser.name,
        customerEmail: formData.email || currentUser.email,
        customerMobile: formData.mobile || currentUser.mobile,
        serviceId: 'aadhaar',
        serviceTitle: 'Aadhaar Card Service',
        status: 'Draft',
        submissionDate: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        formData,
        documents,
        updatedAt: new Date().toISOString(),
      };

      await saveApplication(appRecord);
      alert('Application draft saved successfully in your customer dashboard!');
      navigate('/dashboard');
    } catch (err) {
      alert('Error saving draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final Submit Application
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    try {
      const uniqueId = `APP365-AAD-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const appRecord: CustomerApplication = {
        id: uniqueId,
        customerId: currentUser.id,
        customerName: formData.fullName || currentUser.name,
        customerEmail: formData.email || currentUser.email,
        customerMobile: formData.mobile || currentUser.mobile,
        serviceId: 'aadhaar',
        serviceTitle: 'Aadhaar Card Service',
        status: 'Submitted',
        submissionDate: now.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formData,
        documents,
        updatedAt: now.toISOString(),
      };

      await saveApplication(appRecord);
      setSubmittedApp(appRecord);
      setStep(4); // Advance to Phase 6 Application Status
    } catch (err) {
      alert('Submission failed. Please try again.');
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
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#104A96] flex items-center justify-center shadow-xs shrink-0">
              <Fingerprint className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#104A96] text-[11px] font-bold uppercase tracking-wide">
                <span>Direct Application Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Aadhaar Card Service Application
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Customer: <strong className="text-slate-800">{currentUser?.name}</strong> • Mobile: {currentUser?.mobile}
              </p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#104A96] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 transition-colors"
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
        {/* STEP 1: AADHAAR CUSTOMER DETAILS (PHASE 3)                                */}
        {/* ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleProceedToDocs} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Applicant Information & Service Type</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your details accurately. Official UIDAI processing requires matching names and postal records.
              </p>
            </div>

            {/* Service Type Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Aadhaar Service Required *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'address-update', label: 'Address Update / Correction' },
                  { id: 'name-correction', label: 'Name Spelling Correction' },
                  { id: 'dob-update', label: 'Date of Birth (DOB) Update' },
                  { id: 'mobile-linking', label: 'Mobile Number Linking Support' },
                  { id: 'new-enrolment', label: 'New Aadhaar Enrolment Support' },
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.serviceType === s.id
                        ? 'bg-[#F1F7FF] border-[#104A96] text-[#104A96] font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      value={s.id}
                      checked={formData.serviceType === s.id}
                      onChange={handleInputChange}
                      className="text-[#104A96] focus:ring-[#104A96]"
                    />
                    <span className="text-xs sm:text-sm">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Personal Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name (as per records) *
                </label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  12-Digit Aadhaar Number (if existing)
                </label>
                <input
                  type="text"
                  maxLength={12}
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '') }))}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Father's / Spouse's Name
                </label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleInputChange}
                  placeholder="Enter parent or guardian name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Primary Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                />
              </div>

            </div>

            {/* Mobile OTP capability toggle */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#104A96]">Is this mobile number linked with Aadhaar for OTP?</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Online updates require receiving OTP on the registered mobile.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isMobileLinked: true }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    formData.isMobileLinked ? 'bg-[#104A96] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isMobileLinked: false }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !formData.isMobileLinked ? 'bg-[#FF8500] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Current / Target Address Section */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Residential Address (for Update / Dispatch)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">House / Flat / Door Number</label>
                  <input
                    type="text"
                    name="doorNo"
                    value={formData.doorNo}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 302, Sai Residency"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Street / Road / Lane</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="e.g. 5th Main, MG Road"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Landmark</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Near City Hospital"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">City / Town / Village</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">District & State</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="e.g. Hyderabad, Telangana"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    name="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                    placeholder="6-digit postal PIN"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                  />
                </div>
              </div>
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
                <span>Submit Details & Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: DOCUMENT UPLOAD (PHASE 4)                                         */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phase 4 — Document Upload & Verification</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Upload Required Documents
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Attach clear photographs or PDF copies of your proofs. You can preview, mark readiness, or replace files anytime.
              </p>
            </div>

            {/* Document Upload Cards Grid */}
            <div className="space-y-4">
              {documents.map((doc) => {
                const isUploaded = doc.status === 'uploaded';

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
                              isUploaded 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isUploaded ? 'Uploaded' : 'Pending Upload'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            {doc.fileName ? (
                              <span className="font-medium text-slate-700">{doc.fileName} ({doc.fileSize})</span>
                            ) : (
                              <span>Accepted: JPG, PNG, PDF (Max 10MB)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ready Toggle & Actions */}
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        
                        {/* Ready / Not Ready Button */}
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

            {/* Document Guidance Tip */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Tip:</strong> Ensure all 4 corners of the document are visible and text is sharp without flash glare. If an electricity bill is older than 3 months, an alternate water bill, gas bill, or bank passbook can also be attached.
              </span>
            </div>

            {/* Navigation Buttons */}
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
        {/* STEP 3: SPECIFIC REQUEST & SUBMISSION (PHASE 5)                           */}
        {/* ========================================================================= */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold tracking-wide uppercase mb-2">
                <span>Phase 5 — Specific Request & Submission</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Application Specifics & Remarks
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Provide any special instructions, timeline requirements, or specific remarks for our document verification team.
              </p>
            </div>

            {/* Specific Request Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Specific Request / Scope of Assistance *
              </label>
              <textarea
                rows={3}
                required
                name="specificRequest"
                value={formData.specificRequest}
                onChange={handleInputChange}
                placeholder="Describe your exact request (e.g. updating new residential address, correcting father's surname, scheduling Seva Kendra slot, etc.)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
              />
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Processing Priority / Additional Requirements
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
                      onChange={handleInputChange}
                      className="text-[#FF8500] focus:ring-[#FF8500]"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Message / Remarks */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Customer Message / Additional Remarks (Optional)
              </label>
              <textarea
                rows={3}
                name="customerRemarks"
                value={formData.customerRemarks}
                onChange={handleInputChange}
                placeholder="Any additional notes, convenient calling hours, or queries regarding appointment slots..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
              />
            </div>

            {/* Application Summary Box */}
            <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Application Summary</span>
                <span className="text-[#104A96]">Apply365 Facilitation</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                <div>Applicant: <strong className="text-slate-800">{formData.fullName}</strong></div>
                <div>Service: <strong className="text-slate-800 capitalize">{formData.serviceType.replace('-', ' ')}</strong></div>
                <div>Mobile: <strong className="text-slate-800">{formData.mobile}</strong></div>
                <div>Documents Uploaded: <strong className="text-emerald-700">{documents.filter(d => d.status === 'uploaded').length} files</strong></div>
                <div>Priority: <strong className="text-orange-700">{formData.urgency}</strong></div>
              </div>
            </div>

            {/* Action Buttons */}
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
                      <span>Submitting Application...</span>
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
        {/* STEP 4: CUSTOMER APPLICATION STATUS (PHASE 6)                             */}
        {/* ========================================================================= */}
        {step === 4 && submittedApp && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-8 animate-in fade-in duration-300">
            
            {/* Success Header */}
            <div className="text-center space-y-3 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Application Successfully Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Your Aadhaar card assistance request has been received and registered under your customer account.
              </p>
            </div>

            {/* Application ID Card */}
            <div className="bg-gradient-to-r from-[#104A96] to-[#07366F] rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-200 font-bold">Your Unique Application ID</span>
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

            {/* Application Details Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] border-b border-slate-200 pb-2">
                  Submitted Applicant Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Applicant Name:</span>
                    <span className="font-bold text-slate-900">{submittedApp.formData.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Service Type:</span>
                    <span className="font-bold text-slate-900 capitalize">{submittedApp.formData.serviceType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Mobile Number:</span>
                    <span className="font-bold text-slate-900">{submittedApp.formData.mobile}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Mobile OTP Ready:</span>
                    <span className="font-bold text-emerald-700">{submittedApp.formData.isMobileLinked ? 'Yes, Linked' : 'Not Linked'}</span>
                  </div>
                  {submittedApp.formData.city && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">City / District:</span>
                      <span className="font-bold text-slate-900">{submittedApp.formData.city}, {submittedApp.formData.district}</span>
                    </div>
                  )}
                  {submittedApp.formData.pincode && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">PIN Code:</span>
                      <span className="font-bold text-slate-900">{submittedApp.formData.pincode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] border-b border-slate-200 pb-2">
                  Uploaded Documents ({submittedApp.documents.filter(d => d.status === 'uploaded').length})
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

            {/* Specific Request Summary */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1 text-xs">
              <span className="font-bold text-[#104A96] uppercase tracking-wider text-[11px]">Specific Request Noted:</span>
              <p className="text-slate-700 italic font-medium">"{submittedApp.formData.specificRequest}"</p>
            </div>

            {/* Next Steps Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2 text-xs">
              <div className="font-bold text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>What Happens Next?</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Our dedicated documentation executive will review your uploaded proofs against UIDAI guidelines.</li>
                <li>You will receive real-time updates in your <strong>Customer Dashboard</strong> under "My Applications".</li>
                <li>If any document requires clarification or replacement, you can directly update it from your dashboard.</li>
              </ul>
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
                Start Another Aadhaar Request
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

    </div>
  );
};
