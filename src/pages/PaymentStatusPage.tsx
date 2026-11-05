import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getActiveCheckout, canAccessPaymentStatus } from '../services/checkoutService';
import { CheckoutOrder } from '../types/checkout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowRight, 
  FileText, 
  PhoneCall, 
  ExternalLink,
  Lock,
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<CheckoutOrder | null>(() => getActiveCheckout());
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(false);

  useEffect(() => {
    const current = getActiveCheckout();
    setOrder(current);

    // SECURITY ROUTE PROTECTION:
    // If order is missing or unpaid (in ORDER_CREATED or PAYMENT_REQUIRED), redirect to payment page
    if (!current) {
      navigate('/services', { replace: true });
      return;
    }

    if (!canAccessPaymentStatus(current)) {
      // Order is unpaid, navigate back to payment/checkout
      if (current.serviceSlug) {
        navigate(`/services/${current.serviceSlug}`, { replace: true });
      } else {
        navigate('/services', { replace: true });
      }
      return;
    }

    // Celebration burst
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    const handleSync = () => {
      setOrder(getActiveCheckout());
    };
    window.addEventListener('apply365_checkout_sync', handleSync);
    return () => window.removeEventListener('apply365_checkout_sync', handleSync);
  }, [navigate]);

  if (!order || !canAccessPaymentStatus(order)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFBFD] px-4">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-sm text-center">
          <RefreshCw className="w-8 h-8 text-[#104A96] animate-spin" />
          <p className="text-sm font-bold text-slate-700">Verifying payment authorization...</p>
        </div>
      </div>
    );
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyUtr = () => {
    if (order.paymentProof?.utrNumber) {
      navigator.clipboard.writeText(order.paymentProof.utrNumber);
      setCopiedUtr(true);
      setTimeout(() => setCopiedUtr(false), 2000);
    }
  };

  const formattedSubmissionDate = order.paymentProof?.submittedAt
    ? new Date(order.paymentProof.submittedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('en-IN');

  const isApproved = order.state === 'APPROVED';

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-20 pt-8 sm:pt-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <Breadcrumbs 
          items={[
            { label: 'Services', href: '/services' },
            { label: order.serviceTitle, href: `/services/${order.serviceSlug}` },
            { label: 'Payment Status' }
          ]} 
        />

        <div className="mt-6 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 space-y-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Status Card */}
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-inner ${
              isApproved 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-amber-100 text-amber-600'
            }`}>
              {isApproved ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <Clock className="w-10 h-10 animate-pulse" />
              )}
            </div>

            <div>
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isApproved 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isApproved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PAYMENT VERIFIED & APPROVED</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>PENDING VERIFICATION</span>
                  </>
                )}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
                {isApproved ? 'Service Activated' : 'Payment Proof Received'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                {isApproved
                  ? 'Your payment has been successfully confirmed by our accounts team. Your statutory application is now officially underway.'
                  : 'Your payment proof has been received. Our team will verify the payment and activate your service shortly.'}
              </p>
            </div>
          </div>

          {/* Reference Card with Copy Buttons */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-left space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Order & Application Reference ID
              </span>
              <span className="text-lg sm:text-xl font-mono font-black text-[#104A96] block">
                {order.orderId}
              </span>
            </div>

            <button
              type="button"
              onClick={copyOrderId}
              className="px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-[#104A96] text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Detailed Verification Summary Grid */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs sm:text-sm divide-y divide-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 sm:p-4 bg-slate-50 gap-1 sm:gap-4">
              <span className="text-slate-500 font-medium">Selected Service</span>
              <span className="font-bold text-slate-900 text-left sm:text-right">{order.serviceTitle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 sm:p-4 bg-white gap-1 sm:gap-4">
              <span className="text-slate-500 font-medium">Sub-Service / Option</span>
              <span className="font-bold text-[#104A96] text-left sm:text-right capitalize">
                {order.serviceType.replace('-', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 sm:p-4 bg-slate-50 gap-1 sm:gap-4">
              <span className="text-slate-500 font-medium">Payable / Paid Amount</span>
              <span className="font-black text-emerald-700 text-left sm:text-right text-base">
                ₹{order.paymentProof?.paidAmount || order.payableAmount}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 sm:p-4 bg-white gap-1 sm:gap-4 items-center">
              <span className="text-slate-500 font-medium">Submitted UPI UTR / Ref No</span>
              <div className="flex items-center sm:justify-end gap-2">
                <span className="font-mono font-bold text-[#5f259f] bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  {order.paymentProof?.utrNumber || 'Pending'}
                </span>
                <button
                  type="button"
                  onClick={copyUtr}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Copy UTR"
                >
                  {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 sm:p-4 bg-slate-50 gap-1 sm:gap-4">
              <span className="text-slate-500 font-medium">Submission Timestamp</span>
              <span className="font-medium text-slate-700 text-left sm:text-right font-mono text-xs">
                {formattedSubmissionDate}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 p-3.5 sm:p-4 bg-white gap-1 sm:gap-4 items-center">
              <span className="text-slate-500 font-medium">Service Access Status</span>
              <span className="text-left sm:text-right">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>UNLOCKED & ACTIVE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>LOCKED — Awaiting Bank Credit Verification</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 3-Step Verification Pipeline Indicator */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#104A96]" />
              <span>Verification Pipeline & Security Protocol</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Step 1: Payment screenshot & 12-digit UTR received.</span>
              </div>
              <div className="flex items-center gap-2.5 text-amber-800 font-medium">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                <span>Step 2: Accounts team cross-verifying settlement with bank. (In Progress)</span>
              </div>
              <div className={`flex items-center gap-2.5 ${isApproved ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {isApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 shrink-0" />
                )}
                <span>Step 3: Service unlocked and forwarded to documentation filing officer.</span>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to={`/track?id=${order.orderId}`}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors text-center"
            >
              Track Live Application Status
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Go to Customer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Need immediate assistance? Call Apply-365 support at{' '}
              <a href="tel:9121992365" className="font-bold text-[#104A96] hover:underline">
                +91 91219 92365
              </a>{' '}
              or email{' '}
              <a href="mailto:applyallservices365@gmail.com" className="font-bold text-[#104A96] hover:underline">
                applyallservices365@gmail.com
              </a>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
