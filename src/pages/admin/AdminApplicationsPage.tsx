import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllApplications, 
  updateApplicationWithHistory, 
  getApplicationStatusHistory,
  sendApplicationSoftCopy,
  getApplicationDeliveries
} from '../../services/dataSyncService';
import { 
  CustomerApplication, 
  ApplicationStatusHistoryItem, 
  ApplicationDeliveryRecord 
} from '../../types/application';
import { generateApplicationSummaryPDF, generateInvoicePDF } from '../../utils/pdfGenerator';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { downloadDocumentFile } from '../../utils/fileDownloadHelper';
import { 
  FileText, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink,
  Download,
  Eye,
  ShieldCheck,
  Send,
  Share2,
  Calendar,
  History,
  Check,
  Receipt,
  Sparkles,
  MessageSquare,
  CreditCard,
  Lock,
  BadgeCheck,
  Info,
  Image as ImageIcon,
  FileCheck2
} from 'lucide-react';

const ALL_STATUSES = [
  { id: 'application_received', label: 'Application Received', color: 'bg-blue-100 text-blue-800' },
  { id: 'under_review', label: 'Under Review', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'documents_pending', label: 'Documents Pending', color: 'bg-amber-100 text-amber-800' },
  { id: 'documents_verified', label: 'Documents Verified', color: 'bg-teal-100 text-teal-800' },
  { id: 'payment_pending', label: 'Payment Pending', color: 'bg-orange-100 text-orange-800' },
  { id: 'payment_received', label: 'Payment Received', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'processing', label: 'Processing', color: 'bg-sky-100 text-sky-800' },
  { id: 'submitted_to_authority', label: 'Submitted to Authority', color: 'bg-purple-100 text-purple-800' },
  { id: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-800 font-bold' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 font-bold' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-slate-200 text-slate-800' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-200 text-emerald-900 font-bold' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-gray-200 text-gray-700' },
];

export const AdminApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Selected Application for Details & Status Updates
  const [selectedApp, setSelectedApp] = useState<CustomerApplication | null>(null);
  const [statusHistory, setStatusHistory] = useState<ApplicationStatusHistoryItem[]>([]);
  const [deliveries, setDeliveries] = useState<ApplicationDeliveryRecord[]>([]);

  // Update Status & Date Form State
  const [newStatus, setNewStatus] = useState<string>('under_review');
  const [customerMessage, setCustomerMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [customSubmissionDate, setCustomSubmissionDate] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Send Soft Copy Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryChannel, setDeliveryChannel] = useState<'whatsapp' | 'email' | 'portal_notification'>('whatsapp');
  const [recipientContact, setRecipientContact] = useState('');
  const [isSendingCopy, setIsSendingCopy] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState('');

  // Document Preview & Details State
  const [activePreviewDocIndex, setActivePreviewDocIndex] = useState<number>(-1);
  const [detailsDocIndex, setDetailsDocIndex] = useState<number | null>(null);

  const loadApps = async () => {
    const list = await getAllApplications();
    setApplications(list);
  };

  useEffect(() => {
    loadApps();
    const handleSync = () => loadApps();
    window.addEventListener('apply365_data_sync', handleSync);
    return () => window.removeEventListener('apply365_data_sync', handleSync);
  }, []);

  const openAppDetails = async (app: CustomerApplication) => {
    setSelectedApp(app);
    setNewStatus(app.status || 'under_review');
    setCustomerMessage('');
    setInternalNote('');
    const rawDate = app.createdAt || app.submissionDate || new Date().toISOString();
    setCustomSubmissionDate(rawDate.slice(0, 10));
    setExpectedDate(app.expectedCompletionDate ? app.expectedCompletionDate.slice(0, 10) : '');
    setStatusUpdateSuccess(false);

    // Fetch history and deliveries
    const [hist, delivs] = await Promise.all([
      getApplicationStatusHistory(app.id),
      getApplicationDeliveries(app.id)
    ]);
    setStatusHistory(hist);
    setDeliveries(delivs);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdatingStatus(true);
    setStatusUpdateSuccess(false);
    try {
      const updated = await updateApplicationWithHistory(
        selectedApp.id,
        newStatus,
        customerMessage.trim() || `Status updated to ${newStatus.replace(/_/g, ' ')}.`,
        internalNote.trim() || undefined,
        expectedDate || undefined,
        customSubmissionDate ? new Date(customSubmissionDate).toISOString() : undefined,
        'Super Administrator'
      );

      setSelectedApp(updated);
      setStatusUpdateSuccess(true);
      setTimeout(() => setStatusUpdateSuccess(false), 3000);

      // Refresh history & list
      const hist = await getApplicationStatusHistory(selectedApp.id);
      setStatusHistory(hist);
      await loadApps();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDownloadSoftCopy = (app: CustomerApplication) => {
    const doc = generateApplicationSummaryPDF(app);
    doc.save(`Apply365-${app.id}-SoftCopy.pdf`);
  };

  const openDeliveryModal = (app: CustomerApplication) => {
    setSelectedApp(app);
    setDeliveryChannel('whatsapp');
    setRecipientContact(app.customerMobile);
    setDeliverySuccess('');
    setIsDeliveryModalOpen(true);
  };

  const handleSendSoftCopy = async () => {
    if (!selectedApp || !recipientContact.trim()) {
      alert('Please enter recipient contact number or email.');
      return;
    }

    setIsSendingCopy(true);
    try {
      await sendApplicationSoftCopy(
        selectedApp.id,
        deliveryChannel,
        recipientContact.trim(),
        'Super Administrator'
      );

      // If WhatsApp, launch pre-filled message
      if (deliveryChannel === 'whatsapp') {
        const phone = recipientContact.replace(/[^0-9]/g, '');
        const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
        const message = encodeURIComponent(
          `Hello ${selectedApp.customerName},\n\nYour official Apply365 Application Soft Copy for *${selectedApp.serviceTitle}* is ready!\n\nApplication ID: ${selectedApp.id}\nCurrent Status: ${selectedApp.status.toUpperCase()}\n\nPlease view or download your verified dossier at: https://apply-365.vercel.app/dashboard\n\nThank you for choosing Apply365!`
        );
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
      } else if (deliveryChannel === 'email') {
        const subject = encodeURIComponent(`Your Apply365 Application Copy – ${selectedApp.id}`);
        const body = encodeURIComponent(
          `Dear ${selectedApp.customerName},\n\nYour application has been received and verified by Apply365.\n\nApplication ID: ${selectedApp.id}\nService: ${selectedApp.serviceTitle}\nCurrent Status: ${selectedApp.status}\n\nPlease log in to your Customer Portal to access your official electronic soft copy.\n\nThank you,\nApply365 Citizen Support`
        );
        window.open(`mailto:${recipientContact}?subject=${subject}&body=${body}`, '_blank');
      }

      setDeliverySuccess(`Document soft copy dispatched via ${deliveryChannel.toUpperCase()} successfully!`);
      const delivs = await getApplicationDeliveries(selectedApp.id);
      setDeliveries(delivs);
    } catch (err: any) {
      alert(err.message || 'Delivery recording failed.');
    } finally {
      setIsSendingCopy(false);
    }
  };

  const filtered = applications.filter(a => {
    const matchesSearch = 
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerMobile.includes(searchQuery) ||
      a.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

    // Date Filtering Logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const rawDate = a.submissionDate || a.createdAt || '';
      const appDate = rawDate ? new Date(rawDate) : new Date();
      const now = new Date();

      if (dateFilter === 'today') {
        matchesDate = appDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        matchesDate = appDate.toDateString() === yesterday.toDateString();
      } else if (dateFilter === 'last7') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = appDate >= sevenDaysAgo;
      } else if (dateFilter === 'last30') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = appDate >= thirtyDaysAgo;
      } else if (dateFilter === 'thisMonth') {
        matchesDate = appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'custom') {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = appDate >= start && appDate <= end;
        } else if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = appDate >= start;
        } else if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = appDate <= end;
        }
      }
    }

    // Payment Status Filter
    const isPaid = a.paymentStatus === 'payment_completed' || 
                   (a.formData && a.formData._payment && a.formData._payment.status === 'payment_completed') ||
                   Boolean(a.paymentAmount && a.paymentAmount > 0);
    const matchesPayment = 
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && isPaid) ||
      (paymentFilter === 'pending' && !isPaid);

    return matchesSearch && matchesStatus && matchesDate && matchesPayment;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#104A96]" />
            <span>Service Applications Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track citizen filing lifecycle, update multi-stage status, generate branded soft copies, and dispatch notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-[#104A96] border border-blue-100">
            {applications.length} Total Submissions
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/invoices')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Go to Invoices</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, applicant name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                statusFilter === 'all' 
                  ? 'bg-[#104A96] text-white shadow-xs' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Submissions
            </button>
            {ALL_STATUSES.slice(0, 7).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors shrink-0 ${
                  statusFilter === st.id 
                    ? 'bg-[#104A96] text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Status Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
              <CreditCard className="w-4 h-4 text-[#104A96]" />
              <span>Filter by Payment:</span>
            </span>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `All Payments (${applications.length})` },
                { id: 'paid', label: `Fee Paid (${applications.filter(a => a.paymentStatus === 'payment_completed' || (a.formData && a.formData._payment && a.formData._payment.status === 'payment_completed') || a.paymentAmount).length})` },
                { id: 'pending', label: `Pending (${applications.filter(a => !(a.paymentStatus === 'payment_completed' || (a.formData && a.formData._payment && a.formData._payment.status === 'payment_completed') || a.paymentAmount)).length})` }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentFilter(p.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === p.id 
                      ? 'bg-[#104A96] text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
            Total Revenue: ₹{applications.filter(a => a.paymentStatus === 'payment_completed' || (a.formData && a.formData._payment && a.formData._payment.status === 'payment_completed') || a.paymentAmount).reduce((sum, a) => sum + Number(a.paymentAmount || 50), 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Date Customize & Date Range Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-[#104A96]" />
            <span>Customize Date Filter:</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'last30', label: 'Last 30 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'custom', label: 'Custom Range...' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDateFilter(p.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  dateFilter === p.id 
                    ? 'bg-[#104A96] text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 pt-1 sm:pt-0 pl-1 border-t sm:border-t-0 sm:border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 bg-white"
              />
              <span className="text-[11px] font-semibold text-slate-500">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 bg-white"
              />
              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
                  className="text-xs text-red-600 hover:underline font-bold px-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {dateFilter !== 'all' && (
            <button
              type="button"
              onClick={() => { setDateFilter('all'); setCustomStartDate(''); setCustomEndDate(''); }}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold ml-auto"
            >
              Reset Date Filter
            </button>
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No applications found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Application Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#104A96]">
                      {app.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{app.customerMobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.serviceTitle}</div>
                      <div className="text-slate-400 text-[10px]">{app.serviceType || 'Standard'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {app.paymentStatus === 'payment_completed' || (app.formData && app.formData._payment && app.formData._payment.status === 'payment_completed') || app.paymentAmount ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid: ₹{app.paymentAmount || 50}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[120px] mt-0.5" title={app.paymentTransactionId || 'UPI Verified'}>
                            {app.paymentTransactionId || (app.formData?._payment?.txnId) || 'UPI Verified'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {app.documents.filter(d => d.status === 'uploaded' || d.fileUrl).length} Uploaded
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      <div className="font-bold flex items-center gap-1 text-slate-800">
                        <Calendar className="w-3 h-3 text-[#104A96]" />
                        <span>{new Date(app.createdAt || app.submissionDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {app.expectedCompletionDate && (
                        <div className="text-[10px] text-amber-600 flex items-center gap-0.5 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Target: {new Date(app.expectedCompletionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#104A96] border border-blue-200 uppercase tracking-wider">
                        {String(app.status).replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadSoftCopy(app)}
                          title="Download Application PDF"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeliveryModal(app)}
                          title="Send Soft Copy to Customer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openAppDetails(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#104A96] text-white hover:bg-[#07366F] font-bold transition-colors"
                        >
                          Inspect & Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPLICATION INSPECTOR & STATUS MANAGEMENT MODAL */}
      {selectedApp && !isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92dvh] overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {selectedApp.id}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedApp.serviceTitle} Application</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-[#104A96]">
                    {String(selectedApp.status).replace(/_/g, ' ')}
                  </span>
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSoftCopy(selectedApp)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDeliveryModal(selectedApp)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Citizen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
              
              {/* Payment Verification & Transaction Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-emerald-50/70 border border-emerald-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                      Payment Verification & Transaction Details
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedApp) return;
                      try {
                        const feeAmt = selectedApp.paymentAmount || 50;
                        const invPdf = generateInvoicePDF({
                          id: `inv_${selectedApp.id}`,
                          invoiceNumber: `INV-${selectedApp.id.replace('APP365-', '')}`,
                          applicationId: selectedApp.id,
                          customerId: selectedApp.customerId,
                          customerName: selectedApp.customerName,
                          customerEmail: selectedApp.customerEmail,
                          customerMobile: selectedApp.customerMobile,
                          serviceName: selectedApp.serviceTitle,
                          invoiceDate: (selectedApp.createdAt || selectedApp.submissionDate || new Date().toISOString()).slice(0, 10),
                          dueDate: (selectedApp.createdAt || selectedApp.submissionDate || new Date().toISOString()).slice(0, 10),
                          items: [
                            {
                              id: 'item-1',
                              description: `${selectedApp.serviceTitle} — Statutory Application Facilitation Fee`,
                              quantity: 1,
                              unitPrice: feeAmt,
                              total: feeAmt
                            }
                          ],
                          subtotal: feeAmt,
                          taxAmount: 0,
                          discount: 0,
                          taxRate: 0,
                          totalAmount: feeAmt,
                          amountPaid: feeAmt,
                          balanceDue: 0,
                          paymentStatus: 'paid',
                          invoiceStatus: 'finalized',
                          payments: [
                            {
                              id: `pay_${selectedApp.id}`,
                              amount: feeAmt,
                              paymentDate: (selectedApp.createdAt || new Date().toISOString()).slice(0, 10),
                              paymentMethod: 'UPI',
                              referenceNumber: selectedApp.paymentTransactionId || 'Verified',
                              recordedBy: 'PhonePe UPI QR Verification',
                              notes: 'Mandatory Application Fee'
                            }
                          ],
                          notes: `Official payment receipt for application ${selectedApp.id}.`
                        });
                        invPdf.save(`Receipt_${selectedApp.id}.pdf`);
                      } catch (err) {
                        console.warn(err);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Download Payment Receipt</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment Status</span>
                    <span className="font-extrabold text-emerald-800 mt-0.5 inline-flex items-center gap-1 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{selectedApp.paymentStatus === 'payment_completed' || selectedApp.paymentAmount ? 'Payment Completed' : 'Payment Received'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Amount Paid</span>
                    <span className="font-black text-slate-900 mt-0.5 block text-sm">
                      ₹{selectedApp.paymentAmount || 50}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">UPI UTR / Txn Ref</span>
                    <span className="font-mono font-bold text-[#104A96] mt-0.5 block truncate" title={selectedApp.paymentTransactionId || 'UPI Verified'}>
                      {selectedApp.paymentTransactionId || (selectedApp.formData?._payment?.txnId) || 'UPI Verified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment Method</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      PhonePe / UPI QR Payment
                    </span>
                  </div>
                </div>
              </div>

              {/* Applicant Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Applicant Name:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact Phone:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.customerMobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email:</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selectedApp.customerEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Request Type:</span>
                  <span className="font-bold text-[#104A96] mt-0.5 block">{selectedApp.serviceType || 'Standard'}</span>
                </div>
              </div>

              {/* Dynamic Form Data Submitted */}
              {selectedApp.formData && Object.keys(selectedApp.formData).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Submitted Application Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(selectedApp.formData).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{k}</span>
                        <span className="font-semibold text-slate-800 break-words">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Documents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#104A96]" />
                    <span>Attached Citizen Proofs ({selectedApp.documents.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">View in integrated viewer • Download original</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {selectedApp.documents.map((doc, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-2xs space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-2.5">
                          {doc.fileName?.match(/\.(jpeg|jpg|png|webp|gif)/i) || doc.fileType?.includes('image') ? (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className={doc.fileUrl ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium'}>
                                {doc.fileUrl ? '✓ File Attached' : 'Pending Upload'}
                              </span>
                              {doc.fileSize && <span className="text-slate-400">• {doc.fileSize}</span>}
                              {doc.fileName && <span className="text-slate-400 truncate max-w-[140px]">• {doc.fileName}</span>}
                            </div>
                          </div>
                        </div>

                        {/* 3 Working Actions: View, Download, Details */}
                        {doc.fileUrl ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Action A: View */}
                            <button
                              type="button"
                              onClick={() => setActivePreviewDocIndex(idx)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#104A96] hover:bg-[#07366F] text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                              title="View in Integrated Preview"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>

                            {/* Action B: Download */}
                            <button
                              type="button"
                              onClick={() => downloadDocumentFile(doc.fileUrl, doc.fileName || `${doc.name}.png`)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Download Original File"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>

                            {/* Action C: Details */}
                            <button
                              type="button"
                              onClick={() => setDetailsDocIndex(detailsDocIndex === idx ? null : idx)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                detailsDocIndex === idx ? 'bg-blue-100 text-[#104A96]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                              title="Show Details"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No File Uploaded</span>
                        )}
                      </div>

                      {/* Expandable Details Drawer */}
                      {detailsDocIndex === idx && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-150">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Filename:</span>
                            <span className="font-semibold text-slate-800 truncate block">{doc.fileName || doc.name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Type:</span>
                            <span className="font-semibold text-slate-800 truncate block">{doc.fileType || 'Document Proof'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Size:</span>
                            <span className="font-semibold text-slate-800 truncate block">{doc.fileSize || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Uploaded At:</span>
                            <span className="font-semibold text-slate-800 truncate block">{doc.uploadedAt || 'With Application'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* UPDATE STATUS SECTION (MODULE 3) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Update Lifecycle Status & Notify Customer</span>
                  </h4>

                  {statusUpdateSuccess && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Status updated & citizen notified!</span>
                    </span>
                  )}
                </div>

                <form onSubmit={handleStatusSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">New Application Status *</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                      >
                        {ALL_STATUSES.map(st => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#104A96]" />
                        <span>Filing / Submission Date</span>
                      </label>
                      <input
                        type="date"
                        value={customSubmissionDate}
                        onChange={(e) => setCustomSubmissionDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Expected Completion Date</span>
                      </label>
                      <input
                        type="date"
                        value={expectedDate}
                        onChange={(e) => setExpectedDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Customer-Visible Status Message (Displayed in Citizen Portal & Notification)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Your biometric appointment has been scheduled at CSC Centre."
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Internal Admin Note (Private — Not shown to customer)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. URN generated on UIDAI portal: 1029384756"
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingStatus}
                      className="px-5 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isUpdatingStatus ? 'Saving Status...' : 'Save Status & Notify Citizen'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Status History Audit Trail */}
              {statusHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Application Status Audit Timeline ({statusHistory.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {statusHistory.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#104A96] uppercase">
                            {item.newStatus.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {item.customerMessage && (
                          <p className="text-slate-700 font-medium">{item.customerMessage}</p>
                        )}
                        {item.internalNote && (
                          <p className="text-amber-800 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/50 text-[11px]">
                            <strong>Internal Note:</strong> {item.internalNote}
                          </p>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Updated by: {item.updatedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Delivery History */}
              {deliveries.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-slate-400" />
                    <span>Document Delivery Logs ({deliveries.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {deliveries.map((deliv) => (
                      <div key={deliv.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 uppercase">{deliv.deliveryChannel}</span>
                          <span className="text-slate-500 ml-2">Sent to: {deliv.recipient}</span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {deliv.deliveryStatus.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {new Date(deliv.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => navigate('/admin/invoices')}
                className="px-4 py-2 rounded-xl border border-[#104A96] text-[#104A96] hover:bg-blue-50 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Issue Invoice for this App</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SEND APPLICATION SOFT COPY MODAL (MODULE 2) */}
      {isDeliveryModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#104A96]" />
                  <span>Send Application Soft Copy</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedApp.id} — {selectedApp.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs">
              
              {deliverySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{deliverySuccess}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Service Application:</span>
                <span className="font-bold text-[#104A96] block">{selectedApp.serviceTitle}</span>
                <span className="text-slate-500 text-[11px] block">
                  Current Status: <strong className="uppercase">{selectedApp.status.replace(/_/g, ' ')}</strong>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Choose Delivery Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: Share2 },
                    { id: 'email', label: 'Email', icon: Mail },
                    { id: 'portal_notification', label: 'Portal', icon: MessageSquare }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setDeliveryChannel(ch.id as any);
                        if (ch.id === 'email') {
                          setRecipientContact(selectedApp.customerEmail || '');
                        } else {
                          setRecipientContact(selectedApp.customerMobile || '');
                        }
                      }}
                      className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-colors ${
                        deliveryChannel === ch.id
                          ? 'bg-[#104A96] text-white border-[#104A96]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ch.icon className="w-4 h-4" />
                      <span className="text-[11px]">{ch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  {deliveryChannel === 'email' ? 'Recipient Email Address *' : 'Recipient Mobile Number (WhatsApp) *'}
                </label>
                <input
                  type={deliveryChannel === 'email' ? 'email' : 'text'}
                  required
                  value={recipientContact}
                  onChange={(e) => setRecipientContact(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDownloadSoftCopy(selectedApp)}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Preview PDF</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeliveryModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSoftCopy}
                    disabled={isSendingCopy}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingCopy ? 'Sending...' : 'Send Soft Copy'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Interactive Document Preview Modal */}
      {selectedApp && activePreviewDocIndex >= 0 && selectedApp.documents && selectedApp.documents[activePreviewDocIndex] && (
        <DocumentPreviewModal
          document={selectedApp.documents[activePreviewDocIndex]}
          documents={selectedApp.documents}
          currentIndex={activePreviewDocIndex}
          onNavigate={(newIdx) => setActivePreviewDocIndex(newIdx)}
          onClose={() => setActivePreviewDocIndex(-1)}
          customerName={selectedApp.customerName}
          applicationId={selectedApp.id}
        />
      )}

    </div>
  );
};
