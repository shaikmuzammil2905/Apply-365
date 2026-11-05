import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerApplications, saveApplication } from '../../services/dbService';
import { getCustomerInvoices, getCustomerNotifications, markNotificationAsRead, recordInvoicePayment, createInvoice } from '../../services/dataSyncService';
import { CustomerApplication, ApplicationDocument, CustomerNotification } from '../../types/application';
import { CustomerInvoice, InvoicePayment } from '../../types/invoices';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { generateInvoicePDF, generateApplicationSummaryPDF, formatINR } from '../../utils/pdfGenerator';
import { PhonePeQrPaymentCard } from '../../components/PhonePeQrPaymentCard';
import { getPaymentSubmissions, PaymentSubmission } from '../../services/paymentService';
import confetti from 'canvas-confetti';
import { 
  User, 
  Fingerprint, 
  CreditCard, 
  Vote, 
  Building2, 
  FileCheck2, 
  Landmark, 
  HeartHandshake,
  Globe,
  LogOut, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  PlusCircle, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Save,
  Check,
  Receipt,
  Download,
  Bell,
  QrCode,
  Send,
  HelpCircle,
  Copy,
  X
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { currentUser, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'invoices' | 'payments' | 'documents' | 'profile'>('overview');
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

  // Online Checkout & Payment Proof State
  const [checkoutInvoice, setCheckoutInvoice] = useState<CustomerInvoice | null>(null);
  const [activePayApp, setActivePayApp] = useState<CustomerApplication | null>(null);
  const [resubmitTarget, setResubmitTarget] = useState<PaymentSubmission | null>(null);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [viewReceipt, setViewReceipt] = useState<any | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileMobile, setProfileMobile] = useState(currentUser?.mobile || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileCity, setProfileCity] = useState(currentUser?.city || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load applications & invoices scoped strictly to this customer
  const loadCustomerData = async () => {
    if (!currentUser) return;
    setLoadingApps(true);
    try {
      const [appsData, invsData, notifsData, subsData] = await Promise.all([
        getCustomerApplications(currentUser.id),
        getCustomerInvoices(currentUser.id),
        getCustomerNotifications(currentUser.id),
        getPaymentSubmissions()
      ]);
      setApplications(appsData);
      setInvoices(invsData);
      setNotifications(notifsData);
      setPaymentSubmissions(
        subsData.filter(s => 
          s.customerId === currentUser.id || 
          (currentUser.mobile && s.customerMobile === currentUser.mobile) ||
          (currentUser.email && s.customerEmail === currentUser.email)
        )
      );
    } catch (e) {
      console.error('Failed to load customer data:', e);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
    const handleSync = () => loadCustomerData();
    window.addEventListener('apply365_data_sync', handleSync);
    return () => window.removeEventListener('apply365_data_sync', handleSync);
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileName,
        mobile: profileMobile,
        email: profileEmail,
        city: profileCity,
        address: profileAddress,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDownloadAppPDF = (app: CustomerApplication) => {
    const doc = generateApplicationSummaryPDF(app);
    doc.save(`Apply365-${app.id}-SoftCopy.pdf`);
  };

  const handleDownloadInvoicePDF = (inv: CustomerInvoice) => {
    const doc = generateInvoicePDF(inv);
    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  // Compile all uploaded documents across applications
  const allDocuments: { doc: ApplicationDocument; appId: string; appTitle: string }[] = [];
  applications.forEach((app) => {
    app.documents.forEach((d) => {
      if (d.status === 'uploaded' || d.fileUrl) {
        allDocuments.push({
          doc: d,
          appId: app.id,
          appTitle: app.serviceTitle,
        });
      }
    });
  });

  const customerPayments = invoices.flatMap((inv) =>
    (inv.payments || []).map((p) => ({
      ...p,
      invoiceNumber: inv.invoiceNumber,
      serviceName: inv.serviceName,
      invoiceDate: inv.invoiceDate,
      totalAmount: inv.totalAmount
    }))
  ).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const handleOpenCheckout = (inv: CustomerInvoice) => {
    setCheckoutInvoice(inv);
  };

  const handlePayApplicationFee = (app: CustomerApplication) => {
    setActivePayApp(app);
  };

  const handlePaymentSuccess = async (_sub: PaymentSubmission) => {
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch {}
    setActivePayApp(null);
    setCheckoutInvoice(null);
    setResubmitTarget(null);
    await loadCustomerData();
    setActiveTab('payments');
  };

  const underReviewCount = applications.filter((a) => 
    ['submitted', 'under_review', 'under review', 'submitted_to_authority', 'processing'].includes(String(a.status).toLowerCase())
  ).length;
  const completedCount = applications.filter((a) => String(a.status).toLowerCase() === 'completed').length;
  const outstandingInvoiceCount = invoices.filter((i) => i.paymentStatus !== 'paid' && i.paymentStatus !== 'cancelled').length;
  const totalBalanceDue = invoices.reduce((acc, i) => acc + (i.paymentStatus !== 'cancelled' ? i.balanceDue : 0), 0);

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Dashboard Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#104A96] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {currentUser?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Welcome back, {currentUser?.name}!
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  Verified Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your statutory applications, official soft copies, tax invoices, and verification status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              to="/services"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply for New Service</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'applications', label: `My Applications (${applications.length})`, icon: FileText },
            { id: 'invoices', label: `My Invoices (${invoices.length})`, icon: Receipt },
            { id: 'payments', label: `My Payments (${customerPayments.length})`, icon: CreditCard },
            { id: 'documents', label: `My Documents (${allDocuments.length})`, icon: ShieldCheck },
            { id: 'profile', label: 'Profile Settings', icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#104A96] text-[#104A96] bg-white rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW                                                           */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Applications
                </span>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {applications.length}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Submitted requests</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active in Review
                </span>
                <div className="text-2xl font-black text-[#104A96] font-mono">
                  {underReviewCount}
                </div>
                <p className="text-[11px] text-blue-600 mt-1">Verification in progress</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Completed & Approved
                </span>
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  {completedCount}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">Filing finished</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pending Invoices
                </span>
                <div className="text-2xl font-black text-amber-600 font-mono">
                  {outstandingInvoiceCount}
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  {totalBalanceDue > 0 ? `Due: ${formatINR(totalBalanceDue)}` : 'All paid up'}
                </p>
              </div>
            </div>

            {/* Recent Notifications Feed */}
            {notifications.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#104A96]" />
                    <span>Recent Updates & Alerts ({notifications.length})</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{n.title}</span>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Applications Snapshot */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Recent Applications</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('applications')}
                  className="text-xs font-bold text-[#104A96] hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No applications submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#104A96]">{app.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-[#104A96]">
                            {String(app.status).replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{app.serviceTitle}</h4>
                        <p className="text-xs text-slate-500">
                          Submitted on {new Date(app.createdAt || app.submissionDate || Date.now()).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.paymentStatus === 'payment_pending' && (
                          <button
                            type="button"
                            onClick={() => handlePayApplicationFee(app)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay ₹{app.paymentAmount || 50}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadAppPDF(app)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Copy</span>
                        </button>

                        <Link
                          to={`/applications/${app.id}`}
                          className="px-4 py-1.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all shadow-xs"
                        >
                          View Status Timeline
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY APPLICATIONS                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Submitted Service Applications</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Track full multi-stage processing, review verification notes, and download official soft copies.
                </p>
              </div>

              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#104A96] text-white font-bold text-xs shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Application</span>
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Applications Submitted Yet</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Start your first statutory service request for Aadhaar, PAN Card, Voter ID, MSME, or Labour License.
                </p>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 bg-[#104A96] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs"
                >
                  <span>Explore Available Services</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const linkedInv = invoices.find(inv => inv.applicationId === app.id);

                  return (
                    <div
                      key={app.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#104A96] bg-blue-50 px-2.5 py-1 rounded-lg">
                              {app.id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#104A96]">
                              {String(app.status).replace(/_/g, ' ')}
                            </span>
                            {(app.paymentStatus === 'payment_completed' || linkedInv?.paymentStatus === 'paid' || app.paymentAmount) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Paid (₹{app.paymentAmount || linkedInv?.totalAmount || 50})</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                                Payment Pending
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mt-2">{app.serviceTitle}</h4>
                          <p className="text-xs text-slate-500">
                            Filing submitted on {new Date(app.createdAt || app.submissionDate || Date.now()).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {app.paymentStatus === 'payment_pending' ? (
                            <button
                              type="button"
                              onClick={() => handlePayApplicationFee(app)}
                              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer animate-pulse hover:animate-none"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Complete Your Payment – ₹{app.paymentAmount || 50}</span>
                            </button>
                          ) : (
                            /* Payment Receipt Button */
                            <button
                              type="button"
                              onClick={() => {
                                const fee = app.paymentAmount || linkedInv?.totalAmount || 50;
                                const invPdf = generateInvoicePDF({
                                  id: `inv_${app.id}`,
                                  invoiceNumber: `INV-${app.id.replace('APP365-', '')}`,
                                  applicationId: app.id,
                                  customerId: app.customerId,
                                  customerName: app.customerName,
                                  customerEmail: app.customerEmail,
                                  customerMobile: app.customerMobile,
                                  serviceName: app.serviceTitle,
                                  invoiceDate: (app.createdAt || app.submissionDate || new Date().toISOString()).slice(0, 10),
                                  dueDate: (app.createdAt || app.submissionDate || new Date().toISOString()).slice(0, 10),
                                  items: [
                                    {
                                      id: 'item-1',
                                      description: `${app.serviceTitle} — Statutory Facilitation Fee`,
                                      quantity: 1,
                                      unitPrice: fee,
                                      total: fee
                                    }
                                  ],
                                  subtotal: fee,
                                  taxAmount: 0,
                                  discount: 0,
                                  taxRate: 0,
                                  totalAmount: fee,
                                  amountPaid: fee,
                                  balanceDue: 0,
                                  paymentStatus: 'paid',
                                  invoiceStatus: 'finalized',
                                  payments: [
                                    {
                                      id: `pay_${app.id}`,
                                      amount: fee,
                                      paymentDate: (app.createdAt || new Date().toISOString()).slice(0, 10),
                                      paymentMethod: 'UPI / PhonePe',
                                      referenceNumber: app.paymentTransactionId || 'UPI Verified',
                                      recordedBy: 'Admin Verified',
                                      notes: 'Application fee paid online'
                                    }
                                  ],
                                  notes: `Official payment receipt for application ${app.id}.`
                                });
                                invPdf.save(`Receipt_${app.id}.pdf`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Payment Receipt</span>
                            </button>
                          )}

                          {linkedInv && (
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoicePDF(linkedInv)}
                              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#104A96] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Invoice PDF</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDownloadAppPDF(app)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Soft Copy</span>
                          </button>

                          <Link
                            to={`/applications/${app.id}`}
                            className="px-4 py-1.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Timeline</span>
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
                        <div>Applicant: <strong className="text-slate-800 block truncate">{app.customerName}</strong></div>
                        <div>Payment Ref: <strong className="text-[#104A96] font-mono block truncate">{app.paymentTransactionId || (app.formData?._payment?.txnId) || 'UPI Verified'}</strong></div>
                        <div>Attached Proofs: <strong className="text-emerald-700 block">{app.documents.filter(d => d.status === 'uploaded' || d.fileUrl).length} files attached</strong></div>
                        <div>Mobile: <strong className="text-slate-800 block">{app.customerMobile}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MY INVOICES (MODULE 1.6)                                           */}
        {/* ========================================================================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Official Tax Invoices & Receipts</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Inspect itemized billing, verify payments, and download certified PDF invoices.
                </p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Invoices Issued Yet</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  When our accounts team issues a facilitation invoice for your application, it will be securely accessible here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#104A96] bg-blue-50 px-2.5 py-1 rounded-lg">
                            {inv.invoiceNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.paymentStatus === 'partially_paid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {inv.paymentStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-2">{inv.serviceName}</h4>
                        <p className="text-xs text-slate-500">
                          Invoice Date: {inv.invoiceDate} {inv.dueDate ? ` | Due: ${inv.dueDate}` : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {inv.balanceDue > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenCheckout(inv)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now ({formatINR(inv.balanceDue)})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadInvoicePDF(inv)}
                          className="px-4 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Invoice PDF</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Bill:</span>
                        <strong className="text-slate-900 text-sm block">{formatINR(inv.totalAmount)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Paid Confirmed:</span>
                        <strong className="text-emerald-700 text-sm block">{formatINR(inv.amountPaid)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Balance Due:</span>
                        <strong className={`text-sm block ${inv.balanceDue > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {formatINR(inv.balanceDue)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Mode:</span>
                        <strong className="text-slate-800 text-xs block font-sans">
                          {inv.payments?.[0]?.paymentMethod || 'Direct / UPI'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: MY PAYMENTS & RECEIPTS                                               */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Payment History & Verification Status</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Track your PhonePe & UPI QR payment proofs, admin verification updates, and access verified digital receipts.
                </p>
              </div>
            </div>

            {/* UPI QR Submissions (Verification Station) */}
            {paymentSubmissions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#5f259f]" />
                  <span>Submitted PhonePe & UPI Payments ({paymentSubmissions.length})</span>
                </h4>

                <div className="space-y-3">
                  {paymentSubmissions.map((sub) => {
                    const isPending = sub.verificationStatus === 'PENDING_VERIFICATION';
                    const isApproved = sub.verificationStatus === 'APPROVED';
                    const isRejected = sub.verificationStatus === 'REJECTED';
                    const isResubmit = sub.verificationStatus === 'RESUBMISSION_REQUESTED';

                    return (
                      <div
                        key={sub.id}
                        className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-xs space-y-3.5 transition-all ${
                          isResubmit
                            ? 'border-rose-300 ring-2 ring-rose-100'
                            : isApproved
                            ? 'border-emerald-200'
                            : 'border-slate-200/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[#104A96] bg-blue-50 px-2.5 py-0.5 rounded-lg">
                                {sub.orderId}
                              </span>
                              
                              {isPending && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending Admin Verification</span>
                                </span>
                              )}

                              {isApproved && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Verified & Approved</span>
                                </span>
                              )}

                              {isResubmit && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>Action Required: Resubmit Proof</span>
                                </span>
                              )}

                              {isRejected && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                                  <X className="w-3 h-3 text-red-600" />
                                  <span>Payment Rejected</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-slate-900 mt-1">{sub.serviceName}</h4>
                          </div>

                          <div className="text-right flex items-center sm:block justify-between">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
                            <span className="text-2xl font-black text-slate-900">{formatINR(sub.amount)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">12-Digit UTR:</span>
                            <strong className="font-mono text-[#104A96] block truncate">{sub.utrNumber}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mode:</span>
                            <strong className="text-slate-800 block">PhonePe / UPI QR</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted At:</span>
                            <span className="text-slate-700 block truncate">
                              {new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Access:</span>
                            <span className={`font-bold block ${isApproved ? 'text-emerald-700' : 'text-amber-600'}`}>
                              {isApproved ? 'Unlocked & Active' : 'Locked (Verifying)'}
                            </span>
                          </div>
                        </div>

                        {/* Admin Remark / Resubmission Box */}
                        {isResubmit && (
                          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Admin Remark: {sub.adminNotes || 'Please upload a clear screenshot showing full 12-digit UTR.'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setResubmitTarget(sub)}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Re-upload Payment Proof & Correct UTR</span>
                            </button>
                          </div>
                        )}

                        {isRejected && sub.rejectionReason && (
                          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
                            <strong>Rejection Note:</strong> {sub.rejectionReason}
                          </div>
                        )}

                        {isApproved && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Bank credit confirmed by Admin. Your application is processing.</span>
                            </span>
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
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Stamped Receipt</span>
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirmed Invoice Payments */}
            {customerPayments.length === 0 && paymentSubmissions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Payments Recorded Yet</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  When you complete a payment for an issued facilitation invoice or service application, your transaction receipts will be archived here.
                </p>
              </div>
            ) : customerPayments.length > 0 ? (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#104A96]" />
                  <span>Confirmed Invoices & Settled Transactions</span>
                </h4>

                <div className="space-y-3">
                  {customerPayments.map((p) => {
                    const pDate = new Date(p.paymentDate);
                    const formattedDate = pDate.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#104A96] bg-blue-50 px-2.5 py-0.5 rounded-lg">
                              {p.invoiceNumber}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Payment Verified</span>
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{p.serviceName}</h4>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Date: {formattedDate}</span>
                            <span>Method: <strong className="text-slate-700">{p.paymentMethod}</strong></span>
                            <span>Ref: <strong className="font-mono text-slate-700">{p.transactionReference || 'N/A'}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Paid</span>
                            <span className="text-xl font-black text-emerald-700">{formatINR(p.amount)}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setViewReceipt(p)}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#104A96] text-slate-700 hover:text-[#104A96] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MY DOCUMENTS & SOFT COPIES (MODULE 4)                               */}
        {/* ========================================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            
            {/* Soft Copies Section */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#104A96]" />
                <span>Generated Official Application Soft Copies</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official PDF filing dossiers generated for your citizen records.
              </p>

              {applications.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-slate-400 text-xs border border-slate-200">
                  No soft copies generated yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#104A96]">{app.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                          Certified Dossier
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm truncate">{app.serviceTitle}</h4>
                      <p className="text-xs text-slate-500">
                        Date: {new Date(app.createdAt || app.submissionDate || Date.now()).toLocaleDateString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDownloadAppPDF(app)}
                        className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#104A96] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Soft Copy</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submitted Proofs Library */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Your Uploaded Identity Proofs Library</h3>
              <p className="text-xs text-slate-500">
                Individual documents attached during application filing.
              </p>

              {allDocuments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
                  No individual identity files uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allDocuments.map(({ doc, appId, appTitle }, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Attached File
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{appId}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{doc.fileName || 'Attached proof'}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="w-full py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#104A96] text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect File</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PROFILE                                                            */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900">Your Citizen Profile</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              This information will be pre-filled automatically when you apply for government services.
            </p>

            {profileSaved && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City / District</label>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Residential Address</label>
                <textarea
                  rows={3}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* PhonePe / Manual UPI QR Payment & Resubmission Modal */}
      {(checkoutInvoice || activePayApp || resubmitTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg my-8">
            <button
              type="button"
              onClick={() => {
                setCheckoutInvoice(null);
                setActivePayApp(null);
                setResubmitTarget(null);
              }}
              className="absolute -top-3 -right-3 z-20 w-9 h-9 rounded-full bg-white shadow-lg text-slate-700 hover:text-slate-950 flex items-center justify-center border border-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <PhonePeQrPaymentCard
              amount={
                activePayApp ? (activePayApp.paymentAmount || 50) :
                checkoutInvoice ? checkoutInvoice.balanceDue :
                resubmitTarget ? resubmitTarget.amount : 50
              }
              orderId={
                activePayApp ? activePayApp.id :
                checkoutInvoice ? checkoutInvoice.invoiceNumber :
                resubmitTarget ? resubmitTarget.orderId : 'APPLY-365'
              }
              applicationId={activePayApp?.id || resubmitTarget?.applicationId}
              serviceName={
                activePayApp ? activePayApp.serviceTitle :
                checkoutInvoice ? checkoutInvoice.serviceName :
                resubmitTarget?.serviceName || 'Statutory Application'
              }
              customerName={currentUser?.name || 'Customer'}
              customerMobile={currentUser?.mobile || ''}
              customerEmail={currentUser?.email || ''}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      )}

      {/* Customer Receipt View Modal */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Official Payment Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Amount Paid</span>
              <div className="text-3xl font-black text-emerald-700">{formatINR(viewReceipt.amount)}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Payment Status: Verified & Settled</div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-[#104A96]">{viewReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{viewReceipt.serviceName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-900">{viewReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-slate-800">{viewReceipt.transactionReference || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-slate-800">{new Date(viewReceipt.paymentDate).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setViewReceipt(null)}
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
