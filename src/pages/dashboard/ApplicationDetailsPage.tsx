import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApplicationById } from '../../services/dbService';
import { getApplicationStatusHistory, getCustomerInvoices } from '../../services/dataSyncService';
import { CustomerApplication, ApplicationDocument, ApplicationStatusHistoryItem } from '../../types/application';
import { CustomerInvoice } from '../../types/invoices';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { generateApplicationSummaryPDF, generateInvoicePDF, formatINR } from '../../utils/pdfGenerator';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Copy, 
  ShieldCheck, 
  Fingerprint, 
  Phone, 
  Mail, 
  MapPin,
  ExternalLink,
  ChevronRight,
  Download,
  Receipt,
  History,
  Calendar,
  Sparkles,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const STANDARD_STAGES = [
  { key: 'application_received', label: '1. Application Received' },
  { key: 'under_review', label: '2. Document Verification' },
  { key: 'processing', label: '3. Statutory Processing' },
  { key: 'submitted_to_authority', label: '4. Authority Submission' },
  { key: 'completed', label: '5. Completed & Dispatched' }
];

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState<CustomerApplication | null>(null);
  const [history, setHistory] = useState<ApplicationStatusHistoryItem[]>([]);
  const [linkedInvoice, setLinkedInvoice] = useState<CustomerInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id || !currentUser) return;
      setLoading(true);
      try {
        const app = await getApplicationById(id, currentUser.id);
        setApplication(app);

        if (app) {
          const [hist, invoices] = await Promise.all([
            getApplicationStatusHistory(app.id),
            getCustomerInvoices(currentUser.id)
          ]);
          setHistory(hist);
          const foundInv = invoices.find(inv => inv.applicationId === app.id);
          setLinkedInvoice(foundInv || null);
        }
      } catch (e) {
        console.error('Error fetching application:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id, currentUser]);

  const copyAppId = () => {
    if (!application) return;
    navigator.clipboard.writeText(application.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!application) return;
    const doc = generateApplicationSummaryPDF(application);
    doc.save(`Apply365-${application.id}.pdf`);
  };

  const handleDownloadInvoice = () => {
    if (!linkedInvoice) return;
    const doc = generateInvoicePDF(linkedInvoice);
    doc.save(`${linkedInvoice.invoiceNumber}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFBFD]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#104A96] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading application status & timeline...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-[60vh] py-16 px-4 max-w-lg mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Application Not Found</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          This application record does not exist or does not belong to your authenticated customer account.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#104A96] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const currentStatusRaw = String(application.status || 'application_received').toLowerCase();
  const isRejected = currentStatusRaw === 'rejected';
  const isCancelled = currentStatusRaw === 'cancelled';
  const isOnHold = currentStatusRaw === 'on_hold';

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFBFD]">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#104A96] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customer Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            {linkedInvoice && (
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#104A96] text-xs font-bold transition-colors border border-blue-200"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Invoice: {linkedInvoice.invoiceNumber}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Soft Copy (PDF)</span>
            </button>
          </div>
        </div>

        {/* Application Status Banner */}
        <div className="bg-gradient-to-r from-[#104A96] to-[#07366F] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wide">
              <Fingerprint className="w-3.5 h-3.5 text-[#FF8500]" />
              <span>{application.serviceTitle}</span>
            </div>

            <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider text-[#FF8500]">
              {application.id}
            </div>

            <p className="text-xs sm:text-sm text-blue-100">
              Submitted on <strong className="text-white">{new Date(application.createdAt || application.submissionDate || Date.now()).toLocaleDateString()}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={copyAppId}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedId ? 'Copied!' : 'Copy Application ID'}</span>
            </button>

            <div className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm ${
              isRejected
                ? 'bg-red-500 text-white'
                : isCancelled
                  ? 'bg-slate-700 text-white'
                  : isOnHold
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-emerald-400 text-slate-900'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Status: {String(application.status).replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* STATUS ALERT BANNER (If rejected, on hold, or cancelled) */}
        {isRejected && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-red-900">Application Not Accepted by Authority</h4>
              <p className="mt-1 text-red-700">
                Your application could not be processed due to regulatory document criteria. Please review our admin notes below or contact citizen support for re-submission assistance.
              </p>
            </div>
          </div>
        )}

        {isOnHold && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">Application Temporarily On Hold</h4>
              <p className="mt-1 text-amber-800">
                Additional supporting documents or citizen clarification is required. Please check your messages below.
              </p>
            </div>
          </div>
        )}

        {/* APPLICATION STATUS TIMELINE */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#104A96]" />
              <span>Application Processing Lifecycle Timeline</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Updated: {new Date(application.updatedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          {/* Standard 5-Stage Visual Progress Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
            {STANDARD_STAGES.map((st, index) => {
              const isPastOrCurrent = 
                currentStatusRaw === 'completed' ||
                (currentStatusRaw === 'submitted_to_authority' && index <= 3) ||
                (currentStatusRaw === 'processing' && index <= 2) ||
                (currentStatusRaw === 'documents_verified' && index <= 1) ||
                (currentStatusRaw === 'under_review' && index <= 1) ||
                (index === 0);

              const isCurrent = 
                (currentStatusRaw === 'completed' && index === 4) ||
                (currentStatusRaw === 'submitted_to_authority' && index === 3) ||
                (currentStatusRaw === 'processing' && index === 2) ||
                ((currentStatusRaw === 'under_review' || currentStatusRaw === 'documents_verified') && index === 1) ||
                ((currentStatusRaw === 'application_received' || currentStatusRaw === 'submitted') && index === 0);

              return (
                <div
                  key={st.key}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-300 text-[#104A96] ring-2 ring-[#104A96]/20'
                      : isPastOrCurrent
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[11px] leading-tight">{st.label}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isPastOrCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isPastOrCurrent ? '✓' : index + 1}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isCurrent ? 'Current Active Stage' : isPastOrCurrent ? 'Stage Completed' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* History Event Feed */}
          {history.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <h5 className="text-xs font-bold text-slate-700">Official Status Updates & Remarks:</h5>
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#104A96] uppercase tracking-wide">
                        {h.newStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {h.customerMessage && (
                      <p className="text-slate-800 font-medium mt-1 leading-relaxed">
                        {h.customerMessage}
                      </p>
                    )}
                    {h.expectedCompletionDate && (
                      <p className="text-[11px] text-indigo-700 font-semibold mt-1">
                        Expected Completion: {h.expectedCompletionDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submitted Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Customer & Personal Details */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Submitted Applicant Details</span>
              <span className="text-emerald-700 font-bold">Verified Citizen Profile</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Applicant Full Name:</span>
                <span className="font-bold text-slate-900">{application.formData?.fullName || application.customerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Service Request:</span>
                <span className="font-bold text-slate-900 capitalize">{application.formData?.serviceType?.replace('-', ' ') || application.serviceType || 'Standard'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Contact Mobile:</span>
                <span className="font-bold text-slate-900">{application.customerMobile}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-bold text-slate-900">{application.customerEmail || 'N/A'}</span>
              </div>
              {application.formData?.city && (
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Location / City:</span>
                  <span className="font-bold text-slate-900">{application.formData.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attached Supporting Documents */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Submitted Documents Checklist</span>
              <span className="text-slate-500 font-medium">({application.documents.length} Items)</span>
            </h4>

            <div className="space-y-2.5">
              {application.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                    <span className={`text-[10px] font-semibold ${doc.fileUrl ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {doc.fileUrl ? '✓ Uploaded & Attached' : 'Awaiting Attachment'}
                    </span>
                  </div>

                  {doc.fileUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#104A96] text-[11px] font-bold shadow-2xs shrink-0 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

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
