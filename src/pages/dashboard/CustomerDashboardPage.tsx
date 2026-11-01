import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerApplications } from '../../services/dbService';
import { getCustomerInvoices, getCustomerNotifications, markNotificationAsRead } from '../../services/dataSyncService';
import { CustomerApplication, ApplicationDocument, CustomerNotification } from '../../types/application';
import { CustomerInvoice } from '../../types/invoices';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { generateInvoicePDF, generateApplicationSummaryPDF, formatINR } from '../../utils/pdfGenerator';
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
  Send,
  HelpCircle,
  Copy
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { currentUser, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'invoices' | 'documents' | 'profile'>('overview');
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

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
      const [appsData, invsData, notifsData] = await Promise.all([
        getCustomerApplications(currentUser.id),
        getCustomerInvoices(currentUser.id),
        getCustomerNotifications(currentUser.id)
      ]);
      setApplications(appsData);
      setInvoices(invsData);
      setNotifications(notifsData);
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
                            {linkedInv && (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                linkedInv.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                Payment: {linkedInv.paymentStatus.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mt-2">{app.serviceTitle}</h4>
                          <p className="text-xs text-slate-500">
                            Filing submitted on {new Date(app.createdAt || app.submissionDate || Date.now()).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {linkedInv && (
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoicePDF(linkedInv)}
                              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#104A96] text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Invoice PDF</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDownloadAppPDF(app)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
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
                        <div>Request Type: <strong className="text-slate-800 block truncate capitalize">{app.formData?.serviceType?.replace('-', ' ') || 'Standard'}</strong></div>
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

                      <div className="flex items-center gap-2">
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

    </div>
  );
};
