import React, { useState, useEffect } from 'react';
import { getWebsiteSettings, saveWebsiteSettings } from '../../services/dataSyncService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { testSupabaseConnection, SUPABASE_URL } from '../../services/supabaseClient';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../services/cloudinaryService';
import { WebsiteSettings } from '../../types/admin';
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
  ExternalLink
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { currentAdmin, updateAdminProfile } = useAdminAuth();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password Change
  const [adminFullName, setAdminFullName] = useState(currentAdmin?.fullName || 'Super Administrator');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Supabase Status
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Testing connection...');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    getWebsiteSettings().then(setSettings);
    checkSupabase();
  }, []);

  const checkSupabase = async () => {
    setIsTestingSupabase(true);
    const res = await testSupabaseConnection();
    setSupabaseStatus(res.message);
    setIsTestingSupabase(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      await saveWebsiteSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
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
    const sqlScript = `-- APPLY365 SUPABASE SCHEMA
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tcbozysbacuoaewzoviq/sql
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

CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration TEXT NOT NULL,
    price TEXT DEFAULT 'Contact for Fee',
    features JSONB DEFAULT '[]'::JSONB,
    eligibility TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    accent_color TEXT DEFAULT '#104A96',
    badge TEXT DEFAULT 'Popular Service',
    icon_name TEXT DEFAULT 'FileText',
    documents JSONB DEFAULT '[]'::JSONB,
    benefits JSONB DEFAULT '[]'::JSONB,
    process_steps JSONB DEFAULT '[]'::JSONB,
    faqs JSONB DEFAULT '[]'::JSONB,
    is_published BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    lead_type TEXT NOT NULL,
    target_id TEXT,
    target_title TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    attachments JSONB DEFAULT '[]'::JSONB,
    admin_notes TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_email TEXT,
    service_slug TEXT NOT NULL,
    service_title TEXT NOT NULL,
    service_type TEXT,
    form_data JSONB DEFAULT '{}'::JSONB,
    documents JSONB DEFAULT '[]'::JSONB,
    status TEXT DEFAULT 'submitted',
    priority TEXT DEFAULT 'standard',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_content (
    section_key TEXT PRIMARY KEY,
    content_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_settings',
    site_name TEXT DEFAULT 'Apply365 — Services for People',
    phone TEXT DEFAULT '+91 91219 92365',
    whatsapp TEXT DEFAULT '+91 91219 92365',
    email TEXT DEFAULT 'contact@apply365.in',
    address TEXT DEFAULT 'Hyderabad, Telangana, India',
    logo_url TEXT DEFAULT '/apply365_logo.png',
    seo_title TEXT DEFAULT 'Apply365 — Government & Business Services Facilitation',
    seo_description TEXT DEFAULT 'Apply365 provides fast assistance for government and business services.',
    social_links JSONB DEFAULT '{"facebook": "#", "twitter": "#"}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    url TEXT NOT NULL,
    public_id TEXT,
    format TEXT,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read content" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Public insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert apps" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon all courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon all services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon all leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon all apps" ON public.applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon all content" ON public.website_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon all settings" ON public.website_settings FOR ALL USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!settings) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#104A96]" />
            <span>System Settings & Backend Integrations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure contact coordinates, Supabase PostgreSQL, Cloudinary media and administrative credentials.
          </p>
        </div>
      </div>

      {/* Backend Integration Cards */}
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
              <span className="font-bold text-emerald-600">Active (Auto Cloudinary + Backup)</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            Customer documents and course imagery upload directly via Cloudinary endpoint with persistent fallback.
          </p>
        </div>

      </div>

      {/* Website Contact & General Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Public Contact & Identity Coordinates
            </h3>
            <p className="text-xs text-slate-500">
              Synchronizes with website header, floating WhatsApp button, callback modal and footer.
            </p>
          </div>
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Official Phone Number</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Official WhatsApp Number</label>
            <input
              type="text"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Support Email Address</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Office Physical Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#104A96] hover:bg-[#07366F] text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save Coordinates'}</span>
          </button>
        </div>
      </form>

      {/* Super Admin Security Form */}
      <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF8500]" />
            <span>Super Administrator Security Credentials</span>
          </h3>
          <p className="text-xs text-slate-500">
            Current administrator email: <span className="font-bold text-slate-700">{currentAdmin?.email || 'admin@apply365.in'}</span>
          </p>
        </div>

        {passwordStatus && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            passwordStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{passwordStatus.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Administrator Full Name</label>
            <input
              type="text"
              value={adminFullName}
              onChange={(e) => setAdminFullName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">New Password (optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep unchanged"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Update Super Admin Credentials</span>
          </button>
        </div>
      </form>

    </div>
  );
};
