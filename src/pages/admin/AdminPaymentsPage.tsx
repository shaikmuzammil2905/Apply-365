import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Receipt, 
  Eye, 
  Calendar, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  FileText,
  User,
  Phone,
  X,
  QrCode,
  Check,
  Copy,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ShieldCheck,
  Upload,
  Settings,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { getAllPayments, getInvoices, recordInvoicePayment, PaymentRecordItem } from '../../services/dataSyncService';
import { CustomerInvoice } from '../../types/invoices';
import { 
  getPaymentSubmissions, 
  verifyPaymentSubmission, 
  getPaymentSettings, 
  savePaymentSettings, 
  DEFAULT_PAYMENT_SETTINGS,
  PaymentSubmission, 
  PaymentSettings as UPIPaymentSettings,
  PaymentVerificationStatus
} from '../../services/paymentService';
import { generateInvoicePDF, formatINR } from '../../utils/pdfGenerator';
import confetti from 'canvas-confetti';

export const AdminPaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'verification' | 'upi_settings' | 'invoices'>('verification');
  
  // Data State
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [payments, setPayments] = useState<PaymentRecordItem[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [upiSettings, setUpiSettings] = useState<UPIPaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentVerificationStatus>('ALL');

  // Verification Action Dialogs
  const [actionTarget, setActionTarget] = useState<PaymentSubmission | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'RESUBMIT' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  // Screenshot Viewer Modal
  const [viewScreenshotSub, setViewScreenshotSub] = useState<PaymentSubmission | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Settings Save State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Manual Offline Payment Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cash' | 'Bank Transfer'>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [recordError, setRecordError] = useState('');
  const [recordSuccess, setRecordSuccess] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecordItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subs, allPay, allInv, upiCfg] = await Promise.all([
        getPaymentSubmissions(),
        getAllPayments(),
        getInvoices(),
        getPaymentSettings()
      ]);
      setSubmissions(subs);
      setPayments(allPay);
      setInvoices(allInv);
      setUpiSettings(upiCfg);
    } catch (e) {
      console.error('Failed to load payments data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('apply365_data_sync', handleSync);
    return () => window.removeEventListener('apply365_data_sync', handleSync);
  }, []);

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const service = (sub.serviceName || sub.serviceTitle || '').toLowerCase();
    const matchSearch =
      sub.customerName.toLowerCase().includes(q) ||
      sub.customerMobile.includes(q) ||
      sub.orderId.toLowerCase().includes(q) ||
      (sub.applicationId && sub.applicationId.toLowerCase().includes(q)) ||
      sub.utrNumber.toLowerCase().includes(q) ||
      service.includes(q);

    const matchStatus = statusFilter === 'ALL' || 
      sub.verificationStatus === statusFilter || 
      sub.status === statusFilter ||
      (statusFilter === 'RESUBMISSION_REQUESTED' && (sub.verificationStatus === 'RESUBMISSION_REQUIRED' || sub.status === 'RESUBMISSION_REQUIRED'));
    return matchSearch && matchStatus;
  });

  // KPI Calculations
  const pendingCount = submissions.filter((s) => s.verificationStatus === 'PENDING_VERIFICATION' || s.status === 'PENDING_VERIFICATION').length;
  const approvedCount = submissions.filter((s) => s.verificationStatus === 'APPROVED' || s.status === 'APPROVED').length;
  const rejectedCount = submissions.filter((s) => s.verificationStatus === 'REJECTED' || s.status === 'REJECTED').length;
  const resubmitCount = submissions.filter((s) => s.verificationStatus === 'RESUBMISSION_REQUESTED' || s.verificationStatus === 'RESUBMISSION_REQUIRED' || s.status === 'RESUBMISSION_REQUESTED' || s.status === 'RESUBMISSION_REQUIRED').length;
  const totalVerifiedRevenue = submissions
    .filter((s) => s.verificationStatus === 'APPROVED' || s.status === 'APPROVED')
    .reduce((sum, s) => sum + s.amount, 0);

  // Action Handlers
  const handleOpenAction = (sub: PaymentSubmission, type: 'APPROVE' | 'REJECT' | 'RESUBMIT') => {
    setActionTarget(sub);
    setActionType(type);
    setActionReason(
      type === 'REJECT'
        ? 'Amount not credited to bank account or invalid transaction receipt.'
        : type === 'RESUBMIT'
        ? 'Screenshot proof is blurry or 12-digit UTR is cut off. Please re-upload clear transaction receipt.'
        : ''
    );
    setActionError('');
  };

  const handleConfirmAction = async () => {
    if (!actionTarget || !actionType) return;
    setIsProcessingAction(true);
    setActionError('');

    try {
      if (actionType === 'APPROVE') {
        await verifyPaymentSubmission(actionTarget.id, 'APPROVE', 'Super Administrator');
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else if (actionType === 'REJECT') {
        if (!actionReason.trim()) {
          setActionError('Please provide a reason for rejecting this payment.');
          setIsProcessingAction(false);
          return;
        }
        await verifyPaymentSubmission(actionTarget.id, 'REJECT', 'Super Administrator', actionReason.trim());
      } else if (actionType === 'RESUBMIT') {
        if (!actionReason.trim()) {
          setActionError('Please provide notes explaining what the customer should re-upload.');
          setIsProcessingAction(false);
          return;
        }
        await verifyPaymentSubmission(actionTarget.id, 'RESUBMIT', 'Super Administrator', actionReason.trim());
      }

      setActionTarget(null);
      setActionType(null);
      setViewScreenshotSub(null);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Action failed. Please try again.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // UPI Settings Handlers
  const handleSaveUpiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaveMsg('');
    try {
      await savePaymentSettings(upiSettings);
      setSettingsSaveMsg('Payment & UPI settings saved successfully!');
      setTimeout(() => setSettingsSaveMsg(''), 3000);
    } catch (err: any) {
      setSettingsSaveMsg('Failed to save settings: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUpiSettings((prev: UPIPaymentSettings) => ({
        ...prev,
        qrCodeImageUrl: dataUrl,
        qrImageUrl: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  // Manual Payment Handler
  const handleSaveManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      setRecordError('Please select a valid customer invoice.');
      return;
    }
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      setRecordError('Please enter a valid payment amount greater than zero.');
      return;
    }

    setIsSubmittingManual(true);
    setRecordError('');
    try {
      await recordInvoicePayment(selectedInvoiceId, {
        invoiceId: selectedInvoiceId,
        amount: amt,
        paymentMethod: payMethod,
        transactionReference: payRef.trim(),
        paymentDate: new Date().toISOString(),
        paymentNotes: payNotes.trim(),
        recordedBy: 'Super Administrator'
      });
      setRecordSuccess('Payment recorded and customer ledger updated successfully!');
      await loadData();
      setTimeout(() => {
        setIsRecordModalOpen(false);
      }, 900);
    } catch (err: any) {
      setRecordError(err.message || 'Payment recording failed.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Manual PhonePe & UPI Payment Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Payment Verification & Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verify customer 12-digit UTR credits, inspect screenshot proofs, unlock applications, and manage PhonePe QR assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upi_settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upi_settings'
                ? 'bg-[#5f259f] text-white shadow-sm'
                : 'bg-purple-50 text-[#5f259f] hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>PhonePe QR Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedInvoiceId(invoices.find((i) => (i.balanceDue || 0) > 0)?.id || invoices[0]?.id || '');
              setPayAmount('');
              setPayMethod('UPI');
              setPayRef(`TXN-${Date.now().toString().slice(-6)}`);
              setPayNotes('');
              setRecordError('');
              setRecordSuccess('');
              setIsRecordModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#0c3c7d] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Manual Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Submissions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Submissions
          </span>
          <span className="text-2xl font-black text-slate-900">{submissions.length}</span>
          <p className="text-[10px] text-slate-500 font-medium">Customer UPI attempts</p>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs space-y-1 bg-amber-50/20">
          <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>Pending Verification</span>
          </span>
          <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
          <p className="text-[10px] text-amber-700/80 font-medium">Requires admin bank check</p>
        </div>

        {/* Approved Payments */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/20">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Approved Payments</span>
          </span>
          <span className="text-2xl font-black text-emerald-700">{approvedCount}</span>
          <p className="text-[10px] text-emerald-700/80 font-medium">Credited & service unlocked</p>
        </div>

        {/* Action Required / Rejected */}
        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs space-y-1 bg-rose-50/20">
          <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">
            Resubmit / Rejected
          </span>
          <span className="text-2xl font-black text-rose-600">{resubmitCount + rejectedCount}</span>
          <p className="text-[10px] text-rose-600/80 font-medium">{resubmitCount} need new proof</p>
        </div>

        {/* Verified Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs space-y-1 col-span-2 sm:col-span-1 bg-blue-50/20">
          <span className="text-[10px] uppercase font-bold text-[#104A96] block tracking-wider">
            Verified UPI Revenue
          </span>
          <span className="text-2xl font-black text-[#104A96]">₹{totalVerifiedRevenue.toLocaleString('en-IN')}</span>
          <p className="text-[10px] text-blue-700/80 font-medium">From approved UPI receipts</p>
        </div>

      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'verification'
              ? 'bg-[#104A96] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Payment Proof Verification Queue</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upi_settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'upi_settings'
              ? 'bg-[#104A96] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>PhonePe & UPI Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-[#104A96] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Confirmed Invoices & Ledger</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VERIFICATION QUEUE                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Customer, Mobile, UTR or Order ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#104A96] bg-white text-slate-900 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'All Submissions' },
                { id: 'PENDING_VERIFICATION', label: `Pending (${pendingCount})` },
                { id: 'APPROVED', label: `Approved (${approvedCount})` },
                { id: 'RESUBMISSION_REQUESTED', label: `Resubmit (${resubmitCount})` },
                { id: 'REJECTED', label: `Rejected (${rejectedCount})` }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setStatusFilter(btn.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === btn.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No Payment Submissions Match Current Filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Customer payment proofs uploaded via the PhonePe QR card will appear here for admin bank reconciliation.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Service & Order</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">12-Digit UTR</th>
                      <th className="py-3.5 px-4 text-center">Screenshot Proof</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredSubmissions.map((sub) => {
                      const isPending = sub.verificationStatus === 'PENDING_VERIFICATION';
                      const isApproved = sub.verificationStatus === 'APPROVED';
                      const isRejected = sub.verificationStatus === 'REJECTED';
                      const isResubmit = sub.verificationStatus === 'RESUBMISSION_REQUESTED';

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {new Date(sub.submittedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                            <span className="block text-[10px] text-slate-400">
                              {new Date(sub.submittedAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <strong className="text-slate-900 block font-semibold">{sub.customerName}</strong>
                            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{sub.customerMobile}</span>
                            </span>
                          </td>

                          {/* Service & Order */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 block truncate max-w-[180px]">
                              {sub.serviceName}
                            </span>
                            <span className="font-mono text-[10px] text-[#104A96] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                              {sub.orderId}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                            {formatINR(sub.amount)}
                          </td>

                          {/* 12-Digit UTR */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200">
                                {sub.utrNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(sub.utrNumber, `utr_${sub.id}`)}
                                title="Copy UTR to check in banking app"
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                {copySuccess === `utr_${sub.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Proof Screenshot */}
                          <td className="py-3.5 px-4 text-center">
                            {sub.screenshotUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setViewScreenshotSub(sub);
                                  setZoomLevel(1);
                                  setRotation(0);
                                }}
                                className="relative group inline-block cursor-pointer"
                              >
                                <img
                                  src={sub.screenshotUrl}
                                  alt="Proof thumbnail"
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-300 shadow-2xs group-hover:ring-2 group-hover:ring-[#104A96]"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No Screenshot</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                                <span>Pending Check</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Approved</span>
                              </span>
                            )}
                            {isResubmit && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                <span>Resubmission</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                                <X className="w-3 h-3 text-red-600" />
                                <span>Rejected</span>
                              </span>
                            )}
                          </td>

                          {/* Verification Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAction(sub, 'APPROVE')}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                    title="Credit verified in bank account"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenAction(sub, 'RESUBMIT')}
                                    className="px-2 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-all cursor-pointer"
                                    title="Request clear screenshot or correct UTR"
                                  >
                                    <span>Resubmit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenAction(sub, 'REJECT')}
                                    className="px-2 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-bold text-[11px] transition-all cursor-pointer"
                                    title="Reject payment"
                                  >
                                    <span>Reject</span>
                                  </button>
                                </>
                              ) : isApproved ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const invPdf = generateInvoicePDF({
                                      id: `inv_${sub.id}`,
                                      invoiceNumber: `INV-${sub.orderId.replace('APP365-', '')}`,
                                      applicationId: sub.applicationId,
                                      customerId: sub.customerId,
                                      customerName: sub.customerName,
                                      customerEmail: sub.customerEmail,
                                      customerMobile: sub.customerMobile,
                                      serviceName: sub.serviceName || sub.serviceTitle || 'Statutory Service',
                                      invoiceDate: sub.submittedAt.slice(0, 10),
                                      dueDate: sub.submittedAt.slice(0, 10),
                                      items: [
                                        {
                                          id: 'item-1',
                                          description: `${sub.serviceName} — Facilitation Fee`,
                                          quantity: 1,
                                          unitPrice: sub.amount,
                                          total: sub.amount
                                        }
                                      ],
                                      subtotal: sub.amount,
                                      taxAmount: 0,
                                      discount: 0,
                                      taxRate: 0,
                                      totalAmount: sub.amount,
                                      amountPaid: sub.amount,
                                      balanceDue: 0,
                                      paymentStatus: 'paid',
                                      invoiceStatus: 'finalized',
                                      payments: [
                                        {
                                          id: `pay_${sub.id}`,
                                          amount: sub.amount,
                                          paymentDate: sub.submittedAt.slice(0, 10),
                                          paymentMethod: 'PhonePe / UPI QR',
                                          transactionReference: sub.utrNumber,
                                          recordedBy: 'Admin Verified',
                                          notes: 'Payment verified and confirmed'
                                        }
                                      ],
                                      notes: `Official payment receipt for ${sub.orderId}.`
                                    });
                                    invPdf.save(`Receipt_${sub.orderId}.pdf`);
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3 h-3 text-slate-500" />
                                  <span>Receipt</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAction(sub, 'APPROVE')}
                                  className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold text-[11px] cursor-pointer"
                                >
                                  Re-evaluate
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PHONEPE & UPI CONFIGURATION                                        */}
      {/* ========================================================================= */}
      {activeTab === 'upi_settings' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveUpiSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left 2 Cols: Form Config */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#5f259f]" />
                    <h3 className="text-base font-extrabold text-slate-900">PhonePe & UPI QR Master Settings</h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#5f259f] text-[10px] font-bold uppercase tracking-wider">
                      Live Gateway
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure official PhonePe QR image, beneficiary name, UPI ID, and payment policies.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 rounded-xl bg-[#5f259f] hover:bg-[#4c1d80] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving...' : 'Save UPI Settings'}</span>
                </button>
              </div>

              {settingsSaveMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{settingsSaveMsg}</span>
                </div>
              )}

              {/* UPI Enable / Disable Switch */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Accept PhonePe & Manual UPI Payments</span>
                  <span className="text-[11px] text-slate-500 block">
                    Allow customers to scan PhonePe QR and submit 12-digit UTR proofs for statutory services.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={upiSettings.isUpiEnabled}
                    onChange={(e) => setUpiSettings({ ...upiSettings, isUpiEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5f259f]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* UPI ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    UPI ID (VPA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={upiSettings.upiId}
                    onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value.trim() })}
                    placeholder="9346801736@ybl"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#5f259f] text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Active PhonePe VPA shown to customers to copy and pay directly.
                  </p>
                </div>

                {/* Account / Beneficiary Holder Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Beneficiary Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={upiSettings.accountHolderName}
                    onChange={(e) => setUpiSettings({ ...upiSettings, accountHolderName: e.target.value })}
                    placeholder="KATIKAM JAYANTH"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5f259f] text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Bank account holder name verified on PhonePe settlement terminal.
                  </p>
                </div>

              </div>

              {/* QR Image Upload & Replacement */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Custom PhonePe QR Code Image <span className="text-red-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                  <img
                    src={upiSettings.qrCodeImageUrl}
                    alt="Active PhonePe QR"
                    className="w-24 h-24 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-2xs"
                  />
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Replace Active QR Code</span>
                      <p className="text-[11px] text-slate-500">
                        Upload your high-res PhonePe business QR image from your device. Supported: PNG, JPG, WEBP.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Choose New QR Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customer Payment Instructions
                </label>
                <textarea
                  rows={3}
                  value={upiSettings.paymentInstructions || ''}
                  onChange={(e) => setUpiSettings({ ...upiSettings, paymentInstructions: e.target.value })}
                  placeholder="Scan the PhonePe QR using PhonePe, Google Pay, Paytm, or any UPI app. Enter the 12-digit UTR and upload screenshot."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#5f259f] text-slate-800 bg-white"
                />
              </div>

            </div>

            {/* Right 1 Col: Live Preview Card */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
                Customer Live Preview
              </span>

              <div className="bg-white rounded-3xl p-5 border border-purple-200 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-black text-xs">
                      पे
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-tight">PhonePe Accepted Here</h4>
                      <span className="text-[10px] text-slate-500">Scan & Pay using any UPI App</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#5f259f] font-bold bg-purple-50 px-2 py-0.5 rounded">
                    ₹50.00
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-200/80">
                  <img
                    src={upiSettings.qrCodeImageUrl}
                    alt="Customer QR Preview"
                    className="w-48 h-48 object-contain rounded-xl bg-white p-2 border border-slate-200 shadow-inner"
                  />
                  <strong className="text-xs font-black text-slate-900 mt-2 font-mono">
                    {upiSettings.accountHolderName}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Configured UPI ID:</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-[#5f259f]">{upiSettings.upiId}</span>
                    <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-purple-200 font-bold">
                      Verified
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  This is the exact verified card customers see on checkout.
                </p>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONFIRMED INVOICES & LEDGER                                        */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Recorded Customer Payments & Invoices</h3>
                <p className="text-xs text-slate-500">Complete transaction ledger recorded across all services.</p>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No offline or manual payments recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Mobile</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#104A96]">
                          {p.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {p.customerName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {p.customerMobile}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {p.paymentMethod}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {p.transactionReference || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                          {formatINR(p.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[10px] cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HIGH-RESOLUTION SCREENSHOT PROOF VIEWER                           */}
      {/* ========================================================================= */}
      {viewScreenshotSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Payment Screenshot Proof — {viewScreenshotSub.orderId}
                  </h3>
                  <span className="font-mono text-xs bg-purple-100 text-[#5f259f] px-2 py-0.5 rounded font-bold">
                    UTR: {viewScreenshotSub.utrNumber}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Applicant: <strong>{viewScreenshotSub.customerName}</strong> ({viewScreenshotSub.customerMobile}) — Amount: <strong>{formatINR(viewScreenshotSub.amount)}</strong>
                </p>
              </div>

              {/* Zoom & Action Controls */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer text-xs font-bold shadow-2xs"
                  title="Reset Zoom & Rotation"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                {viewScreenshotSub.screenshotUrl && (
                  <>
                    <a
                      href={viewScreenshotSub.screenshotUrl}
                      download={`Apply365-PaymentProof-${viewScreenshotSub.orderId}.jpg`}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                      title="Download Original Screenshot"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <a
                      href={viewScreenshotSub.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                      title="Open Full Size in New Tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setViewScreenshotSub(null);
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer ml-1.5 shadow-2xs"
                  title="Close Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Canvas */}
            <div className="flex-1 overflow-auto bg-slate-900 p-6 flex items-center justify-center min-h-[400px]">
              {viewScreenshotSub.screenshotUrl ? (
                <img
                  src={viewScreenshotSub.screenshotUrl}
                  alt="Customer Payment Proof"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-out'
                  }}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="text-white text-xs">No screenshot available.</div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-bold">Verification Actions:</span>
                <span>Review UTR against bank credit statement before approving.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAction(viewScreenshotSub, 'APPROVE')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAction(viewScreenshotSub, 'RESUBMIT')}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Request Resubmission</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAction(viewScreenshotSub, 'REJECT')}
                  className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Reject Payment</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VERIFICATION ACTION (APPROVE / REJECT / RESUBMIT)                  */}
      {/* ========================================================================= */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {actionType === 'APPROVE' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {actionType === 'RESUBMIT' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {actionType === 'REJECT' && <X className="w-5 h-5 text-red-600" />}
                <h3 className="text-base font-extrabold text-slate-900">
                  {actionType === 'APPROVE' && 'Confirm Payment Credit'}
                  {actionType === 'RESUBMIT' && 'Request Payment Proof Resubmission'}
                  {actionType === 'REJECT' && 'Reject Payment Proof'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionTarget(null);
                  setActionType(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Order ID:</span>
                <strong className="text-slate-900">{actionTarget.orderId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Customer:</span>
                <strong className="text-slate-900 font-sans">{actionTarget.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Amount:</span>
                <strong className="text-emerald-700 text-sm">{formatINR(actionTarget.amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">UTR / Ref:</span>
                <strong className="text-[#104A96]">{actionTarget.utrNumber}</strong>
              </div>
            </div>

            {actionType === 'APPROVE' && (
              <p className="text-xs text-slate-600">
                Approving this payment will mark the application as <strong>Paid</strong>, unlock full processing, and automatically issue an official stamped PDF invoice receipt for the customer.
              </p>
            )}

            {(actionType === 'REJECT' || actionType === 'RESUBMIT') && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {actionType === 'REJECT' ? 'Rejection Reason' : 'Resubmission Instructions for Customer'}
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#104A96] text-slate-800"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActionTarget(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isProcessingAction}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'RESUBMIT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isProcessingAction ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANUAL RECORD OFFLINE PAYMENT                                      */}
      {/* ========================================================================= */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#104A96]" />
                <h3 className="text-base font-extrabold text-slate-900">Record Customer Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recordError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{recordError}</span>
              </div>
            )}

            {recordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{recordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveManualPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Target Customer Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#104A96]"
                >
                  {invoices.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNumber} — {i.customerName} ({formatINR(i.balanceDue)} due)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="UPI">UPI / PhonePe</option>
                    <option value="Cash">Cash at Kendra</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Credit/Debit Card">Card POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Transaction Ref / UTR</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. TXN-123456"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid in cash at office"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-5 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingManual ? 'Saving...' : 'Save & Update Ledger'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW RECEIPT                                                       */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Official Payment Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Amount Paid</span>
              <div className="text-3xl font-black text-emerald-700">₹{selectedReceipt.amount.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Payment Status: Verified & Settled</div>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Invoice #:</span>
                <span className="font-bold text-[#104A96]">{selectedReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Customer:</span>
                <span className="font-bold text-slate-900 font-sans">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Mobile:</span>
                <span className="text-slate-800">{selectedReceipt.customerMobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Method:</span>
                <span className="font-bold text-slate-900 font-sans">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Transaction Ref:</span>
                <span className="text-slate-800">{selectedReceipt.transactionReference || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-sans">Date:</span>
                <span className="text-slate-800">{new Date(selectedReceipt.paymentDate).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
