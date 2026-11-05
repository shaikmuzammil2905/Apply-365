import React, { useState, useEffect } from 'react';
import { getWebsiteSettings, saveWebsiteSettings, getAllApplications } from '../../services/dataSyncService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { testSupabaseConnection, SUPABASE_URL } from '../../services/supabaseClient';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, uploadToCloudinary } from '../../services/cloudinaryService';
import { WebsiteSettings, BusinessHoursConfig, DayBusinessHours } from '../../types/admin';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Database, 
  CloudLightning, 
  Copy, 
  Check, 
  Lock, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink,
  UploadCloud,
  Image as ImageIcon,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  Trash2,
  Globe,
  CreditCard,
  Key,
  QrCode,
  Upload
} from 'lucide-react';
import { getPaymentSettings, savePaymentSettings, DEFAULT_PAYMENT_SETTINGS, PaymentSettings as UPIPaymentSettings } from '../../services/paymentService';

const DAYS_OF_WEEK: Array<{ key: keyof Omit<BusinessHoursConfig, 'timezone' | 'isTemporarilyClosed' | 'temporaryClosureReason' | 'specialHolidayNote'>; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const AdminSettingsPage: React.FC = () => {
  const { currentAdmin, updateAdminProfile } = useAdminAuth();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'branding' | 'payments' | 'business_hours' | 'contact' | 'backend'>('branding');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // UPI & PhonePe Payment Settings
  const [upiSettings, setUpiSettings] = useState<UPIPaymentSettings>(DEFAULT_PAYMENT_SETTINGS);

  // Logo upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadMsg, setLogoUploadMsg] = useState('');

  // Password Change
  const [adminFullName, setAdminFullName] = useState(currentAdmin?.fullName || 'Super Administrator');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Supabase Status
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Testing connection...');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Application payment statistics
  const [appStats, setAppStats] = useState({ totalPaid: 0, totalRevenue: 0, pendingCount: 0 });

  useEffect(() => {
    getWebsiteSettings().then(setSettings);
    getPaymentSettings().then(setUpiSettings);
    checkSupabase();
    loadAppStats();
  }, []);

  const loadAppStats = async () => {
    try {
      const apps = await getAllApplications();
      if (apps && Array.isArray(apps)) {
        const paid = apps.filter(a => a.paymentStatus === 'payment_completed' || (a.formData && a.formData._payment && a.formData._payment.status === 'payment_completed'));
        const revenue = paid.reduce((sum, a) => sum + Number(a.paymentAmount || 50), 0);
        setAppStats({
          totalPaid: paid.length,
          totalRevenue: revenue,
          pendingCount: Math.max(0, apps.length - paid.length)
        });
      }
    } catch (e) {
      console.warn('Load app stats note:', e);
    }
  };

  const checkSupabase = async () => {
    setIsTestingSupabase(true);
    const res = await testSupabaseConnection();
    setSupabaseStatus(res.message);
    setIsTestingSupabase(false);
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setSaveError('');
    try {
      await Promise.all([
        saveWebsiteSettings(settings),
        savePaymentSettings(upiSettings)
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setIsUploadingLogo(true);
    setLogoUploadMsg('Uploading logo to Cloudinary...');
    try {
      const res = await uploadToCloudinary(file, 'apply365_branding');
      if (res.success && res.url) {
        setSettings({ ...settings, logoUrl: res.url });
        setLogoUploadMsg('Logo uploaded successfully! Click "Save Changes" to publish across website.');
      } else {
        setLogoUploadMsg('Failed to process image file.');
      }
    } catch (err: any) {
      setLogoUploadMsg(`Upload failed: ${err.message || 'Network error'}`);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleResetLogo = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      logoUrl: '/apply365_transparent_logo.png'
    });
    setLogoUploadMsg('Logo reset to default transparent SVG/PNG asset.');
  };

  const handleDayHoursChange = (
    dayKey: keyof Omit<BusinessHoursConfig, 'timezone' | 'isTemporarilyClosed' | 'temporaryClosureReason' | 'specialHolidayNote'>,
    field: keyof DayBusinessHours,
    val: any
  ) => {
    if (!settings) return;
    const currentBh = settings.businessHours || {
      timezone: 'Asia/Kolkata',
      monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      saturday: { isOpen: true, openTime: '09:30', closeTime: '18:00' },
      sunday: { isOpen: false, openTime: '10:00', closeTime: '14:00' }
    };

    const updatedDay: DayBusinessHours = {
      ...(currentBh[dayKey] as DayBusinessHours),
      [field]: val
    };

    setSettings({
      ...settings,
      businessHours: {
        ...currentBh,
        [dayKey]: updatedDay
      }
    });
  };

  const handleApplyMonToFri = () => {
    if (!settings?.businessHours?.monday) return;
    const mon = settings.businessHours.monday;
    const currentBh = settings.businessHours;

    setSettings({
      ...settings,
      businessHours: {
        ...currentBh,
        tuesday: { ...mon },
        wednesday: { ...mon },
        thursday: { ...mon },
        friday: { ...mon }
      }
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, msg: 'Passwords do not match.' });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setPasswordStatus({ success: false, msg: 'Password must be at least 6 characters.' });
      return;
    }

    const res = await updateAdminProfile(adminFullName, newPassword || undefined);
    if (res.success) {
      setPasswordStatus({ success: true, msg: 'Super Admin credentials updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus(null), 4000);
    } else {
      setPasswordStatus({ success: false, msg: res.error || 'Failed to update credentials.' });
    }
  };

  const copySqlSchema = () => {
    const sqlScript = `-- APPLY365 SUPABASE COMPLETE MIGRATION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'super_admin',
    password_hash TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_settings',
    site_name TEXT DEFAULT 'Apply365 — Services for People',
    tagline TEXT,
    phone TEXT DEFAULT '+91 91219 92365',
    alternate_phone TEXT,
    customer_support_phone TEXT,
    whatsapp TEXT DEFAULT '+91 91219 92365',
    email TEXT DEFAULT 'contact@apply365.in',
    support_email TEXT,
    customer_service_email TEXT,
    address TEXT DEFAULT 'Plot 42, Hitech City Main Road, Madhapur, Hyderabad, Telangana - 500081',
    logo_url TEXT DEFAULT '/apply365_logo.png',
    seo_title TEXT DEFAULT 'Apply365 — Government & Business Services Facilitation',
    seo_description TEXT DEFAULT 'Apply365 provides fast assistance for government and business services.',
    social_links JSONB DEFAULT '{"facebook": "#", "twitter": "#"}'::JSONB,
    business_hours JSONB DEFAULT '{}'::JSONB,
    contact_visibility JSONB DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Anon all settings" ON public.website_settings FOR ALL USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!settings) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Apply365 settings...</div>;
  }

  const bh = settings.businessHours || {
    timezone: 'Asia/Kolkata',
    isTemporarilyClosed: false,
    temporaryClosureReason: '',
    specialHolidayNote: '',
    monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    saturday: { isOpen: true, openTime: '09:30', closeTime: '18:00' },
    sunday: { isOpen: false, openTime: '10:00', closeTime: '14:00' }
  };

  const cv = settings.contactVisibility || {
    showTaglineHeader: true,
    showTaglineFooter: true,
    showTaglinePortal: true,
    showTaglineInvoice: true,
    showCallButton: true,
    showWhatsAppButton: true,
    showAlternatePhone: true
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#104A96]" />
            <span>Website Branding & System Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage website logo, tagline, weekly business hours, contact numbers, and Supabase / Cloudinary integrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Synchronized Live!</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Synchronize'}</span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'branding'
              ? 'bg-[#104A96] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Website Branding & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-[#104A96] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>PhonePe & UPI Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('business_hours')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'business_hours'
              ? 'bg-[#104A96] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Business Hours & Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'contact'
              ? 'bg-[#104A96] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Contact Coordinates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backend')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'backend'
              ? 'bg-[#104A96] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backend & Security</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WEBSITE BRANDING & IDENTITY                                        */}
      {/* ========================================================================= */}
      {activeTab === 'branding' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Logo Management Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Website Logo Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload or replace your official logo. Supported formats: PNG, JPG, SVG, WebP with transparent background recommended.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Logo Preview Card */}
              <div className="md:col-span-5 bg-slate-50 rounded-2xl p-6 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Live Logo Preview</span>
                <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 max-w-[260px] flex items-center justify-center min-h-[90px]">
                  <img
                    src={settings.logoUrl || '/apply365_transparent_logo.png'}
                    alt="Current Logo"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <div className="mt-3 text-[11px] font-mono text-slate-500 truncate max-w-[240px]">
                  {settings.logoUrl}
                </div>
              </div>

              {/* Upload & Actions */}
              <div className="md:col-span-7 space-y-4">
                
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95">
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploadingLogo ? 'Uploading to Cloudinary...' : 'Upload New Logo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Reset to Default</span>
                  </button>
                </div>

                {logoUploadMsg && (
                  <div className="p-3 rounded-xl bg-blue-50 text-[#104A96] text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{logoUploadMsg}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">Automatic Synchronization:</span>
                  <p>When saved, this logo immediately updates across Desktop Header, Mobile Navigation, Customer Portal, Footer, and Invoice PDFs.</p>
                </div>

              </div>

            </div>
          </div>

          {/* Website Name & Tagline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Website Identity & Tagline</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Brand title and descriptive tagline displayed across public and administrative pages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website Brand Title *</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="e.g. Apply365 — Services for People"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Tagline</label>
                <input
                  type="text"
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="e.g. Fast, Secure & Verified Statutory Assistance Portal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>
            </div>

            {/* Tagline Visibility Toggles */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">Tagline Display Locations</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={cv.showTaglineHeader}
                    onChange={(e) => setSettings({
                      ...settings,
                      contactVisibility: { ...cv, showTaglineHeader: e.target.checked }
                    })}
                    className="rounded text-[#104A96]"
                  />
                  <span className="font-semibold text-slate-700">Desktop Header</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={cv.showTaglineFooter}
                    onChange={(e) => setSettings({
                      ...settings,
                      contactVisibility: { ...cv, showTaglineFooter: e.target.checked }
                    })}
                    className="rounded text-[#104A96]"
                  />
                  <span className="font-semibold text-slate-700">Website Footer</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={cv.showTaglinePortal}
                    onChange={(e) => setSettings({
                      ...settings,
                      contactVisibility: { ...cv, showTaglinePortal: e.target.checked }
                    })}
                    className="rounded text-[#104A96]"
                  />
                  <span className="font-semibold text-slate-700">Customer Portal</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={cv.showTaglineInvoice}
                    onChange={(e) => setSettings({
                      ...settings,
                      contactVisibility: { ...cv, showTaglineInvoice: e.target.checked }
                    })}
                    className="rounded text-[#104A96]"
                  />
                  <span className="font-semibold text-slate-700">Invoice PDF</span>
                </label>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: PHONEPE & MANUAL UPI PAYMENT CONFIGURATION                           */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Payment & Application Fee KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Fees Collected
              </span>
              <span className="text-2xl font-black text-[#104A96]">
                ₹{appStats.totalRevenue.toLocaleString('en-IN')}
              </span>
              <p className="text-[11px] text-slate-500 font-medium">From verified customer applications</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Paid Applications
              </span>
              <span className="text-2xl font-black text-emerald-600">
                {appStats.totalPaid}
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Successfully verified and unlocked</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Application Fee
              </span>
              <span className="text-2xl font-black text-amber-600">
                ₹{settings.applicationFee || 50}
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Mandatory fee before application</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Mandatory Payment Gate
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={`w-2 h-2 rounded-full ${settings.requirePaymentBeforeApply !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className={`text-base font-extrabold ${settings.requirePaymentBeforeApply !== false ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {settings.requirePaymentBeforeApply !== false ? 'Enforced' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">App form locked until paid</p>
            </div>
          </div>

          {/* APPLICATION FEE CONFIGURATION CARD */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#104A96]" />
                  <h3 className="text-base font-extrabold text-slate-900">Application Fee & Mandatory Payment Policy</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#104A96] text-[10px] font-bold uppercase tracking-wider">
                    Customer Facing
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Configure the mandatory facilitation fee customers must pay via PhonePe / UPI QR before unlocking and submitting applications.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#0c3c7d] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Fee Input & Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Mandatory Application Fee (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={settings.applicationFee ?? 50}
                    onChange={(e) => setSettings({
                      ...settings,
                      applicationFee: Math.max(0, Number(e.target.value))
                    })}
                    placeholder="50"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#104A96] text-slate-900 bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Default fee amount charged across all statutory services (Aadhaar, PAN, Voter ID, MSME, etc.)
                </p>

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Quick Preset Amounts:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[50, 60, 75, 100, 150, 200].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSettings({ ...settings, applicationFee: amt })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          (settings.applicationFee ?? 50) === amt
                            ? 'bg-[#104A96] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        ₹{amt} {amt === 50 ? '(Default)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mandatory Gate Switch */}
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Enforce Mandatory Payment Before Submission
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      When enabled, customer cannot view or submit the application form until ₹{settings.applicationFee || 50} payment proof is verified by Admin.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={settings.requirePaymentBeforeApply !== false}
                      onChange={(e) => setSettings({
                        ...settings,
                        requirePaymentBeforeApply: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#104A96]"></div>
                  </label>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Workflow Policy:</span>
                  </div>
                  <p>
                    {settings.requirePaymentBeforeApply !== false 
                      ? `Customers must complete ₹${settings.applicationFee || 50} payment. Verified transaction ID will be permanently tied to their application record and invoice.`
                      : 'Payment gate is deactivated. Customers can submit applications directly.'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* PHONEPE QR & UPI SETTINGS CARD */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#5f259f]" />
                  <h3 className="text-base font-extrabold text-slate-900">PhonePe & UPI QR Master Configuration</h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#5f259f] text-[10px] font-bold uppercase tracking-wider">
                    Official Active Gateway
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage PhonePe QR image asset, default UPI ID, beneficiary name, and direct settlements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#5f259f] hover:bg-[#4a1c7d] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save UPI Settings'}</span>
                </button>
              </div>
            </div>

            {/* UPI Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  UPI ID (VPA) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiSettings.upiId}
                    onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value.trim() })}
                    placeholder="9346801736@ybl"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#5f259f] text-slate-900 bg-white"
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-purple-50 text-[#5f259f]">
                    PhonePe YBL
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Initial UPI ID: 9346801736@ybl. Displayed to customers for instant copy & payment.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Beneficiary / Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={upiSettings.accountHolderName}
                  onChange={(e) => setUpiSettings({ ...upiSettings, accountHolderName: e.target.value })}
                  placeholder="KATIKAM JAYANTH"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5f259f] text-slate-900 bg-white"
                />
                <p className="text-[11px] text-slate-400">
                  Verified bank beneficiary name as printed on PhonePe QR code.
                </p>
              </div>

            </div>

            {/* QR Code Upload / Replace Section */}
            <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={upiSettings.qrCodeImageUrl}
                  alt="Current PhonePe QR"
                  className="w-28 h-28 object-contain rounded-xl border border-purple-200 bg-white p-2 shadow-sm"
                />

                <div className="space-y-2 text-center sm:text-left">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Active PhonePe QR Code</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Customers scan this image from any UPI app (PhonePe, Google Pay, Paytm, BHIM, Cred).
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-purple-300 hover:bg-purple-50 text-[#5f259f] text-xs font-bold shadow-2xs transition-all cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Replace QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setUpiSettings((prev: UPIPaymentSettings) => ({
                              ...prev,
                              qrCodeImageUrl: event.target?.result as string,
                              qrImageUrl: event.target?.result as string
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Gateway Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gateway Engine</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-800">Direct PhonePe UPI QR</span>
                </div>
                <p className="text-[10px] text-slate-500">Zero transaction gateway surcharges or third-party fees.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reconciliation</span>
                <div className="text-xs font-extrabold text-slate-800">12-Digit Bank UTR Proof</div>
                <p className="text-[10px] text-slate-500">Admin reviews bank credit & unlocks applications safely.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Supported Apps</span>
                <div className="text-xs font-extrabold text-slate-800">PhonePe, GPay, Paytm, BHIM</div>
                <p className="text-[10px] text-slate-500">All Indian bank UPI handles supported.</p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUSINESS HOURS & WORKING SCHEDULE                                  */}
      {/* ========================================================================= */}
      {activeTab === 'business_hours' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Weekly Operating Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure active working hours, weekend operations, and special holiday schedules.
                </p>
              </div>

              <button
                type="button"
                onClick={handleApplyMonToFri}
                className="px-3 py-1.5 rounded-xl border border-blue-200 text-[#104A96] hover:bg-blue-50 text-xs font-bold transition-colors self-start sm:self-auto"
              >
                Copy Monday Hours to Tue–Fri
              </button>
            </div>

            {/* Timezone & Temporary Closure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Zone</label>
                <select
                  value={bh.timezone || 'Asia/Kolkata'}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: { ...bh, timezone: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#104A96]"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (Indian Standard Time — GMT+5:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST — GMT+4:00)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Holiday / Weekend Notice Note</label>
                <input
                  type="text"
                  value={bh.specialHolidayNote || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: { ...bh, specialHolidayNote: e.target.value }
                  })}
                  placeholder="e.g. Closed on 15 August & Diwali. WhatsApp assistance open."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>
            </div>

            {/* Temporary Closure Banner Toggle */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bh.isTemporarilyClosed || false}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: { ...bh, isTemporarilyClosed: e.target.checked }
                  })}
                  className="rounded text-amber-600"
                />
                <span className="text-xs font-bold text-amber-900">
                  Mark Business as Temporarily Closed (Holiday / Maintenance)
                </span>
              </label>

              {bh.isTemporarilyClosed && (
                <input
                  type="text"
                  value={bh.temporaryClosureReason || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    businessHours: { ...bh, temporaryClosureReason: e.target.value }
                  })}
                  placeholder="Reason for temporary closure (e.g. Closed for Diwali Festival until Monday)"
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs bg-white focus:outline-none focus:border-amber-600"
                />
              )}
            </div>

            {/* Daily Schedule Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Monday to Sunday Hours Configuration
              </span>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const dayObj: DayBusinessHours = (bh as any)[key] || { isOpen: true, openTime: '09:00', closeTime: '19:00' };

                  return (
                    <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3 w-40">
                        <input
                          type="checkbox"
                          checked={dayObj.isOpen}
                          onChange={(e) => handleDayHoursChange(key, 'isOpen', e.target.checked)}
                          id={`check-${key}`}
                          className="rounded text-[#104A96]"
                        />
                        <label htmlFor={`check-${key}`} className="text-xs font-bold text-slate-800 cursor-pointer">
                          {label}
                        </label>
                      </div>

                      {dayObj.isOpen ? (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Opens:</span>
                            <input
                              type="time"
                              value={dayObj.openTime}
                              onChange={(e) => handleDayHoursChange(key, 'openTime', e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-[#104A96]"
                            />
                          </div>
                          <span className="text-slate-300">—</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Closes:</span>
                            <input
                              type="time"
                              value={dayObj.closeTime}
                              onChange={(e) => handleDayHoursChange(key, 'closeTime', e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-[#104A96]"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full self-start sm:self-auto">
                          Closed All Day
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONTACT COORDINATES & VISIBILITY                                   */}
      {/* ========================================================================= */}
      {activeTab === 'contact' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Public Contact Coordinates</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These numbers and emails appear across the main website, WhatsApp buttons, and contact forms.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Mobile / Dialing Number *
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 91219 92365"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alternate Mobile Number
                </label>
                <input
                  type="text"
                  value={settings.alternatePhone || ''}
                  onChange={(e) => setSettings({ ...settings, alternatePhone: e.target.value })}
                  placeholder="+91 98490 12365"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Business Helpline *
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="+91 91219 92365"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Support Hotline
                </label>
                <input
                  type="text"
                  value={settings.customerSupportPhone || ''}
                  onChange={(e) => setSettings({ ...settings, customerSupportPhone: e.target.value })}
                  placeholder="+91 91219 92365"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Official Email *
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="contact@apply365.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Support & Verification Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  placeholder="support@apply365.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Service / Helpdesk Email
                </label>
                <input
                  type="email"
                  value={settings.customerServiceEmail || ''}
                  onChange={(e) => setSettings({ ...settings, customerServiceEmail: e.target.value })}
                  placeholder="helpdesk@apply365.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Physical Business Address *
                </label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Plot 42, Hitech City Main Road, Madhapur, Hyderabad, Telangana - 500081"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

            </div>

            {/* Visibility Toggles */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                Action Button Visibility
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={cv.showCallButton}
                    onChange={(e) => setSettings({
                      ...settings,
                      contactVisibility: { ...cv, showCallButton: e.target.checked }
                    })}
                    className="rounded text-[#104A96]"
                  />
                  <span className="font-semibold text-slate-700">Show Header Call Button</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={cv.showWhatsAppButton}
                    onChange={(e) => setSettings({
                      ...settings,
                      contactVisibility: { ...cv, showWhatsAppButton: e.target.checked }
                    })}
                    className="rounded text-[#104A96]"
                  />
                  <span className="font-semibold text-slate-700">Show Floating WhatsApp Button</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={cv.showAlternatePhone}
                    onChange={(e) => setSettings({
                      ...settings,
                      contactVisibility: { ...cv, showAlternatePhone: e.target.checked }
                    })}
                    className="rounded text-[#104A96]"
                  />
                  <span className="font-semibold text-slate-700">Display Alternate Phone in Footer</span>
                </label>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BACKEND & SECURITY                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'backend' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Backend Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Supabase Status Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Supabase PostgreSQL</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{SUPABASE_URL}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={checkSupabase}
                  disabled={isTestingSupabase}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Test Supabase Connection"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status:</span>
                <p className="text-slate-700 font-medium">{supabaseStatus}</p>
              </div>

              <button
                type="button"
                onClick={copySqlSchema}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Schema Copied to Clipboard!' : 'Copy Supabase SQL Schema'}</span>
              </button>
            </div>

            {/* Cloudinary Status Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#104A96] flex items-center justify-center">
                  <CloudLightning className="w-5 h-5 text-[#FF8500]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Cloudinary Media CDN</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Cloud: {CLOUDINARY_CLOUD_NAME}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Cloud Name:</span>
                  <span className="font-bold text-slate-800 font-mono">{CLOUDINARY_CLOUD_NAME}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Upload Preset:</span>
                  <span className="font-bold text-slate-800 font-mono">{CLOUDINARY_UPLOAD_PRESET}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Upload Mode:</span>
                  <span className="font-bold text-emerald-600">Active (Direct CDN + Safe Fallback)</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed">
                Logos, customer documents and course banners stream via Cloudinary endpoint with persistent fail-safe recovery.
              </p>
            </div>

          </div>

          {/* Admin Profile & Password Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Super Administrator Credentials</h3>
                <p className="text-xs text-slate-500">Update master admin display name or password.</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#FF8500]" />
            </div>

            {passwordStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                passwordStatus.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {passwordStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordStatus.msg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Display Name</label>
                <input
                  type="text"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#104A96]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Update Master Admin Profile
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
};
