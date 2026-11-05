import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  UploadCloud, 
  FileCheck2, 
  AlertCircle, 
  ShieldCheck, 
  Maximize2, 
  X, 
  Clock, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { getPaymentSettings, submitPaymentProof, DEFAULT_PAYMENT_SETTINGS } from '../services/paymentService';
import { PaymentSettings } from '../types/payment';
import { getActiveCheckout, updateCheckoutState } from '../services/checkoutService';

export interface PhonePeQrPaymentCardProps {
  orderId: string;
  applicationId?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerMobile?: string;
  serviceId?: string;
  serviceTitle?: string;
  serviceName?: string;
  serviceType?: string;
  payableAmount?: number;
  amount?: number;
  onPaymentSubmitted?: (submission: any) => void;
  onPaymentSuccess?: (submission: any) => void;
}

export const PhonePeQrPaymentCard: React.FC<PhonePeQrPaymentCardProps> = ({
  orderId,
  applicationId,
  customerId,
  customerName,
  customerEmail,
  customerMobile,
  serviceId,
  serviceTitle,
  serviceName,
  serviceType,
  payableAmount,
  amount,
  onPaymentSubmitted,
  onPaymentSuccess
}) => {
  const actualAmount = payableAmount ?? amount ?? 50;
  const actualTitle = serviceTitle || serviceName || 'Statutory Application';
  const actualEmail = customerEmail || 'applyallservices365@gmail.com';
  const actualMobile = customerMobile || '9121992365';
  const actualCustomerId = customerId || '';
  const handleSuccess = onPaymentSubmitted || onPaymentSuccess || (() => {});
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Form states
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState('');
  const [screenshotFileSize, setScreenshotFileSize] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  useEffect(() => {
    getPaymentSettings().then(st => {
      if (st) setSettings(st);
    });

    const handleSync = () => {
      getPaymentSettings().then(st => {
        if (st) setSettings(st);
      });
    };
    window.addEventListener('apply365_payment_sync', handleSync);
    return () => window.removeEventListener('apply365_payment_sync', handleSync);
  }, []);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setFormError('Please upload an image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Screenshot file size exceeds 10MB limit.');
      return;
    }

    setScreenshotFileName(file.name);
    setScreenshotFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFormError('');
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setFormError('Please upload an image file (JPG, PNG, or WEBP).');
      return;
    }

    setScreenshotFileName(file.name);
    setScreenshotFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setFormError('Please enter your 12-digit UPI Transaction ID / UTR Number.');
      return;
    }

    if (cleanUtr.length < 8) {
      setFormError('Invalid UTR / Transaction ID. Most UPI UTR numbers are 12 digits.');
      return;
    }

    if (!screenshotDataUrl) {
      setFormError('Please upload your payment confirmation screenshot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submission = await submitPaymentProof({
        orderId,
        applicationId: applicationId || orderId,
        customerId: actualCustomerId,
        customerName,
        customerEmail: actualEmail,
        customerMobile: actualMobile,
        serviceId: serviceId || 'srv_gen',
        serviceTitle: actualTitle,
        serviceType,
        expectedAmount: actualAmount,
        paidAmount: actualAmount,
        utrNumber: cleanUtr,
        screenshotUrl: screenshotDataUrl,
        screenshotFileName,
        screenshotFileSize,
        paymentDate
      });

      // 2. Synchronize checkout state machine to PENDING_VERIFICATION with payment proof
      try {
        const active = getActiveCheckout();
        if (active && (active.orderId === orderId || active.applicationId === orderId || !active.orderId)) {
          updateCheckoutState('PENDING_VERIFICATION', {
            paymentProof: {
              utrNumber: cleanUtr,
              screenshotUrl: screenshotDataUrl,
              screenshotFileName: screenshotFileName || 'payment_proof.jpg',
              screenshotFileSize: screenshotFileSize || '',
              paymentDate,
              paidAmount: actualAmount,
              submittedAt: new Date().toISOString()
            }
          });
        }
      } catch (syncErr) {
        console.warn('Checkout sync warning:', syncErr);
      }

      setIsSubmittedSuccess(true);
      handleSuccess(submission);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit payment proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-md text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
            Verification Pending
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Payment Proof Submitted Successfully!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Our documentation team is manually verifying your payment against our bank account.
            Once confirmed, your statutory application will be formally unlocked and queued for filing.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs grid grid-cols-2 gap-3 text-left">
          <div>
            <span className="text-slate-400 font-medium block">Order Reference:</span>
            <strong className="text-slate-900 font-mono block">{orderId}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">UTR / Ref No:</span>
            <strong className="text-[#5f259f] font-mono block">{utrNumber}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Submitted Amount:</span>
            <strong className="text-emerald-700 block">₹{actualAmount}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Status:</span>
            <span className="text-amber-700 font-bold block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Admin Approval</span>
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          You can track this application in your Customer Dashboard anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden space-y-0">
      
      {/* PhonePe Inspired Header */}
      <div className="bg-gradient-to-r from-[#5f259f] to-[#471777] p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              UPI Direct Settlement
            </span>
            <span className="text-white/80 text-xs">PhonePe • GPay • Paytm • BHIM</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Scan & Pay via PhonePe / UPI QR Code
          </h3>
          <p className="text-xs text-purple-100">
            Pay exact fee of <strong className="text-amber-300 font-black text-sm">₹{actualAmount}</strong> for {actualTitle}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 text-left shrink-0">
          <span className="text-[10px] uppercase font-bold text-purple-200 block">Amount Payable</span>
          <span className="text-2xl font-black text-white block">₹{actualAmount}</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Two Column Layout: Left QR & UPI Details, Right Proof Upload Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: QR Code Card & Payment Instructions */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-4 shadow-2xs">
              
              <div className="relative inline-block mx-auto group">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                  <img
                    src={settings.qrImageUrl || '/payment/phonepe_qr.jpg'}
                    alt="PhonePe Payment QR"
                    className="w-56 h-auto sm:w-64 max-w-full rounded-xl mx-auto object-contain cursor-zoom-in transition-transform duration-200 group-hover:scale-102"
                    onClick={() => setIsQrZoomed(true)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsQrZoomed(true)}
                  className="absolute bottom-5 right-5 p-2 bg-[#5f259f] hover:bg-[#471777] text-white rounded-xl shadow-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Click to Zoom QR"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Enlarge</span>
                </button>
              </div>

              {/* Beneficiary Name Badge */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Verified Beneficiary Name
                </span>
                <span className="text-sm font-black text-slate-900 block tracking-tight">
                  {settings.beneficiaryName || 'KATIKAM JAYANTH'}
                </span>
              </div>

              {/* UPI ID with Copy Button */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2 shadow-2xs">
                <div className="text-left min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">UPI ID:</span>
                  <span className="font-mono font-black text-xs text-[#5f259f] truncate block">
                    {settings.upiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    copiedUpi 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-purple-50 hover:bg-purple-100 text-[#5f259f]'
                  }`}
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Step-by-Step Payment Instructions */}
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-[#5f259f] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>How to Pay:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed text-[11px]">
                <li>Open <strong>PhonePe, Google Pay, Paytm</strong> or any UPI app.</li>
                <li>Scan the QR above or enter UPI ID <strong className="font-mono text-[#5f259f]">{settings.upiId}</strong>.</li>
                <li>Verify recipient name: <strong>{settings.beneficiaryName}</strong>.</li>
                <li>Enter exact amount: <strong>₹{actualAmount}</strong> and complete payment.</li>
                <li>Copy the <strong>12-digit UTR / UPI Ref ID</strong> from your transaction screen.</li>
                <li>Upload the payment screenshot on the right to complete verification.</li>
              </ol>
            </div>

          </div>

          {/* RIGHT: Payment Screenshot Upload & UTR Form */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#5f259f]" />
                <span>Submit Payment Confirmation</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide your UPI transaction reference and payment screenshot for instant officer verification.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-4">
              
              {/* Order Reference (Prepopulated & Read-only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Order Reference ID</label>
                  <input
                    type="text"
                    disabled
                    value={orderId}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Payable Amount (₹)</label>
                  <input
                    type="text"
                    disabled
                    value={`₹${actualAmount}`}
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-emerald-800"
                  />
                </div>
              </div>

              {/* UPI UTR / Transaction ID (Mandatory) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  12-Digit UPI UTR / Transaction Reference ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder="e.g. 430589123456 (Found in PhonePe / GPay receipt)"
                  maxLength={22}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#5f259f] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  Open your UPI app payment receipt and copy the 12-digit number labeled "UTR", "UPI Ref No" or "Transaction ID".
                </p>
              </div>

              {/* Payment Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-[#5f259f] focus:outline-none"
                />
              </div>

              {/* Payment Screenshot Upload Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Payment Confirmation Screenshot <span className="text-red-500">*</span>
                </label>

                {screenshotDataUrl ? (
                  <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={screenshotDataUrl}
                        alt="Uploaded proof"
                        className="w-14 h-14 rounded-xl object-cover border border-purple-200 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {screenshotFileName || 'Payment_Proof.jpg'}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium block">
                          ✓ Ready for verification ({screenshotFileSize})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotDataUrl(null);
                        setScreenshotFileName('');
                        setScreenshotFileSize('');
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove & Replace Screenshot"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-300 hover:border-[#5f259f] bg-slate-50/50 hover:bg-purple-50/20 rounded-2xl p-6 text-center transition-all cursor-pointer"
                  >
                    <input
                      type="file"
                      id="payment-screenshot-file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="payment-screenshot-file" className="cursor-pointer block space-y-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-[#5f259f] flex items-center justify-center mx-auto shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#5f259f] hover:underline block">
                          Click to upload payment screenshot
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          or drag and drop here (JPG, PNG, WEBP up to 10MB)
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Proof Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#5f259f] to-[#471777] hover:from-[#521e8c] hover:to-[#3b1263] text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading & Submitting Payment Proof...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    <span>Submit Payment Proof for Verification</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400">
                🔒 Bank-grade verified settlement • Payment approval automatically unlocks your application dossier.
              </p>

            </form>

          </div>

        </div>

      </div>

      {/* QR ZOOM MODAL */}
      {isQrZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsQrZoomed(false)}
        >
          <div 
            className="bg-white p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">PhonePe QR Code</span>
              <button 
                type="button" 
                onClick={() => setIsQrZoomed(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <img
              src={settings.qrImageUrl || '/payment/phonepe_qr.jpg'}
              alt="Enlarged QR"
              className="w-full h-auto rounded-2xl object-contain mx-auto"
            />

            <div className="space-y-0.5">
              <span className="text-xs font-black text-slate-900 block">{settings.beneficiaryName}</span>
              <span className="text-xs font-mono font-bold text-[#5f259f] block">{settings.upiId}</span>
              <span className="text-[11px] font-bold text-emerald-700 block">Pay Amount: ₹{actualAmount}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
