import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getActiveCheckout, 
  setActiveCheckout, 
  createCheckoutOrder, 
  updateCheckoutState,
  submitCheckoutPaymentProof,
  canAccessPaymentStatus 
} from '../services/checkoutService';
import { CheckoutOrder, CheckoutState } from '../types/checkout';
import { getServiceBySlug, getInitialServiceBySlug } from '../services/dataSyncService';
import { calculateServicePrice } from '../utils/pricingHelper';
import { PhonePeQrPaymentCard } from '../components/PhonePeQrPaymentCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  User, 
  Phone, 
  Mail, 
  FileText,
  Lock,
  Sparkles,
  RefreshCw,
  QrCode
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const serviceSlugParam = searchParams.get('service') || searchParams.get('slug') || '';
  const subServiceParam = searchParams.get('subService') || searchParams.get('option') || '';

  const [order, setOrder] = useState<CheckoutOrder | null>(() => getActiveCheckout());
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [formError, setFormError] = useState('');

  // Initialize or synchronize order
  useEffect(() => {
    const existing = getActiveCheckout();

    // If order is already in PENDING_VERIFICATION, redirect straight to /payment-status
    if (existing && canAccessPaymentStatus(existing)) {
      navigate('/payment-status', { replace: true });
      return;
    }

    if (existing) {
      setOrder(existing);
      setCustomerName(existing.customerName);
      setCustomerMobile(existing.customerMobile);
      setCustomerEmail(existing.customerEmail);
      return;
    }

    // No existing checkout, but service specified in URL
    const slugToUse = (serviceSlugParam || 'aadhaar-card').toLowerCase();
    setLoading(true);
    getServiceBySlug(slugToUse).then((srv) => {
      const activeSrv = srv || getInitialServiceBySlug(slugToUse);
      const chosenSub = subServiceParam || (activeSrv.subServices?.[0]?.value || 'Standard');
      const pricing = calculateServicePrice(activeSrv, chosenSub);

      const name = currentUser?.name || 'Customer';
      const mobile = currentUser?.mobile || '9121992365';
      const email = currentUser?.email || 'applyallservices365@gmail.com';

      const originalPrice = pricing.originalPrice || pricing.total || 50;
      const discount = originalPrice > pricing.total ? originalPrice - pricing.total : 0;

      const created = createCheckoutOrder({
        serviceId: activeSrv.id,
        serviceSlug: activeSrv.slug,
        serviceTitle: activeSrv.title,
        serviceDescription: activeSrv.shortDescription,
        serviceType: chosenSub,
        originalPrice,
        discount,
        payableAmount: pricing.total || 50,
        customerId: currentUser?.id,
        customerName: name,
        customerEmail: email,
        customerMobile: mobile
      });

      setOrder(created);
      setCustomerName(name);
      setCustomerMobile(mobile);
      setCustomerEmail(email);
      setLoading(false);
    });
  }, [serviceSlugParam, subServiceParam, currentUser, navigate]);

  // Listener for checkout updates
  useEffect(() => {
    const handleSync = () => {
      const updated = getActiveCheckout();
      setOrder(updated);
    };
    window.addEventListener('apply365_checkout_sync', handleSync);
    return () => window.removeEventListener('apply365_checkout_sync', handleSync);
  }, []);

  if (loading || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAFBFD] px-4">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-sm text-center">
          <RefreshCw className="w-8 h-8 text-[#104A96] animate-spin" />
          <h3 className="text-base font-bold text-slate-800">Preparing Secure Checkout</h3>
          <p className="text-xs text-slate-500">Creating unique order reference and loading payment details...</p>
        </div>
      </div>
    );
  }

  // STEP 2: Proceed from Order Summary to Mandatory Payment Page
  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter the applicant full name.');
      return;
    }
    const cleanMobile = customerMobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const updated = updateCheckoutState('PAYMENT_REQUIRED', {
      customerName: customerName.trim(),
      customerMobile: cleanMobile,
      customerEmail: customerEmail.trim() || order.customerEmail
    });

    if (updated) {
      setOrder(updated);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  // STEP 5: Payment Proof Submitted Callback
  const handlePaymentProofSubmitted = () => {
    navigate('/payment-status');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-20 pt-8 sm:pt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Services', href: '/services' },
            { label: order.serviceTitle, href: `/services/${order.serviceSlug}` },
            { label: 'Checkout & Payment' }
          ]}
        />

        {/* Checkout Steps Indicator */}
        <div className="my-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className={`p-2.5 rounded-xl flex items-center justify-center gap-2 ${
              order.state === 'ORDER_CREATED' 
                ? 'bg-[#104A96] text-white shadow-xs' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>1. Order Summary</span>
            </div>

            <div className={`p-2.5 rounded-xl flex items-center justify-center gap-2 ${
              order.state === 'PAYMENT_REQUIRED' 
                ? 'bg-[#104A96] text-white shadow-xs' 
                : order.state === 'ORDER_CREATED' 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span>2. UPI / QR Payment</span>
            </div>

            <div className={`p-2.5 rounded-xl flex items-center justify-center gap-2 ${
              canAccessPaymentStatus(order) 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>3. Verification Status</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2 – ORDER SUMMARY (When state === 'ORDER_CREATED')                     */}
        {/* ========================================================================= */}
        {order.state === 'ORDER_CREATED' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
            
            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF8500]" />
                <span>STEP 2: REVIEW ORDER DETAILS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Order Summary & Applicant Verification
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Please verify your service details and applicant contact information before advancing to the secure payment screen.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Generated Order ID
                </span>
                <span className="text-base sm:text-lg font-mono font-black text-[#104A96]">
                  {order.orderId}
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-[#104A96]">
                Service: {order.serviceTitle}
              </span>
            </div>

            {/* Service & Price Breakdown Card */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{order.serviceTitle}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{order.serviceDescription}</p>
                  <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#104A96] border border-blue-200 capitalize">
                    Option: {order.serviceType.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 line-through text-xs block">₹{order.originalPrice}</span>
                  <span className="text-lg font-black text-slate-900 block">₹{order.payableAmount}</span>
                </div>
              </div>

              {order.discount > 0 && (
                <div className="p-3.5 bg-white flex items-center justify-between text-emerald-700 font-semibold text-xs">
                  <span>Special Facilitation Discount</span>
                  <span>- ₹{order.discount}</span>
                </div>
              )}

              <div className="p-4 bg-slate-50/80 flex items-center justify-between font-black text-sm sm:text-base">
                <span className="text-slate-900">Total Final Payable Amount</span>
                <span className="text-xl sm:text-2xl text-emerald-700 font-black">₹{order.payableAmount}</span>
              </div>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleContinueToPayment} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#104A96]" />
                <span>Customer / Applicant Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Fee Notice */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-[#104A96] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900 block">
                    Transparent ₹{order.payableAmount} Application Facilitation
                  </span>
                  <p className="text-slate-600">
                    Your payment directly covers official file preparation, document review, and administrative portal filing.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  to={`/services/${order.serviceSlug}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Service Page</span>
                </Link>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#104A96] to-[#0A2F63] hover:from-[#0c3c7d] hover:to-[#07244c] text-white font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Continue to Payment (₹{order.payableAmount})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3 & 4 & 5 – MANDATORY PAYMENT PAGE (When state === 'PAYMENT_REQUIRED') */}
        {/* ========================================================================= */}
        {order.state === 'PAYMENT_REQUIRED' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Back to Order Summary Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => updateCheckoutState('ORDER_CREATED')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#104A96] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Order Summary</span>
              </button>

              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                Order: {order.orderId}
              </span>
            </div>

            {/* Mandatory PhonePe QR Card */}
            <PhonePeQrPaymentCard
              orderId={order.orderId}
              applicationId={order.applicationId}
              customerId={order.customerId}
              customerName={order.customerName}
              customerEmail={order.customerEmail}
              customerMobile={order.customerMobile}
              serviceId={order.serviceId}
              serviceTitle={order.serviceTitle}
              serviceType={order.serviceType}
              payableAmount={order.payableAmount}
              onPaymentSubmitted={handlePaymentProofSubmitted}
            />

          </div>
        )}

      </div>
    </div>
  );
};
