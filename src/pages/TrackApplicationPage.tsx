import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllApplications } from '../services/dataSyncService';
import { CustomerApplication } from '../types/application';
import { generateApplicationSummaryPDF, formatPDFDate } from '../utils/pdfGenerator';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  ArrowRight, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Phone, 
  ShieldCheck, 
  Printer, 
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

const TRACKING_STAGES = [
  { key: 'application_received', label: 'Application Received', desc: 'Filing request recorded in system' },
  { key: 'under_review', label: 'Document Review', desc: 'Pre-verification of attached proofs' },
  { key: 'documents_verified', label: 'Documents Verified', desc: 'All requirements verified by team' },
  { key: 'processing', label: 'Statutory Processing', desc: 'Preparation & portal submission' },
  { key: 'completed', label: 'Completed & Dispatched', desc: 'Official soft copy delivered' },
];

export const TrackApplicationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<CustomerApplication | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userApps, setUserApps] = useState<CustomerApplication[]>([]);

  // Load all applications to match against search query
  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchInput).trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setSearched(true);
    try {
      const all = await getAllApplications();
      const match = all.find(a => 
        a.id.toLowerCase() === q ||
        a.id.toLowerCase().replace(/[^a-z0-9]/g, '') === q.replace(/[^a-z0-9]/g, '') ||
        (a.customerMobile && a.customerMobile.includes(q))
      );

      setApplication(match || null);
      if (match) {
        setSearchParams({ id: match.id });
      }
    } catch (err) {
      console.error('Tracking query failed:', err);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  // If URL has id parameter on load, search immediately
  useEffect(() => {
    const initialId = searchParams.get('id');
    if (initialId) {
      setSearchInput(initialId);
      handleSearch(initialId);
    }

    // If logged in, fetch user's applications for quick selection
    if (currentUser) {
      getAllApplications().then(apps => {
        const myApps = apps.filter(a => 
          a.customerId === currentUser.id || 
          a.customerMobile === currentUser.mobile || 
          (currentUser.email && a.customerEmail === currentUser.email)
        );
        setUserApps(myApps);
      });
    }
  }, [searchParams, currentUser]);

  const copyId = () => {
    if (!application) return;
    navigator.clipboard.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!application) return;
    const doc = generateApplicationSummaryPDF(application);
    doc.save(`Apply365-${application.id}-SoftCopy.pdf`);
  };

  // Determine stage progress index
  const getStageIndex = (status: string) => {
    const s = (status || '').toLowerCase().replace(/ /g, '_');
    if (s.includes('complete') || s.includes('approved')) return 5;
    if (s.includes('process') || s.includes('submit')) return 3;
    if (s.includes('verified') || s.includes('ready')) return 2;
    if (s.includes('review')) return 1;
    return 0;
  };

  const currentStageIdx = application ? getStageIndex(application.status) : 0;

  return (
    <div className="bg-[#FAFBFD] min-h-screen pb-24">
      
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200/80 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold uppercase tracking-wider border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8500]" />
            <span>Official Citizen Status Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Application Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Check real-time statutory review progress, verify documents status, and download your official application soft copy.
          </p>

          {/* Search Form Card */}
          <div className="pt-4 max-w-xl mx-auto">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl border-2 border-[#104A96]/30 shadow-md focus-within:border-[#104A96] transition-colors"
            >
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Enter Application ID (e.g. APP365-AAD-384735) or Phone"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none bg-transparent font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-[#104A96] hover:bg-[#07366F] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Track Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick chips for logged in users */}
          {userApps.length > 0 && (
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Your Recent Applications:</span>
              {userApps.slice(0, 3).map(app => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => {
                    setSearchInput(app.id);
                    handleSearch(app.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-[#104A96] text-xs font-mono font-bold transition-colors border border-slate-200"
                >
                  {app.id} ({app.serviceTitle.split(' ')[0]})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#104A96]/30 border-t-[#104A96] rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Retrieving official filing record...</p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && searched && !application && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No Application Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We couldn't locate any application matching &ldquo;{searchInput}&rdquo;. Please verify the Application ID or mobile number and search again.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#104A96] text-white text-xs font-bold hover:bg-[#07366F] transition-all"
              >
                <span>Browse Services to Apply</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Application Details Card */}
        {!loading && application && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-[#104A96] bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                      {application.id}
                    </span>
                    <button
                      type="button"
                      onClick={copyId}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Copy ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {application.serviceTitle}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Applicant: <strong className="text-slate-800">{application.customerName}</strong> &bull; Mobile: {application.customerMobile}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {String(application.status).toUpperCase().replace(/_/g, ' ')}
                  </span>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Filing Date: {formatPDFDate(application.createdAt || application.submissionDate)}</span>
                  </div>
                  {application.expectedCompletionDate && (
                    <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Target: {formatPDFDate(application.expectedCompletionDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-step Visual Tracker */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#104A96]" />
                  <span>Real-Time Filing Progression</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {TRACKING_STAGES.map((stage, idx) => {
                    const isDone = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div 
                        key={stage.key}
                        className={`p-3 rounded-2xl border transition-all ${
                          isDone 
                            ? 'bg-blue-50/70 border-blue-200' 
                            : 'bg-slate-50/50 border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone ? 'bg-[#104A96] text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span className={`text-xs font-bold ${isDone ? 'text-[#104A96]' : 'text-slate-500'}`}>
                            {stage.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {stage.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official Soft Copy (PDF)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Slip</span>
                  </button>

                  {currentUser ? (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                    >
                      <span>Customer Dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                    >
                      <span>Sign In to Dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>

            </div>

            {/* Checklist of attached documents */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verification Checklist & Attached Proofs</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {application.documents.map((doc, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{doc.name}</div>
                      <span className={`text-[10px] font-semibold ${doc.fileUrl ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {doc.fileUrl ? '✓ Verified & Attached' : 'Pending Upload'}
                      </span>
                    </div>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-[#104A96] hover:bg-blue-50"
                      >
                        Preview
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

