import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { servicesData, getServiceBySlug } from '../data/servicesData';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const ApplyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service') || 'aadhaar';

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  
  // Step 2 Contact Details
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [cityTown, setCityTown] = useState('');

  // Step 3 Document Checklist Confirmation
  const [confirmedDocs, setConfirmedDocs] = useState<Record<string, boolean>>({});

  // Step 4 Additional Message
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [urgency, setUrgency] = useState('Standard (Within normal timeline)');

  // Step 5 Privacy Consent & Submission
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedService = servicesData.find(s => s.id === selectedServiceId) || servicesData[0];

  useEffect(() => {
    const s = searchParams.get('service');
    if (s && servicesData.some(item => item.id === s)) {
      setSelectedServiceId(s);
    }
  }, [searchParams]);

  const toggleDocConfirmation = (docName: string) => {
    setConfirmedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  // Validation per step
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }
    // Indian 10-digit mobile number validation
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.mobileNumber = 'Mobile number is required.';
    } else if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    if (!cityTown.trim()) {
      errors.cityTown = 'Please provide your city or town.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!validateStep2()) return;
    }
    setFormErrors({});
    setCurrentStep(prev => Math.min(prev + 1, 5));
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePrivacy) {
      setFormErrors({ privacy: 'You must accept the privacy and transparency terms to proceed.' });
      return;
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Confetti fallback
    }

    const randomRef = 'AP365-' + Math.floor(100000 + Math.random() * 900000);
    setSubmissionId(randomRef);
    setIsSubmitted(true);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Generate WhatsApp message string for quick enquiry fallback
  const getWhatsAppEnquiryUrl = () => {
    const docsList = Object.keys(confirmedDocs).filter(k => confirmedDocs[k]).join(', ') || 'Under preparation';
    const message = `*Apply365 Application Enquiry*\n` +
      `--------------------------------\n` +
      `*Service:* ${selectedService.title}\n` +
      `*Name:* ${fullName || 'Not provided'}\n` +
      `*Mobile:* ${mobileNumber || 'Not provided'}\n` +
      `*City/Town:* ${cityTown || 'Not provided'}\n` +
      `*Preferred Language:* ${preferredLanguage}\n` +
      `*Ready Documents:* ${docsList}\n` +
      `*Additional Details:* ${additionalMessage || 'Standard assistance requested'}\n` +
      `--------------------------------\n` +
      `Please assist me with the next steps.`;

    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-20">
      
      {/* Banner */}
      <div className="bg-white border-b border-slate-100 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: 'Apply Now' }]} />

          <div className="mt-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF8500] text-xs font-bold uppercase tracking-wider mb-2 border border-orange-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Step Application Assistant</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Start Your Service Request
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Follow our guided 5-step checklist to prepare and submit your documentation assistance request securely.
            </p>
          </div>

          {/* Stepper Indicator */}
          {!isSubmitted && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between relative">
                {[
                  { step: 1, title: 'Select Service' },
                  { step: 2, title: 'Contact' },
                  { step: 3, title: 'Documents' },
                  { step: 4, title: 'Details' },
                  { step: 5, title: 'Review & Send' }
                ].map((s) => {
                  const isDone = currentStep > s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center relative z-10">
                      <div 
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${
                          isDone 
                            ? 'bg-[#35A936] text-white' 
                            : isCurrent 
                              ? 'bg-[#104A96] text-white ring-4 ring-blue-100' 
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                      </div>
                      <span className={`text-[11px] sm:text-xs mt-1.5 font-medium hidden sm:block ${
                        isCurrent ? 'text-[#104A96] font-bold' : 'text-slate-500'
                      }`}>
                        {s.title}
                      </span>
                    </div>
                  );
                })}
                {/* Connecting bar */}
                <div className="absolute left-4 right-4 top-4 sm:top-5 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Main Application Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8">
        
        {isSubmitted ? (
          /* Submission Success State with Honest Transparency */
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-[#35A936] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Application Initiated Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Thank You, {fullName}!
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
                Your request reference number is <strong className="text-[#104A96] font-mono text-base">{submissionId}</strong> for <strong className="text-slate-900">{selectedService.title}</strong>.
              </p>
            </div>

            {/* Honest Transparency Notice as required by prompt */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 text-left text-xs sm:text-sm text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#104A96]">
                <ShieldCheck className="w-4 h-4" />
                <span>Next Steps & Data Storage Notice:</span>
              </div>
              <p className="leading-relaxed">
                To protect your sensitive identity information, Apply365 does <strong>not</strong> retain personal identity documents on open cloud servers. To immediately connect with an executive and begin procedural review, click the WhatsApp button below with your pre-filled enquiry.
              </p>
            </div>

            {/* Direct WhatsApp Call to Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getWhatsAppEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Send via WhatsApp to Advisor Now</span>
              </a>

              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3.5 rounded-xl transition-colors"
              >
                <span>Return to Homepage</span>
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              Need immediate phone assistance? Call us at <a href="tel:+919876543210" className="text-[#104A96] font-bold underline">+91 98765 43210</a>.
            </p>
          </div>
        ) : (
          /* Multi-Step Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-slate-100">
            
            {/* STEP 1: SELECT SERVICE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Step 1: Select Your Service</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Choose one of the seven services you require assistance with.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {servicesData.map((s) => {
                    const isSelected = selectedServiceId === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#104A96] bg-[#F1F7FF] shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-slate-900">{s.title}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#104A96] bg-[#104A96] text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {s.shortDescription}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: CONTACT INFORMATION */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Step 2: Enter Contact Information</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Please provide accurate contact details so our documentation team can reach you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] ${
                          formErrors.fullName ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile Number * (10 Digits)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] ${
                            formErrors.mobileNumber ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {formErrors.mobileNumber && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.mobileNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        WhatsApp Number (Optional)
                      </label>
                      <div className="relative">
                        <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="If different from mobile"
                          maxLength={10}
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="e.g. name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] ${
                            formErrors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Preferred Language
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={preferredLanguage}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white"
                        >
                          <option value="English">English</option>
                          <option value="Telugu">Telugu (తెలుగు)</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="Urdu">Urdu (اردو)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City or Town *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad, Vijayawada, Visakhapatnam, Tirupati"
                        value={cityTown}
                        onChange={(e) => setCityTown(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] ${
                          formErrors.cityTown ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {formErrors.cityTown && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.cityTown}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SERVICE-SPECIFIC DOCUMENT CHECKLIST */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 text-[#104A96]">
                    {selectedService.title}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    Step 3: Document Readiness Confirmation
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Confirm which of the mandatory documents for <strong>{selectedService.title}</strong> you currently possess.
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedService.documents.map((doc, idx) => {
                    const isChecked = !!confirmedDocs[doc.name];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleDocConfirmation(doc.name)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-[#35A936] border-[#35A936] text-white' : 'bg-white border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-800">
                            {doc.name} {doc.isOptional && <span className="text-xs font-normal text-amber-700">(Optional / Correction only)</span>}
                          </div>
                          {doc.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Notice:</strong> {selectedService.officialDisclaimer}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#104A96] shrink-0" />
                  <span>You do <strong>not</strong> need to upload document files now. Our team will verify them over secure WhatsApp/Phone consultation.</span>
                </div>
              </div>
            )}

            {/* STEP 4: ADDITIONAL INFORMATION */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Step 4: Additional Information</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Tell us any specific requirements, existing errors, or timeline preferences.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Specific Request or Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. Need to update my residential address in Aadhaar as per recent electricity bill; or need assistance filing Form 49A for minor PAN card..."
                      value={additionalMessage}
                      onChange={(e) => setAdditionalMessage(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Urgency Preference
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white"
                    >
                      <option value="Standard (Within normal timeline)">Standard (Within normal official timeline)</option>
                      <option value="High Priority (Need urgent consultation today)">High Priority (Need urgent consultation today)</option>
                      <option value="General Query (Just seeking document guidance)">General Query (Just seeking document guidance)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW AND SUBMIT */}
            {currentStep === 5 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Step 5: Review & Submit</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Please review your application summary before confirming.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Service:</span>
                    <strong className="text-[#104A96] font-bold">{selectedService.title}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Applicant Name:</span>
                    <strong className="text-slate-800">{fullName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Mobile Number:</span>
                    <strong className="text-slate-800">+91 {mobileNumber}</strong>
                  </div>
                  {whatsappNumber && (
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">WhatsApp:</span>
                      <strong className="text-slate-800">+91 {whatsappNumber}</strong>
                    </div>
                  )}
                  {email && (
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Email:</span>
                      <strong className="text-slate-800">{email}</strong>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Language:</span>
                    <strong className="text-slate-800">{preferredLanguage}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">City / Town:</span>
                    <strong className="text-slate-800">{cityTown}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Timeline:</span>
                    <strong className="text-slate-800">{urgency}</strong>
                  </div>
                  {additionalMessage && (
                    <div className="pt-1">
                      <span className="text-slate-500 block mb-1">Notes:</span>
                      <p className="text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 italic">
                        "{additionalMessage}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Privacy Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#104A96] rounded border-slate-300 focus:ring-[#104A96]"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      I agree that Apply365 is a private document consultancy and not a government portal. I consent to Apply365 contacting me regarding this documentation request. Apply365 will never ask for my banking PINs, OTPs, or passwords.
                    </span>
                  </label>
                  {formErrors.privacy && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.privacy}</p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Service Request</span>
                  </button>

                  <a
                    href={getWhatsAppEnquiryUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-5 rounded-xl shadow-sm transition-colors text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Submit via WhatsApp</span>
                  </a>
                </div>
              </form>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>
              ) : <div />}

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
