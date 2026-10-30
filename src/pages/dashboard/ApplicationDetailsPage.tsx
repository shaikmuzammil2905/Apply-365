import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApplicationById } from '../../services/dbService';
import { CustomerApplication, ApplicationDocument } from '../../types/application';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
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
  ChevronRight
} from 'lucide-react';

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState<CustomerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id || !currentUser) return;
      setLoading(true);
      try {
        // Enforces customerId isolation strictly
        const app = await getApplicationById(id, currentUser.id);
        setApplication(app);
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFBFD]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#104A96] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading application status...</p>
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
          This application record does not exist or does not belong to your customer account.
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

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFBFD]">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#104A96]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customer Dashboard</span>
          </Link>

          <span className="text-xs text-slate-400">Customer View</span>
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
              Submitted on <strong className="text-white">{application.submissionDate}</strong>
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

            <div className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm">
              <Clock className="w-4 h-4" />
              <span>Status: {application.status}</span>
            </div>
          </div>
        </div>

        {/* Application Timeline Status Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Processing Lifecycle
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold">1. Application Submitted</div>
                <div className="text-[11px] text-emerald-700">{application.submissionDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#104A96]">
              <div className="w-7 h-7 rounded-full bg-[#104A96] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <div className="text-xs font-bold">2. Document Under Review</div>
                <div className="text-[11px] text-blue-700">Checking validity & UIDAI criteria</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <div className="text-xs font-bold">3. Portal Filing / Completion</div>
                <div className="text-[11px] text-slate-500">Official acknowledgment / URN</div>
              </div>
            </div>
          </div>
        </div>

        {/* Submitted Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Customer & Personal Details */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Submitted Applicant Details</span>
              <span className="text-emerald-700 font-bold">Verified Customer</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Applicant Full Name:</span>
                <span className="font-bold text-slate-900">{application.formData.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Service Sub-Type:</span>
                <span className="font-bold text-slate-900 capitalize">{application.formData.serviceType.replace('-', ' ')}</span>
              </div>
              {application.formData.aadhaarNumber && (
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Aadhaar Number:</span>
                  <span className="font-mono font-bold text-slate-900">
                    XXXX XXXX {application.formData.aadhaarNumber.slice(-4)}
                  </span>
                </div>
              )}
              {application.formData.dob && (
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Date of Birth:</span>
                  <span className="font-bold text-slate-900">{application.formData.dob}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Gender:</span>
                <span className="font-bold text-slate-900">{application.formData.gender || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Primary Mobile:</span>
                <span className="font-bold text-slate-900">{application.formData.mobile}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Mobile OTP Capability:</span>
                <span className="font-bold text-emerald-700">{application.formData.isMobileLinked ? 'Linked & Active' : 'Not Linked'}</span>
              </div>
              {application.formData.city && (
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Residential City / PIN:</span>
                  <span className="font-bold text-slate-900">{application.formData.city} {application.formData.pincode ? `(${application.formData.pincode})` : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#104A96] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Attached Proofs & Files</span>
              <span className="text-slate-500 font-bold">{application.documents.filter(d => d.status === 'uploaded').length} Uploaded</span>
            </h4>

            <div className="space-y-3">
              {application.documents.map((doc) => {
                const isUploaded = doc.status === 'uploaded';
                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className={`w-4 h-4 shrink-0 ${isUploaded ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{doc.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {isUploaded ? (doc.fileName || 'Attached') : 'Pending upload'}
                        </div>
                      </div>
                    </div>

                    {isUploaded ? (
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-[#F1F7FF] text-[#104A96] hover:bg-blue-100 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 shrink-0">Not Attached</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Specific Request Box */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Specific Instructions & Customer Message
          </h4>
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-800 space-y-1">
            <div className="font-bold text-[#104A96]">Requested Action:</div>
            <p className="leading-relaxed font-medium">{application.formData.specificRequest}</p>
          </div>

          {application.formData.customerRemarks && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">Additional Remarks:</div>
              <p className="leading-relaxed">{application.formData.customerRemarks}</p>
            </div>
          )}
        </div>

      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

    </div>
  );
};
