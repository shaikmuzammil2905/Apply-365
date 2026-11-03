import React, { useState, useEffect } from 'react';
import { 
  getInvoices, 
  createInvoice, 
  recordInvoicePayment, 
  cancelInvoice, 
  getAllApplications, 
  generateInvoiceNumber,
  getServices,
  getDefaultSubServices
} from '../../services/dataSyncService';
import { CustomerInvoice, InvoiceItem, InvoicePayment } from '../../types/invoices';
import { CustomerApplication } from '../../types/application';
import { ServiceDetail } from '../../types/services';
import { generateInvoicePDF, formatINR } from '../../utils/pdfGenerator';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Calendar, 
  Phone, 
  Mail, 
  Send, 
  Trash2, 
  Printer, 
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  Share2,
  Briefcase
} from 'lucide-react';

export const AdminInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState('');
  const [selectedSubServiceValue, setSelectedSubServiceValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);

  // New Invoice Form State
  const [selectedAppId, setSelectedAppId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [initialPaid, setInitialPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Statutory Application Processing & Portal Filing Assistance', quantity: 1, unitPrice: 499, total: 499 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Record Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<InvoicePayment['paymentMethod']>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invList, appList, svcList] = await Promise.all([
        getInvoices(),
        getAllApplications(),
        getServices()
      ]);
      setInvoices(invList);
      setApplications(appList);
      setServices(svcList);
    } catch (err) {
      console.error('Failed to load invoices:', err);
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

  // When service is selected directly (e.g. Aadhaar, PAN, Voter ID), auto-fill service name & items
  const handleServiceSelect = (slug: string) => {
    setSelectedServiceSlug(slug);
    setSelectedSubServiceValue('');
    if (!slug) return;
    const svc = services.find(s => s.slug === slug || s.id === slug);
    if (svc) {
      const subList = (svc.subServices && svc.subServices.length > 0)
        ? svc.subServices
        : getDefaultSubServices(svc.slug);
      const firstSub = subList[0];
      if (firstSub) {
        setSelectedSubServiceValue(firstSub.value);
        setServiceName(`${svc.title} (${firstSub.label})`);
        setItems([
          {
            id: '1',
            description: `${svc.title} - ${firstSub.label} Application Processing & Verification Assistance`,
            quantity: 1,
            unitPrice: 499,
            total: 499
          }
        ]);
      } else {
        setServiceName(svc.title);
        setItems([
          {
            id: '1',
            description: `${svc.title} Application Processing Assistance`,
            quantity: 1,
            unitPrice: 499,
            total: 499
          }
        ]);
      }
    }
  };

  const handleSubServiceSelect = (subVal: string) => {
    setSelectedSubServiceValue(subVal);
    const svc = services.find(s => s.slug === selectedServiceSlug || s.id === selectedServiceSlug);
    if (!svc) return;
    const subList = (svc.subServices && svc.subServices.length > 0)
      ? svc.subServices
      : getDefaultSubServices(svc.slug);
    const sub = subList.find(s => s.value === subVal);
    const subLabel = sub ? sub.label : subVal;
    setServiceName(`${svc.title} (${subLabel})`);
    setItems([
      {
        id: '1',
        description: `${svc.title} - ${subLabel} Application Processing & Verification Assistance`,
        quantity: 1,
        unitPrice: 499,
        total: 499
      }
    ]);
  };

  // When application is selected in create modal, auto-fill customer info
  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId);
    if (!appId) return;
    const app = applications.find(a => a.id === appId);
    if (app) {
      setCustomerName(app.customerName);
      setCustomerMobile(app.customerMobile);
      setCustomerEmail(app.customerEmail || '');
      setServiceName(app.serviceTitle);
      setCustomerAddress(app.formData?.city ? `${app.formData.city}, India` : '');
      setItems([
        {
          id: '1',
          description: `${app.serviceTitle} (${app.serviceType || 'Standard'}) Processing Assistance`,
          quantity: 1,
          unitPrice: 499,
          total: 499
        }
      ]);
    }
  };

  // Line item manipulation
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity || 0);
      const p = Number(updated[index].unitPrice || 0);
      updated[index].total = Number((q * p).toFixed(2));
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        description: 'Additional Regulatory Consultation',
        quantity: 1,
        unitPrice: 200,
        total: 200
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculation helpers
  const subtotal = items.reduce((acc, it) => acc + (Number(it.total) || 0), 0);
  const taxAmount = Number(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const totalAmount = Math.max(0, Number((subtotal - discount + taxAmount).toFixed(2)));

  const handleOpenCreateModal = () => {
    setSelectedAppId('');
    setCustomerName('');
    setCustomerMobile('');
    setCustomerEmail('');
    setCustomerAddress('');
    setServiceName('');
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDueDate('');
    setTaxRate(0);
    setDiscount(0);
    setInitialPaid(0);
    setNotes('');
    setItems([
      { id: '1', description: 'Statutory Application Processing & Portal Filing Assistance', quantity: 1, unitPrice: 499, total: 499 }
    ]);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim()) {
      setFormError('Please enter applicant name and phone number.');
      return;
    }
    if (items.length === 0 || totalAmount <= 0) {
      setFormError('Please add at least one line item with a valid rate.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      const selectedApp = applications.find(a => a.id === selectedAppId);
      await createInvoice({
        applicationId: selectedAppId || undefined,
        customerId: selectedApp?.customerId || `cust_${Date.now()}`,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        customerEmail: customerEmail.trim(),
        customerAddress: customerAddress.trim(),
        serviceName: serviceName.trim() || 'Government & Business Service',
        invoiceDate,
        dueDate: dueDate || undefined,
        items,
        subtotal,
        discount,
        taxRate,
        taxAmount,
        totalAmount,
        amountPaid: initialPaid,
        notes
      });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to generate invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPaymentModal = (invoice: CustomerInvoice) => {
    setSelectedInvoice(invoice);
    setPayAmount(invoice.balanceDue > 0 ? invoice.balanceDue : 0);
    setPayMethod('UPI');
    setPayRef('');
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayNotes('');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (payAmount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    setIsPaying(true);
    try {
      await recordInvoicePayment(selectedInvoice.id, {
        invoiceId: selectedInvoice.id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        transactionReference: payRef,
        paymentDate: payDate,
        paymentNotes: payNotes,
        recordedBy: 'Super Administrator'
      });
      setIsPaymentModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleDownloadPDF = (invoice: CustomerInvoice) => {
    const doc = generateInvoicePDF(invoice);
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const handleSendWhatsApp = (invoice: CustomerInvoice) => {
    const phone = invoice.customerMobile.replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const message = encodeURIComponent(
      `Hello ${invoice.customerName},\n\nYour official Apply365 invoice is ready.\n\nInvoice No: ${invoice.invoiceNumber}\nService: ${invoice.serviceName}\nTotal Amount: ${formatINR(invoice.totalAmount)}\nAmount Paid: ${formatINR(invoice.amountPaid)}\nBalance Due: ${formatINR(invoice.balanceDue)}\nStatus: ${invoice.paymentStatus.toUpperCase()}\n\n💳 Pay Instantly Online via Razorpay:\nhttps://apply-365.vercel.app/pay/${invoice.invoiceNumber}\n\nOr login to your customer portal:\nhttps://apply-365.vercel.app/dashboard\n\nThank you for choosing Apply365!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleCancelInvoice = async (invoice: CustomerInvoice) => {
    if (window.confirm(`Are you sure you want to mark invoice ${invoice.invoiceNumber} as cancelled?`)) {
      await cancelInvoice(invoice.id, 'Administrative cancellation');
      await loadData();
    }
  };

  // Filtered list
  const filtered = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerMobile.includes(q) ||
      inv.serviceName.toLowerCase().includes(q) ||
      (inv.applicationId && inv.applicationId.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregate stats
  const totalInvoices = invoices.length;
  const totalBilled = invoices.reduce((acc, i) => acc + (i.paymentStatus !== 'cancelled' ? i.totalAmount : 0), 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (i.paymentStatus !== 'cancelled' ? i.amountPaid : 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.paymentStatus !== 'cancelled' ? i.balanceDue : 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#104A96]" />
            <span>Customer Invoices & Billing Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate branded PDF invoices, track payments, record transactions, and provide transparent billing to citizens.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Total Invoices</span>
            <Receipt className="w-4 h-4 text-[#104A96]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {totalInvoices}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">All generated billings</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Total Billed</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatINR(totalBilled)}
          </div>
          <p className="text-[11px] text-blue-600 mt-1 font-medium">Gross billable value</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Collected Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            {formatINR(totalCollected)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Confirmed payments</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>Outstanding Balance</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
            {formatINR(totalOutstanding)}
          </div>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Awaiting receipt</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, applicant, phone or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'partially_paid', label: 'Partially Paid' },
            { id: 'paid', label: 'Paid' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-[#104A96] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-3 border-[#104A96] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">Loading customer invoices...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <Receipt className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No invoices found matching criteria.</p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Generate First Invoice</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Service & App ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#104A96]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{inv.customerMobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{inv.serviceName}</div>
                      {inv.applicationId && (
                        <div className="text-[#104A96] font-mono text-[10px] font-bold">
                          {inv.applicationId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">
                      {formatINR(inv.amountPaid)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={inv.balanceDue > 0 ? 'text-amber-600' : 'text-slate-400'}>
                        {formatINR(inv.balanceDue)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : inv.paymentStatus === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : inv.paymentStatus === 'cancelled'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {inv.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(inv)}
                          title="Download PDF Invoice"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(inv)}
                          title="Send to Customer via WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {inv.paymentStatus !== 'paid' && inv.paymentStatus !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(inv)}
                            title="Record Customer Payment"
                            className="px-2.5 py-1 rounded-lg bg-[#104A96] text-white hover:bg-[#07366F] font-bold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Record Pay</span>
                          </button>
                        )}

                        {inv.paymentStatus !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleCancelInvoice(inv)}
                            title="Cancel Invoice"
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[94dvh] overflow-hidden my-auto">
            
            {/* Header */}
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#104A96]" />
                  <span>Generate Customer Invoice</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Create a sequential, official Apply365 branded invoice linked to an application.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Choose Service directly (Aadhaar / PAN / Voter ID etc. requested in image copy 26.png) */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#104A96]" />
                      <span>Choose Service (e.g. Aadhaar / PAN / Voter ID / MSME / Courses):</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Auto-fills service name and invoice line items</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <select
                        value={selectedServiceSlug}
                        onChange={(e) => handleServiceSelect(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                      >
                        <option value="">-- Choose Service (Aadhaar, PAN, etc.) --</option>
                        {services.map((svc) => (
                          <option key={svc.id} value={svc.slug}>
                            {svc.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedServiceSlug ? (() => {
                      const currentSvc = services.find(s => s.slug === selectedServiceSlug || s.id === selectedServiceSlug);
                      const subList = currentSvc?.subServices && currentSvc.subServices.length > 0 
                        ? currentSvc.subServices 
                        : getDefaultSubServices(selectedServiceSlug);
                      return (
                        <div>
                          <select
                            value={selectedSubServiceValue}
                            onChange={(e) => handleSubServiceSelect(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                          >
                            <option value="">-- Choose Sub-Service Option --</option>
                            {subList.map((sub) => (
                              <option key={sub.value} value={sub.value}>
                                {sub.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })() : (
                      <div className="hidden sm:flex items-center text-xs text-slate-400 italic px-2">
                        Select a service to choose sub-service options
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-fill from Existing Application Selector */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                  <label className="text-xs font-bold text-[#104A96] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Or Link to Submitted Customer Application (Optional):</span>
                  </label>
                  <select
                    value={selectedAppId}
                    onChange={(e) => handleAppSelect(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  >
                    <option value="">-- Choose Application or Fill Manually Below --</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.id} — {app.customerName} ({app.serviceTitle} | {app.customerMobile})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="customer@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Service Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aadhaar Card Correction"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Invoice Date *</label>
                    <input
                      type="date"
                      required
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Invoice Line Items & Charges
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-xs font-bold text-[#104A96] hover:text-[#07366F] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          required
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                          className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-center font-mono"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Rate"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-right font-mono"
                        />
                        <div className="w-24 text-right font-mono font-bold text-xs text-slate-800">
                          {formatINR(item.total)}
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation Summary Row */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block">Discount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block">GST / Tax Rate (%)</label>
                        <select
                          value={taxRate}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                        >
                          <option value="0">0% (Nil)</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18% (Standard GST)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block">Initial Amount Paid (₹)</label>
                      <input
                        type="number"
                        min="0"
                        max={totalAmount}
                        value={initialPaid}
                        onChange={(e) => setInitialPaid(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span>-{formatINR(discount)}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Tax ({taxRate}%):</span>
                        <span>{formatINR(taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-[#104A96] pt-1 border-t border-slate-200">
                      <span>Grand Total:</span>
                      <span>{formatINR(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Amount Paid:</span>
                      <span className="text-emerald-600 font-bold">{formatINR(initialPaid)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold">
                      <span>Balance Due:</span>
                      <span className={totalAmount - initialPaid > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                        {formatINR(Math.max(0, totalAmount - initialPaid))}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="shrink-0 p-4 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Invoice...</span>
                    </>
                  ) : (
                    <span>Generate & Finalize Invoice</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#104A96]" />
                  <span>Record Customer Payment</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedInvoice.invoiceNumber} — {selectedInvoice.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
              
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between font-mono">
                <span className="font-bold text-amber-900">Remaining Balance Due:</span>
                <span className="font-extrabold text-base text-amber-800">
                  {formatINR(selectedInvoice.balanceDue)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Payment Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedInvoice.balanceDue}
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 text-sm focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Payment Mode</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  >
                    <option value="UPI">UPI (Google Pay/PhonePe)</option>
                    <option value="Bank Transfer">Bank NEFT/IMPS</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Credit/Debit Card">Card POS</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Transaction Reference / UTR Number</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/1234567890 or Bank Ref"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Received via QR code in office"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPaying ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

