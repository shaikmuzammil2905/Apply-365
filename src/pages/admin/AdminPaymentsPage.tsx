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
  X
} from 'lucide-react';
import { getAllPayments, getInvoices, recordInvoicePayment, PaymentRecordItem } from '../../services/dataSyncService';
import { CustomerInvoice } from '../../types/invoices';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecordItem[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Record Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cash' | 'Bank Transfer'>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordError, setRecordError] = useState('');
  const [recordSuccess, setRecordSuccess] = useState('');

  // Selected receipt modal
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecordItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allPay, allInv] = await Promise.all([
        getAllPayments(),
        getInvoices()
      ]);
      setPayments(allPay);
      setInvoices(allInv);
    } catch (e) {
      console.error('Failed to load payments:', e);
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

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalInvoicesAmount = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalBalanceDue = Math.max(0, totalInvoicesAmount - totalCollected);

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      p.customerName.toLowerCase().includes(q) ||
      p.customerMobile.includes(q) ||
      p.invoiceNumber.toLowerCase().includes(q) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(q)) ||
      (p.paymentMethod && p.paymentMethod.toLowerCase().includes(q));

    const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;

    let matchDate = true;
    if (dateFilter !== 'all') {
      const pDate = new Date(p.paymentDate);
      const now = new Date();
      if (dateFilter === 'today') {
        matchDate = pDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'this_week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchDate = pDate >= weekAgo;
      } else if (dateFilter === 'this_month') {
        matchDate = pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
      }
    }

    return matchSearch && matchMethod && matchDate;
  });

  const handleOpenRecord = () => {
    setSelectedInvoiceId(invoices.find(i => (i.balanceDue || 0) > 0)?.id || invoices[0]?.id || '');
    setPayAmount('');
    setPayMethod('UPI');
    setPayRef(`TXN-${Date.now().toString().slice(-6)}`);
    setPayNotes('');
    setRecordError('');
    setRecordSuccess('');
    setIsRecordModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#104A96]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Payment Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track incoming payments, UPI collections, net banking credits, and manual receipts across all customer applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh payments"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenRecord}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Collected</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Verified receipts across {payments.length} transactions
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Dues</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              ₹{totalBalanceDue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
              Unsettled invoices awaiting customer checkout
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billed Value</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#104A96] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              ₹{totalInvoicesAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Cumulative gross from {invoices.length} issued invoices
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clearance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {totalInvoicesAmount > 0 ? Math.round((totalCollected / totalInvoicesAmount) * 100) : 100}%
            </div>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
              Settlement completion ratio
            </p>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, invoice #, txn ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#104A96]"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI / QR Code</option>
              <option value="Credit/Debit Card">Debit / Credit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Bank Transfer">NEFT / RTGS</option>
              <option value="Cash">Cash at Center</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Period:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#104A96]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">Last 7 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Recorded By</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const pDate = new Date(p.paymentDate);
                  const formattedDate = pDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  const formattedTime = pDate.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{formattedDate}</div>
                        <div className="text-[10px] text-slate-400">{formattedTime}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.customerMobile}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#104A96] bg-blue-50 px-2 py-0.5 rounded-md">
                          {p.invoiceNumber}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                          {p.serviceTitle}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-700">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          <span>{p.paymentMethod}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {p.transactionReference || '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-sm text-emerald-700">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {p.recordedBy || 'System / Online'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#104A96] hover:text-[#104A96] text-slate-600 transition-colors font-bold text-[11px]"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#104A96] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Record Customer Payment</h3>
                  <p className="text-[11px] text-slate-500">Record an offline receipt, cash deposit, or bank transfer</p>
                </div>
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

            <form onSubmit={handleSavePayment} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Customer Invoice *
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv && (inv.balanceDue || 0) > 0) {
                      setPayAmount(inv.balanceDue.toString());
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#104A96]"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.customerName} (Total: ₹{inv.totalAmount} | Due: ₹{inv.balanceDue})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="e.g. 500"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#104A96]"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Credit/Debit Card">Debit / Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Bank Transfer">NEFT / RTGS</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction / UTR Reference ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/123456789 or BANK/REF/09"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Payment Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handed cash at Madhapur center, or customer confirmed via WhatsApp"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm & Save Payment'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Payment Receipt</h3>
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

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-[#104A96]">{selectedReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Customer Mobile:</span>
                <span className="font-medium text-slate-800">{selectedReceipt.customerMobile}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-800">{selectedReceipt.transactionReference || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-slate-800">{new Date(selectedReceipt.paymentDate).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Recorded By:</span>
                <span className="text-slate-800">{selectedReceipt.recordedBy}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
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
