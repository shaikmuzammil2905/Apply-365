-- =========================================================================
-- APPLY365 PRODUCTION DATABASE SCHEMA FOR SUPABASE
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/tcbozysbacuoaewzoviq/sql)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'editor', 'moderator')),
    password_hash TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSE CATEGORIES
CREATE TABLE IF NOT EXISTS public.course_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSES TABLE
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

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    accent_color TEXT DEFAULT '#104A96',
    badge TEXT DEFAULT 'Popular Service',
    icon_name TEXT DEFAULT 'FileText',
    official_disclaimer TEXT,
    documents JSONB DEFAULT '[]'::JSONB,
    benefits JSONB DEFAULT '[]'::JSONB,
    process_steps JSONB DEFAULT '[]'::JSONB,
    faqs JSONB DEFAULT '[]'::JSONB,
    is_published BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS official_disclaimer TEXT;

-- 5. LEADS AND ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    lead_type TEXT NOT NULL, -- 'course_enquiry', 'service_enquiry', 'callback_request', 'contact_form'
    target_id TEXT,
    target_title TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'waiting_for_customer', 'converted', 'closed', 'rejected')),
    attachments JSONB DEFAULT '[]'::JSONB,
    admin_notes TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUSTOMER APPLICATIONS TABLE
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
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'document_verified', 'processing', 'completed', 'rejected')),
    priority TEXT DEFAULT 'standard',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WEBSITE CONTENT AND EDITABLE SECTIONS
CREATE TABLE IF NOT EXISTS public.website_content (
    section_key TEXT PRIMARY KEY,
    content_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WEBSITE SETTINGS
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_settings',
    site_name TEXT DEFAULT 'Apply365 — Services for People',
    phone TEXT DEFAULT '+91 91219 92365',
    whatsapp TEXT DEFAULT '+91 91219 92365',
    email TEXT DEFAULT 'contact@apply365.in',
    address TEXT DEFAULT 'Hyderabad, Telangana, India',
    logo_url TEXT DEFAULT '/apply365_logo.png',
    seo_title TEXT DEFAULT 'Apply365 — Government & Business Services Facilitation',
    seo_description TEXT DEFAULT 'Apply365 provides fast, reliable and hassle-free assistance for Aadhaar, PAN Card, Voter ID, MSME, Labour License, UAN/PF and ESI service requirements.',
    social_links JSONB DEFAULT '{"facebook": "#", "twitter": "#", "instagram": "#", "linkedin": "#"}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MEDIA ASSETS
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

-- 10. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Any user can view published content & public settings)
CREATE POLICY "Public can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view published services" ON public.services FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view website content" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "Public can view website settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Public can view course categories" ON public.course_categories FOR SELECT USING (true);

-- PUBLIC WRITE POLICIES (Customers can submit leads & applications)
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert applications" ON public.applications FOR INSERT WITH CHECK (true);

-- FULL ACCESS POLICIES FOR ADMIN OR ANON ACCESS (allowing the application to read and update data)
CREATE POLICY "Anon full access courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access website_content" ON public.website_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access website_settings" ON public.website_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access media_assets" ON public.media_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

-- Seed default Super Admin user (Password: Apply365@Admin2026)
INSERT INTO public.admin_users (id, email, full_name, role, password_hash, is_active)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'admin@apply365.in',
    'Super Administrator',
    'super_admin',
    'Apply365@Admin2026',
    true
)
ON CONFLICT (email) DO NOTHING;

