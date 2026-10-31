-- =========================================================================
-- APPLY365 MASTER DATABASE SCHEMA & INITIAL SEED FOR SUPABASE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tcbozysbacuoaewzoviq/sql
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

-- Ensure official_disclaimer exists even if table was created previously
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS official_disclaimer TEXT;

-- 5. LEADS AND ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    lead_type TEXT NOT NULL,
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

-- Idempotent RLS Policies: Drop old ones first to prevent duplicates
DROP POLICY IF EXISTS "Anon full access courses" ON public.courses;
DROP POLICY IF EXISTS "Anon full access services" ON public.services;
DROP POLICY IF EXISTS "Anon full access leads" ON public.leads;
DROP POLICY IF EXISTS "Anon full access applications" ON public.applications;
DROP POLICY IF EXISTS "Anon full access website_content" ON public.website_content;
DROP POLICY IF EXISTS "Anon full access website_settings" ON public.website_settings;
DROP POLICY IF EXISTS "Anon full access media_assets" ON public.media_assets;
DROP POLICY IF EXISTS "Anon full access activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Anon full access admin_users" ON public.admin_users;

-- Create universal access policies for live website & admin operations
CREATE POLICY "Anon full access courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access website_content" ON public.website_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access website_settings" ON public.website_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access media_assets" ON public.media_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon full access admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.services, public.courses, public.leads, public.applications;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
END $$;

-- =========================================================================
-- SEED DATA: SUPER ADMIN USER
-- =========================================================================
INSERT INTO public.admin_users (id, email, full_name, role, password_hash, is_active)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'admin@apply365.in',
    'Super Administrator',
    'super_admin',
    'Apply365@Admin2026',
    true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    is_active = true;

-- =========================================================================
-- SEED DATA: 7 SERVICES (ONE SOURCE OF TRUTH)
-- =========================================================================
INSERT INTO public.services (id, slug, title, short_description, full_description, accent_color, badge, icon_name, official_disclaimer, documents, benefits, process_steps, is_published, display_order)
VALUES 
(
  'aadhaar',
  'aadhaar',
  'Aadhaar Card',
  'Apply for Aadhaar address correction and get professional application assistance.',
  'Get expert guidance and hands-on assistance for Aadhaar address updates and new enrolment navigation under official UIDAI frameworks.',
  '#35A936',
  'Fast & Secure',
  'Fingerprint',
  'Acceptable proof depends on current UIDAI requirements and the specific address-update method chosen (online or designated Seva Kendra).',
  '[{"name": "Voter ID", "description": "Valid Voter Identity Card with current residential address."}, {"name": "Electricity Bill", "description": "Recent electricity utility bill (not older than 3 months) in applicant or family head name."}, {"name": "Passport", "description": "Valid Indian Passport with current residential details."}]'::JSONB,
  '["Pre-verification of address proof documents before submission", "Step-by-step guidance on self-service UIDAI update portal", "Minimizes rejection rates caused by document mismatches", "Appointment scheduling support at official Aadhaar Seva Kendras"]'::JSONB,
  '[{"title": "Document Verification", "description": "Our documentation team reviews your address proof against UIDAI standards."}, {"title": "Form Preparation", "description": "Accurate entry of address details following official phonetic and postal standards."}, {"title": "Submission Assistance", "description": "Assisting your submission through official UIDAI channels or scheduling Seva Kendra slot."}, {"title": "Acknowledgment & Tracking", "description": "You receive your official Update Request Number (URN) to track status."}]'::JSONB,
  true,
  1
),
(
  'pan-card',
  'pan-card',
  'PAN Card',
  'New PAN card application and correction assistance.',
  'Seamless support for new PAN Card issuance and corrections in name, date of birth, photo, or father name through authorized NSDL / UTIITSL routes.',
  '#104A96',
  'Essential Document',
  'CreditCard',
  'Document requirements distinguish between new PAN applications and correction applications. All data is matched strictly with your Aadhaar base.',
  '[{"name": "Aadhaar Card", "description": "Mandatory proof of identity, address, and date of birth."}, {"name": "Voter ID or SSC Memo", "description": "Secondary supporting identification or date of birth proof."}, {"name": "Photograph", "description": "Two recent passport-size color photographs with white background."}, {"name": "Signature", "description": "Clear signature in black ink on clean white paper."}]'::JSONB,
  '["Zero errors in form filling (Form 49A for new, CSF for corrections)", "Digital signature and photo dimension resizing according to NSDL specs", "Both e-PAN and physical PVC card delivery guidance"]'::JSONB,
  '[{"title": "Application Type Selection", "description": "Choose between New PAN or PAN Correction."}, {"title": "Document & Photo Preparation", "description": "Optimization of photo and signature according to strict NSDL specifications."}]'::JSONB,
  true,
  2
),
(
  'voter-id',
  'voter-id',
  'Voter ID',
  'New voter card registration and constituency transfer.',
  'Assistance with Election Commission of India (ECI) National Voters Service Portal (NVSP) Form 6, Form 8, and mobile number linking.',
  '#EF4444',
  'Civic Identity',
  'Vote',
  'Electoral registration is strictly governed by the Representation of the People Act. You must be 18 years or older on qualifying date.',
  '[{"name": "Passport-size Photograph", "description": "Recent color photograph with light background."}, {"name": "Proof of Age / DOB", "description": "Birth certificate, Aadhaar, PAN or 10th Marks Memo."}, {"name": "Proof of Ordinary Residence", "description": "Aadhaar, electricity bill, water bill, or bank passbook."}]'::JSONB,
  '["Guaranteed Form 6 / Form 8 accuracy", "Fast tracking with ECI reference number", "Correction of misspelled names and address shift assistance"]'::JSONB,
  '[{"title": "Constituency Verification", "description": "Locating your Assembly constituency and polling station."}, {"title": "Form 6/8 Filing", "description": "Online submission on NVSP portal with verified proofs."}]'::JSONB,
  true,
  3
),
(
  'msme',
  'msme',
  'MSME Registration',
  'Government Udyam registration for enterprise benefits.',
  'Official Udyam Registration certification for micro, small, and medium enterprises to access priority lending, subsidies, and tender exemptions.',
  '#8B5CF6',
  'Business Setup',
  'Building2',
  'Udyam Registration is 100% paperless and completely online. Aadhaar of applicant must have mobile linked.',
  '[{"name": "Aadhaar Card of Entrepreneur", "description": "Linked with active mobile number for OTP verification."}, {"name": "PAN Card of Enterprise / Proprietor", "description": "Mandatory PAN card for business identification."}, {"name": "Bank Account Details", "description": "Bank passbook or cancelled cheque with IFSC."}]'::JSONB,
  '["Lifetime Udyam Registration validity", "Priority sector bank loan access", "Government tender fee waivers", "Protection against delayed payments"]'::JSONB,
  '[{"title": "NIC Code Classification", "description": "Selecting the exact 5-digit National Industrial Classification codes."}, {"title": "Enterprise Information Entry", "description": "Accurate recording of turnover and plant/machinery investment."}]'::JSONB,
  true,
  4
),
(
  'labour-license',
  'labour-license',
  'Labour License',
  'Shop & Establishment and contract labour licensing.',
  'Mandatory state labour department registration and renewal under Shops & Commercial Establishments Act and Contract Labour Regulation Act.',
  '#F59E0B',
  'Legal Compliance',
  'FileCheck2',
  'State labour laws vary by jurisdiction. Establishments must register within 30 days of commencing operations.',
  '[{"name": "Rental Agreement / Ownership Deed", "description": "Registered lease agreement or tax receipt of business premises."}, {"name": "Authorized Signatory Identity Proof", "description": "Aadhaar and PAN card of owner or managing partner."}, {"name": "List of Employees", "description": "Employee names, designation and wage register."}]'::JSONB,
  '["100% legal immunity against inspection notices", "Annual compliance calendar and renewal reminders", "Authorized registration certificate for bank account opening"]'::JSONB,
  '[{"title": "Premises & Staff Classification", "description": "Determining applicable statutory rules and registration fee tier."}, {"title": "Portal Filing & Fee Payment", "description": "Submission through the state government single-window labour portal."}]'::JSONB,
  true,
  5
),
(
  'uan-pf',
  'uan-pf',
  'UAN / PF Services',
  'EPFO portal assistance, KYC update and claim filing.',
  'Assistance for employees and employers under Employees Provident Fund Organisation (EPFO) regulations.',
  '#0284C7',
  'Retirement & Welfare',
  'Landmark',
  'PF withdrawals and KYC updates require active Aadhaar OTP verification on the official EPFO Member e-Sewa portal.',
  '[{"name": "Active Mobile & Aadhaar Linked", "description": "Aadhaar must be linked to active phone for EPFO OTP."}, {"name": "Bank Passbook / Cheque Copy", "description": "Showing name, account number and IFSC."}, {"name": "Old PF Member IDs", "description": "Previous member IDs for PF transfer consolidation."}]'::JSONB,
  '["UAN activation & mobile linking assistance", "Bank KYC seeding with employer approval tracking", "Zero-error PF claim filing (Form 19, 10C, 31)"]'::JSONB,
  '[{"title": "UAN & KYC Verification", "description": "Audit of member details on EPFO Unified Portal."}, {"title": "Claim Submission & Tracking", "description": "Online submission of withdrawal or transfer request."}]'::JSONB,
  true,
  6
),
(
  'esi',
  'esi',
  'ESI Details Update',
  'ESIC member profile, dispensary mapping and card download.',
  'Employee State Insurance Corporation (ESIC) portal assistance for insured persons and employers.',
  '#10B981',
  'Healthcare Benefit',
  'HeartHandshake',
  'Medical and cash benefits are administered directly by the ESIC and tied to contribution periods.',
  '[{"name": "ESI Insurance Number", "description": "17-digit ESI number from employer."}, {"name": "Family Photographs", "description": "For dependent medical benefit cards."}, {"name": "Bank Account Details", "description": "For direct benefit transfers from ESIC."}]'::JSONB,
  '["Pehchan card generation assistance", "Dispensary mapping to nearest ESIC facility", "Family dependent addition for cashless medical cover"]'::JSONB,
  '[{"title": "IP Profile Audit", "description": "Verifying 17-digit insurance number and wage status."}, {"title": "Update & Card Generation", "description": "Submitting biometric/demographic updates."}]'::JSONB,
  true,
  7
)
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    accent_color = EXCLUDED.accent_color,
    badge = EXCLUDED.badge,
    official_disclaimer = EXCLUDED.official_disclaimer,
    documents = EXCLUDED.documents,
    benefits = EXCLUDED.benefits,
    process_steps = EXCLUDED.process_steps,
    updated_at = NOW();

-- =========================================================================
-- SEED DATA: INITIAL VOCATIONAL COURSES
-- =========================================================================
INSERT INTO public.courses (id, slug, title, category, short_description, full_description, image_url, duration, price, features, is_published, display_order)
VALUES
(
  'course-1',
  'csc-digital-seva-operator-masterclass',
  'Digital Seva Kendra & CSC Operator Professional Course',
  'Government Services',
  'Comprehensive practical training to run and manage a high-earning Common Service Center (CSC), Digital Seva Kendra, and MeeSeva center.',
  'This masterclass equips entrepreneurs and center operators with all technical and compliance workflows necessary to deliver government-to-citizen (G2C) and business-to-consumer (B2C) services.',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  '6 Weeks (Practical Hands-on)',
  '₹4,999',
  '["Live Portal Filing Training", "Aadhaar & PAN Error Resolution", "Client Documentation Checklist", "Official Course Completion Certificate"]'::JSONB,
  true,
  1
),
(
  'course-2',
  'gst-compliance-and-taxation-practitioner',
  'GST Practitioner & Business Compliance Masterclass',
  'Taxation & Accounting',
  'Complete practical course on GST registration, GSTR-1, GSTR-3B filing, reconciliation and invoicing.',
  'Designed for commerce students, accountants, and business consultants. Covers fresh GST registration, amendments, monthly/quarterly returns, input tax credit (ITC) reconciliation, E-way bill generation, and GST portal hands-on cases.',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
  '8 Weeks (Weekend Batches)',
  '₹5,999',
  '["GST Portal Live Filing", "GSTR-1, 3B & Annual Return GSTR-9", "E-Way Bill & E-Invoicing", "Case Studies with Real Business Data"]'::JSONB,
  true,
  2
)
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    features = EXCLUDED.features,
    updated_at = NOW();
