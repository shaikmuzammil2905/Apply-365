import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerApplications } from '../../services/dbService';
import { CustomerApplication, ApplicationDocument } from '../../types/application';
import { DocumentPreviewModal } from '../../components/DocumentPreviewModal';
import { 
  User, 
  Fingerprint, 
  CreditCard, 
  Vote, 
  Building2, 
  FileCheck2, 
  Landmark, 
  HeartHandshake,
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
  Check
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { currentUser, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'documents' | 'profile'>('overview');
  const [applications, setApplications] = useState<CustomerApplication[]>([]);
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

  // Load applications scoped strictly to this customer
  const loadApps = async () => {
    if (!currentUser) return;
    setLoadingApps(true);
    try {
      const data = await getCustomerApplications(currentUser.id);
      setApplications(data);
    } catch (e) {
      console.error('Failed to load customer applications:', e);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadApps();
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

  // Compile all uploaded documents across applications
  const allDocuments: { doc: ApplicationDocument; appId: string; appTitle: string }[] = [];
  applications.forEach((app) => {
    app.documents.forEach((d) => {
      if (d.status === 'uploaded') {
        allDocuments.push({
          doc: d,
          appId: app.id,
          appTitle: app.serviceTitle,
        });
      }
    });
  });

  const underReviewCount = applications.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length;
  const completedCount = applications.filter((a) => a.status === 'Completed').length;
  const draftCount = applications.filter((a) => a.status === 'Draft').length;

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFBFD]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. WELCOME CUSTOMER HEADER                                                */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#104A96] to-[#07366F] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              {currentUser?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold tracking-wide uppercase mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#104A96]" />
                <span>Verified Customer Session</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {currentUser?.name}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                <span>Mobile: <strong className="text-slate-800">{currentUser?.mobile}</strong></span>
                <span>•</span>
                <span>Email: <strong className="text-slate-800">{currentUser?.email}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/apply/aadhaar"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Apply for Aadhaar</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-colors border border-slate-200"
              title="Logout from customer portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. STATS & APPLICATION STATUS OVERVIEW                                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{applications.length}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Active on your account</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs bg-blue-50/20">
            <span className="text-xs font-bold text-[#104A96] uppercase tracking-wider">Under Review</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#104A96] mt-1">{underReviewCount}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Verification in progress</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs bg-emerald-50/20">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Completed</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{completedCount}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Processed & delivered</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs bg-amber-50/20">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Drafts</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">{draftCount}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Saved to complete later</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 sm:space-x-4">
          {[
            { id: 'overview', label: 'Available Services' },
            { id: 'applications', label: `My Applications (${applications.length})` },
            { id: 'documents', label: `My Documents (${allDocuments.length})` },
            { id: 'profile', label: 'My Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[#104A96] text-[#104A96]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AVAILABLE SERVICES (PHASE 2 & 3)                                   */}
        {/* Clicking Aadhaar directly opens the Aadhaar application form!             */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply for Documentation Services</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Select Aadhaar Card to start your direct assisted application immediately without unnecessary redirect screens.
                </p>
              </div>
            </div>

            {/* Featured Aadhaar Direct Application Card */}
            <div className="bg-gradient-to-r from-blue-900 via-[#104A96] to-sky-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl space-y-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-blue-100 text-xs font-bold uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF8500]" />
                  <span>High Priority Service</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Aadhaar Card Service Application
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
                  Direct assisted online application for Aadhaar Address Update, Name Correction, DOB Update, and Seva Kendra Appointment bookings.
                </p>
                <div className="pt-2">
                  <Link
                    to="/apply/aadhaar"
                    className="inline-flex items-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all group"
                  >
                    <span>Start Aadhaar Application Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Other Available Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'PAN Card', slug: 'pan-card', desc: 'New PAN enrolment, photo/signature & correction', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { title: 'Voter ID Card', slug: 'voter-id', desc: 'Form 6 new enrolment & EPIC shifting', icon: Vote, color: 'text-sky-600', bg: 'bg-sky-50' },
                { title: 'MSME / Udyam', slug: 'msme', desc: 'Business MSME registration certificate', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
                { title: 'Labour License', slug: 'labour-license', desc: 'Shops & commercial establishment license', icon: FileCheck2, color: 'text-orange-600', bg: 'bg-orange-50' },
                { title: 'UAN / PF Services', slug: 'uan-pf', desc: 'KYC update, member transfer & claim assistance', icon: Landmark, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                { title: 'ESI Details Update', slug: 'esi', desc: 'IP medical card & family member additions', icon: HeartHandshake, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((serv, idx) => {
                const IconComp = serv.icon;
                return (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${serv.bg} ${serv.color}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Portal</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">{serv.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{serv.desc}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <Link
                        to={`/apply/${serv.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <span>Apply Directly</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={`/services/${serv.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="View Official Guidelines"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY APPLICATIONS (PHASE 2 & 6)                                      */}
        {/* ========================================================================= */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Submitted Applications</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Track status, inspect submitted details, view uploaded proofs, or continue saved drafts.
                </p>
              </div>

              <Link
                to="/apply/aadhaar"
                className="inline-flex items-center gap-2 bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Aadhaar Application</span>
              </Link>
            </div>

            {loadingApps ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-8 h-8 border-3 border-[#104A96] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Retrieving customer applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-800">No Applications Filed Yet</h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    You haven't initiated any applications under your customer account yet. Apply for Aadhaar Card assistance to get started.
                  </p>
                </div>
                <Link
                  to="/apply/aadhaar"
                  className="inline-flex items-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md transition-all"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Start First Application</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-slate-900">{app.serviceTitle}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            app.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'Under Review' ? 'bg-amber-100 text-amber-800' :
                            app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-2">
                          <span>App ID: <strong className="font-mono text-slate-800">{app.id}</strong></span>
                          <span>•</span>
                          <span>Submitted: {app.submissionDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F1F7FF] text-[#104A96] hover:bg-blue-100 font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Details & Status</span>
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                      <div>Applicant: <strong className="text-slate-800 block truncate">{app.customerName}</strong></div>
                      <div>Request: <strong className="text-slate-800 block truncate capitalize">{app.formData.serviceType?.replace('-', ' ') || 'Update'}</strong></div>
                      <div>Uploaded Proofs: <strong className="text-emerald-700 block">{app.documents.filter(d => d.status === 'uploaded').length} files</strong></div>
                      <div>Mobile: <strong className="text-slate-800 block">{app.customerMobile}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MY DOCUMENTS (PHASE 2 & 4)                                         */}
        {/* ========================================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Uploaded Document Library</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Documents attached across your applications. Click preview to inspect files securely.
                </p>
              </div>
            </div>

            {allDocuments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Documents Uploaded Yet</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  When you submit applications and upload Aadhaar scans, electricity bills, or passports, they will appear here.
                </p>
                <Link
                  to="/apply/aadhaar"
                  className="inline-flex items-center gap-2 bg-[#104A96] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs"
                >
                  <span>Upload Documents for Aadhaar</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allDocuments.map(({ doc, appId, appTitle }, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Verified Upload
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{appId}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-slate-500 truncate">File: {doc.fileName || 'Attached'} ({doc.fileSize})</p>
                      <p className="text-[11px] text-slate-400">Attached to: {appTitle}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F7FF] text-[#104A96] hover:bg-blue-100 font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Document</span>
                      </button>

                      {doc.uploadedAt && (
                        <span className="text-[11px] text-slate-400">{doc.uploadedAt}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MY PROFILE (PHASE 2)                                               */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 max-w-2xl space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Customer Profile Settings</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your contact coordinates used for official document filings.
              </p>
            </div>

            {profileSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile information saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={profileMobile}
                      onChange={(e) => setProfileMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  City / Town
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="Street, area, landmarks..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-[#104A96]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Changes apply to future applications</span>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileLoading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>

          </div>
        )}

      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

    </div>
  );
};

