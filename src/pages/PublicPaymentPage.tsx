import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getInvoices, recordInvoicePayment } from '../services/dataSyncService';
import { CustomerInvoice } from '../types/invoices';
import { PhonePeQrPaymentCard } from '../components/PhonePeQrPaymentCard';
import { generateInvoicePDF, formatINR } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ShieldCheck, 
  Receipt, 
  Clock, 
  HelpCircle,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Lock,
  QrCode
} from 'lucide-react';

export const PublicPaymentPage: React.FC = () => {
  const { invoiceId: routeId } = useParams<{ invoiceId?: string }>();
  const [searchParams] = useSearchParams();
  const queryInv = searchParams.get('inv') || searchParams.get('id') || '';

  const [searchQuery, setSearchQuery] = useState(routeId || queryInv || '');
  const [invoice, setInvoice] = useState<CustomerInvoice | null>(null);
  const [allInvoices, setAllInvoices] = useState<CustomerInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const [payError, setPayError] = useState('');
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Load invoices cache
  useEffect(() => {
    getInvoices().then((list) => {
      setAllInvoices(list);
      const target = (routeId || queryInv || '').trim().toLowerCase();
      if (target) {
        const found = list.find((i) => 
          i.id.toLowerCase() === target || 
          i.invoiceNumber.toLowerCase() === target ||
          (i.applicationId && i.applicationId.toLowerCase() === target)
        );
        if (found) {
          setInvoice(found);
        } else {
          setSearchError(`No invoice found matching "${routeId || queryInv}". Please verify the invoice number.`);
        }
      }
    });
  }, [routeId, queryInv]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setPayError('');
    setPaySuccessMsg('');
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      setSearchError('Please enter an Invoice Number or Application ID.');
      return;
    }

    setIsLoading(true);
    getInvoices().then((list) => {
      setAllInvoices(list);
      const found = list.find((i) => 
        i.id.toLowerCase() === q || 
        i.invoiceNumber.toLowerCase() === q ||
        (i.applicationId && i.applicationId.toLowerCase() === q) ||
        (i.customerMobile && i.customerMobile.includes(q))
      );

      if (found) {
        setInvoice(found);
      } else {
        setInvoice(null);
        setSearchError(`No invoice record found for "${searchQuery}". Please check the ID or contact support.`);
      }
      setIsLoading(false);
    });
  };

  const handlePaymentSubmitted = async (submission: any) => {
    if (!invoice) return;
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch {}

    setPaySuccessMsg(
      `Payment proof submitted successfully! UTR: ${submission.utrNumber}. Your payment is queued for admin verification.`
    );

    // Refresh invoice list
    const updatedList = await getInvoices();
    const updatedInv = updatedList.find(i => i.id === invoice.id);
    if (updatedInv) {
      setInvoice(updatedInv);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;
    const doc = generateInvoicePDF(invoice);
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen pb-20">
      
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <Breadcrumbs 
            items={[
              { label: 'Services', path: '/services' },
              { label: 'Pay Online' }
            ]} 
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#5f259f] text-xs font-bold uppercase tracking-wider mb-2">
                <QrCode className="w-3.5 h-3.5 text-[#5f259f]" />
                <span>Instant PhonePe & UPI QR Payment</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Quick Online Invoice Payment
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Pay your statutory documentation and facilitation fees securely using PhonePe, Google Pay, Paytm, or any UPI app.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-purple-50 text-[#5f259f] px-2.5 py-1 rounded-lg border border-purple-200 font-bold">
                Direct UPI Settlement
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* Invoice Lookup Form */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Invoice Number (e.g., INV-365-...) or Application ID"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#104A96] text-slate-800 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isLoading ? 'Searching...' : 'Find Invoice'}
            </button>
          </form>

          {searchError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Invoice Found Card */}
        {invoice && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in duration-300">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Official Apply365 Tax Invoice
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {invoice.invoiceNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Service: <strong className="text-slate-800">{invoice.serviceName}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoice.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : invoice.paymentStatus === 'partially_paid'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {invoice.paymentStatus.replace('_', ' ')}
                </span>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Bill Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                <strong className="text-slate-800 font-sans block truncate">{invoice.customerName}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Bill</span>
                <strong className="text-slate-900 block">{formatINR(invoice.totalAmount)}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Paid</span>
                <strong className="text-emerald-700 block">{formatINR(invoice.amountPaid)}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance Due</span>
                <strong className={`block text-sm ${invoice.balanceDue > 0 ? 'text-amber-600 font-black' : 'text-slate-400'}`}>
                  {formatINR(invoice.balanceDue)}
                </strong>
              </div>
            </div>

            {payError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{payError}</span>
              </div>
            )}

            {paySuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{paySuccessMsg}</span>
              </div>
            )}

            {/* Pay or Paid Action Banner */}
            {invoice.balanceDue > 0 ? (
              <div className="pt-2">
                <PhonePeQrPaymentCard
                  amount={invoice.balanceDue}
                  orderId={invoice.invoiceNumber}
                  applicationId={invoice.applicationId}
                  serviceName={invoice.serviceName}
                  customerName={invoice.customerName}
                  customerMobile={invoice.customerMobile}
                  customerEmail={invoice.customerEmail}
                  onPaymentSuccess={handlePaymentSubmitted}
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-emerald-900">This Invoice is Fully Paid</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    No outstanding balance due. You can download the official stamped invoice receipt anytime.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Stamped Receipt PDF</span>
                </button>
              </div>
            )}

            {/* Payment History if exists */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#104A96]" />
                  <span>Confirmed Payments on this Invoice</span>
                </h4>
                <div className="space-y-2">
                  {invoice.payments.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                      <div>
                        <strong className="text-slate-800">{formatINR(p.amount)}</strong>
                        <span className="text-slate-500 font-sans ml-2 text-[11px]">via {p.paymentMethod}</span>
                        {p.transactionReference && (
                          <span className="text-slate-400 block text-[10px] mt-0.5">Ref: {p.transactionReference}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
