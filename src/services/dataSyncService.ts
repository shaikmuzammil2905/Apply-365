import { supabase } from './supabaseClient';
import { Course, Lead, WebsiteSettings, WebsiteContent, MediaAsset, ActivityLog } from '../types/admin';
import { ServiceDetail, ServiceDocument, SubServiceOption } from '../types/services';
import { servicesData as initialServicesData } from '../data/servicesData';
import { 
  CustomerApplication, 
  ApplicationStatusHistoryItem, 
  ApplicationDeliveryRecord, 
  CustomerNotification 
} from '../types/application';
import { 
  CustomerInvoice, 
  InvoicePayment, 
  InvoicePaymentStatus, 
  InvoiceStatus, 
  InvoiceItem 
} from '../types/invoices';

// Local Storage Keys for Instant Cache & Fallback
const STORAGE_PREFIX = 'apply365_db_';
const COURSES_KEY = `${STORAGE_PREFIX}courses_v1`;
const SERVICES_KEY = `${STORAGE_PREFIX}services_v1`;
const LEADS_KEY = `${STORAGE_PREFIX}leads_v1`;
const APPLICATIONS_KEY = `${STORAGE_PREFIX}applications_v1`;
const INVOICES_KEY = `${STORAGE_PREFIX}invoices_v1`;
const STATUS_HISTORY_KEY = `${STORAGE_PREFIX}status_history_v1`;
const DELIVERIES_KEY = `${STORAGE_PREFIX}deliveries_v1`;
const NOTIFICATIONS_KEY = `${STORAGE_PREFIX}notifications_v1`;
const CONTENT_KEY = `${STORAGE_PREFIX}content_v1`;
const SETTINGS_KEY = `${STORAGE_PREFIX}settings_v1`;
const MEDIA_KEY = `${STORAGE_PREFIX}media_v1`;
const LOGS_KEY = `${STORAGE_PREFIX}logs_v1`;

// ==========================================
// 1. INITIAL SEED DATA
// ==========================================
export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    slug: 'digital-seva-kendra-operator-course',
    title: 'Digital Seva Kendra Professional Certification',
    category: 'Government Services',
    shortDescription: 'Master CSC operations, Aadhaar, PAN card, Voter ID, Passport applications and government portal management.',
    fullDescription: 'Comprehensive training program for aspiring CSC/MeeSeva/Digital Seva Kendra operators. Learn end-to-end processing of statutory government documents, online filing, UIDAI guidelines, NSDL/UTI PAN workflows, and citizen assistance best practices.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
    duration: '6 Weeks (Practical Hands-on)',
    price: '₹4,999',
    features: [
      'Live Portal Filing Training',
      'Aadhaar & PAN Error Resolution',
      'Client Documentation Checklist',
      'Official Course Completion Certificate',
      'Lifetime Doubt Assistance'
    ],
    eligibility: '10th / 12th Pass or Basic Computer Knowledge',
    isPublished: true,
    displayOrder: 1,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'course-2',
    slug: 'gst-compliance-and-taxation-practitioner',
    title: 'GST Practitioner & Business Compliance Masterclass',
    category: 'Taxation & Accounting',
    shortDescription: 'Complete practical course on GST registration, GSTR-1, GSTR-3B filing, reconciliation and invoicing.',
    fullDescription: 'Designed for commerce students, accountants, and business consultants. Covers fresh GST registration, amendments, monthly/quarterly returns, input tax credit (ITC) reconciliation, E-way bill generation, and GST portal hands-on cases.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    duration: '8 Weeks (Weekend Batches)',
    price: '₹6,499',
    features: [
      'Real Invoicing & GSTR-1 Filing',
      'ITC Matching with GSTR-2B',
      'E-Way Bill & E-Invoicing',
      'Case Studies with Real Business Data',
      'Placement Assistance for Top Performers'
    ],
    eligibility: 'B.Com / M.Com / Working Accountants / Business Owners',
    isPublished: true,
    displayOrder: 2,
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z'
  },
  {
    id: 'course-3',
    slug: 'labour-law-pf-esi-compliance-specialist',
    title: 'EPF, ESI & Labour License Regulatory Compliance',
    category: 'Human Resources & Labour Law',
    shortDescription: 'Hands-on training in EPFO UAN management, monthly challan generation, ESIC returns and factory licensing.',
    fullDescription: 'Become an indispensable HR compliance consultant. Learn employee onboarding in EPF Unified Portal, member profile updates, KYC linking, PF claim processing, ESIC IP registration, TIC generation, and state labour department licensing.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
    duration: '4 Weeks',
    price: '₹3,999',
    features: [
      'EPF Unified Portal Operations',
      'ECR Generation & Challan Payment',
      'ESIC Dispensary Mapping & Claims',
      'Shops & Establishment Act Compliance',
      'Downloadable Ready Templates & Annexures'
    ],
    eligibility: 'Graduates, HR Executives, Administrative Officers',
    isPublished: true,
    displayOrder: 3,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'course-4',
    slug: 'msme-udyam-business-registration-consultant',
    title: 'MSME & Udyam Business Setup Advisory Course',
    category: 'Business Advisory',
    shortDescription: 'Step-by-step guidance on Udyam registration, MSME Samadhaan, government schemes, and business startup subsidies.',
    fullDescription: 'Empower small enterprises by becoming a registered business facilitator. Learn the intricacies of Udyam Aadhaar registration, NIC code selection, PMEGP subsidy schemes, GeM portal vendor registration, and trade license facilitation.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
    duration: '3 Weeks',
    price: '₹2,999',
    features: [
      'Zero-Error Udyam Portal Filing',
      'Government Subsidy Application Flow',
      'GeM Portal Onboarding Assistance',
      'Client Pitch Decks & Marketing Guides',
      'Consultant Certification'
    ],
    eligibility: 'Anyone interested in starting a business facilitation center',
    isPublished: true,
    displayOrder: 4,
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z'
  }
];

export const INITIAL_WEBSITE_SETTINGS: WebsiteSettings = {
  id: 'main_settings',
  siteName: 'Apply365 — Services for People',
  phone: '+91 91219 92365',
  whatsapp: '+91 91219 92365',
  email: 'contact@apply365.in',
  address: 'Plot 42, Hitech City Main Road, Madhapur, Hyderabad, Telangana - 500081',
  logoUrl: '/apply365_logo.png',
  seoTitle: 'Apply365 — Government & Business Services Facilitation Portal',
  seoDescription: 'Fast, secure and verified assistance for Aadhaar, PAN Card, Voter ID, MSME, Labour License, UAN/PF, ESI and Vocational Courses.',
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  },
  updatedAt: new Date().toISOString()
};

export const INITIAL_WEBSITE_CONTENT: WebsiteContent = {
  hero: {
    badge: 'Government & Business Services Made Easy',
    headlinePart1: 'Your Documents.',
    headlinePart2: 'Our Priority.',
    description: 'Apply365 provides fast, reliable and hassle-free assistance for all your government documentation, business registrations and professional certification courses.',
    primaryButtonText: 'Explore Our Services',
    secondaryButtonText: 'Contact Us',
    bannerImage: '/hero-approved.png'
  },
  trustIndicators: [
    { title: 'Secure & Trusted', description: 'Bank-grade encryption & privacy assurance' },
    { title: 'Fast Processing', description: 'Same-day document audit and filing' },
    { title: 'Expert Support', description: 'Dedicated consultation executives' },
    { title: '100% Genuine', description: 'Verified official government workflows' }
  ],
  aboutSection: {
    title: 'Empowering Citizens and Businesses Across India',
    subtitle: 'Simplifying official paperwork with digital excellence',
    content: 'Apply365 bridges the gap between complex governmental statutory procedures and citizens. Our platform brings speed, transparency, and certified guidance to everyday documentation.',
    yearsOfExcellence: '8+ Years',
    satisfiedClients: '50,000+'
  },
  contactSection: {
    supportHeading: 'We Are Here to Assist You 365 Days a Year',
    supportSubheading: 'Speak directly with our certified document executives.',
    operatingHours: 'Monday - Saturday: 9:00 AM - 8:00 PM IST'
  },
  updatedAt: new Date().toISOString()
};

// ==========================================
// 2. HELPER FUNCTIONS FOR STORAGE & EVENTS
// ==========================================
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage quota reached for ${key}`, e);
  }
}

function notifyDataChange(type: string, payload?: any): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apply365_data_sync', { detail: { type, payload } }));
  }
}

// Global Supabase Realtime Listener: Synchronize changes across all clients automatically
if (typeof window !== 'undefined') {
  try {
    supabase
      .channel('apply365_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, async () => {
        try {
          const { data } = await supabase.from('courses').select('*').order('display_order', { ascending: true });
          if (data && data.length > 0) {
            const mapped: Course[] = data.map((item: any) => ({
              id: item.id,
              slug: item.slug,
              title: item.title,
              category: item.category,
              shortDescription: item.short_description || item.shortDescription,
              fullDescription: item.full_description || item.fullDescription,
              imageUrl: item.image_url || item.imageUrl,
              thumbnailUrl: item.thumbnail_url || item.thumbnailUrl,
              duration: item.duration,
              price: item.price,
              features: Array.isArray(item.features) ? item.features : [],
              eligibility: item.eligibility,
              isPublished: item.is_published ?? item.isPublished ?? true,
              displayOrder: item.display_order || item.displayOrder || 0,
              createdAt: item.created_at || item.createdAt,
              updatedAt: item.updated_at || item.updatedAt
            }));
            setStored(COURSES_KEY, mapped);
            notifyDataChange('courses', mapped);
          }
        } catch (e) {
          console.warn('Realtime sync courses fetch failed:', e);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, async () => {
        try {
          const { data } = await supabase.from('services').select('*').order('display_order', { ascending: true });
          if (data && data.length > 0) {
            setStored(SERVICES_KEY, data);
            notifyDataChange('services', data);
          }
        } catch (e) {
          console.warn('Realtime sync services fetch failed:', e);
        }
      })
      .subscribe();
  } catch (err) {
    console.warn('Supabase realtime subscription failed:', err);
  }
}

// ==========================================
// 3. COURSES API (SUPABASE + SYNC)
// ==========================================
export async function getCourses(): Promise<Course[]> {
  // First try Supabase
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      const courses: Course[] = data.map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        category: item.category,
        shortDescription: item.short_description || item.shortDescription,
        fullDescription: item.full_description || item.fullDescription,
        imageUrl: item.image_url || item.imageUrl,
        thumbnailUrl: item.thumbnail_url || item.thumbnailUrl,
        duration: item.duration,
        price: item.price,
        features: Array.isArray(item.features) ? item.features : [],
        eligibility: item.eligibility,
        isPublished: item.is_published ?? item.isPublished ?? true,
        displayOrder: item.display_order || item.displayOrder || 0,
        createdAt: item.created_at || item.createdAt,
        updatedAt: item.updated_at || item.updatedAt
      }));
      setStored(COURSES_KEY, courses);
      return courses;
    }
  } catch (err) {
    console.warn('Supabase fetch courses failed, using cache:', err);
  }

  // Fallback to cache / initial
  return getStored<Course[]>(COURSES_KEY, INITIAL_COURSES);
}

export async function getPublishedCourses(): Promise<Course[]> {
  const all = await getCourses();
  return all.filter(c => c.isPublished);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const courses = await getCourses();
  const found = courses.find(c => c.slug === slug || c.id === slug);
  return found || null;
}

export async function saveCourse(course: Course): Promise<Course> {
  const all = getStored<Course[]>(COURSES_KEY, INITIAL_COURSES);
  const now = new Date().toISOString();
  const updatedCourse = { ...course, updatedAt: now };

  const idx = all.findIndex(c => c.id === course.id);
  if (idx >= 0) {
    all[idx] = updatedCourse;
  } else {
    all.push(updatedCourse);
  }
  setStored(COURSES_KEY, all);

  // Sync to Supabase
  try {
    await supabase.from('courses').upsert({
      id: updatedCourse.id,
      slug: updatedCourse.slug,
      title: updatedCourse.title,
      category: updatedCourse.category,
      short_description: updatedCourse.shortDescription,
      full_description: updatedCourse.fullDescription,
      image_url: updatedCourse.imageUrl,
      thumbnail_url: updatedCourse.thumbnailUrl || updatedCourse.imageUrl,
      duration: updatedCourse.duration,
      price: updatedCourse.price,
      features: updatedCourse.features,
      eligibility: updatedCourse.eligibility,
      is_published: updatedCourse.isPublished,
      display_order: updatedCourse.displayOrder,
      updated_at: now
    });
  } catch (err) {
    console.warn('Supabase course upsert failed, queued locally:', err);
  }

  await logActivity(
    idx >= 0 ? 'Course Updated' : 'Course Created',
    'course',
    course.id,
    `Admin updated course: ${course.title}`
  );

  notifyDataChange('courses', updatedCourse);
  return updatedCourse;
}

export async function deleteCourse(id: string): Promise<void> {
  const all = getStored<Course[]>(COURSES_KEY, INITIAL_COURSES);
  const filtered = all.filter(c => c.id !== id);
  setStored(COURSES_KEY, filtered);

  try {
    await supabase.from('courses').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase course delete failed:', err);
  }

  await logActivity('Course Deleted', 'course', id, `Admin removed course ID: ${id}`);
  notifyDataChange('courses');
}

// ==========================================
// 4. SERVICES API (SUPABASE + SYNC)
// ==========================================
export function getDefaultSubServices(slug: string): SubServiceOption[] {
  const s = (slug || '').toLowerCase();
  if (s.includes('aadhaar') || s.includes('aadhar')) {
    return [
      { value: 'address-update', label: 'Address Update / Correction' },
      { value: 'name-correction', label: 'Name Spelling Correction' },
      { value: 'dob-update', label: 'Date of Birth (DOB) Update' },
      { value: 'mobile-linking', label: 'Mobile Number Linking Support' },
      { value: 'new-enrolment', label: 'New Aadhaar Enrolment Support' },
    ];
  }
  if (s.includes('pan')) {
    return [
      { value: 'new-pan', label: 'New PAN Card (Indian Citizen / Form 49A)' },
      { value: 'pan-correction', label: 'PAN Correction / Update in Name, DOB or Photo' },
      { value: 'pan-reprint', label: 'Reprint of Damaged / Lost Physical PAN Card' },
    ];
  }
  if (s.includes('voter')) {
    return [
      { value: 'new-voter', label: 'New Voter ID Registration (Form 6)' },
      { value: 'voter-correction', label: 'Correction / Update in Existing Voter Card (Form 8)' },
      { value: 'voter-shift', label: 'Shifting of Residence / Assembly Constituency' },
      { value: 'voter-reprint', label: 'Replacement / Duplicate Voter ID (e-EPIC)' },
    ];
  }
  if (s.includes('msme') || s.includes('udyam')) {
    return [
      { value: 'new-udyam', label: 'Fresh MSME / Udyam Registration' },
      { value: 'udyam-update', label: 'Update / Modify Existing Udyam Details' },
      { value: 'udyam-print', label: 'Retrieve / Print Udyam Certificate' },
    ];
  }
  if (s.includes('labour') || s.includes('labor')) {
    return [
      { value: 'new-license', label: 'Fresh Labour Contractor / Establishment License' },
      { value: 'license-renewal', label: 'Annual Renewal of Labour License' },
      { value: 'license-amendment', label: 'Amendment in Worker Capacity or Location' },
    ];
  }
  if (s.includes('uan') || s.includes('pf')) {
    return [
      { value: 'kyc-update', label: 'Bank / Aadhaar / PAN KYC Linking in UAN' },
      { value: 'claim-filing', label: 'PF Advance (Form 31) / Full Withdrawal (Form 19 & 10C)' },
      { value: 'member-transfer', label: 'Transfer of PF from Previous Employer' },
      { value: 'dob-name-correction', label: 'Joint Declaration for Name / DOB Correction' },
    ];
  }
  if (s.includes('esi')) {
    return [
      { value: 'ip-registration', label: 'New Insured Person (Employee) ESI Registration' },
      { value: 'family-details', label: 'Family / Dependent Member Addition in ESI' },
      { value: 'dispensary-change', label: 'Change of Dispensary / Hospital Mapping' },
      { value: 'correct-demographics', label: 'Correction in Insured Person Name / DOB' },
      { value: 'pehchan-reprint', label: 'Download Updated e-Pehchan Card' },
    ];
  }
  if (s.includes('passport')) {
    return [
      { value: 'fresh-normal', label: 'Fresh Passport (Normal Track: 30-45 Days)' },
      { value: 'fresh-tatkaal', label: 'Fresh Passport (Tatkaal Track: 3-7 Days)' },
      { value: 'reissue-expiry', label: 'Passport Re-issue / Renewal (Validity Expired / Expiring)' },
      { value: 'reissue-pages-exhausted', label: 'Passport Re-issue (Pages Exhausted)' },
      { value: 'reissue-change-details', label: 'Passport Re-issue (Change of Name / Address)' },
      { value: 'minor-passport', label: 'Minor Passport Application (Under 18 Years)' },
    ];
  }
  return [
    { value: 'standard-filing', label: 'Standard Service Application' },
    { value: 'priority-filing', label: 'Priority / Fast-Track Assistance' }
  ];
}

export async function getServices(): Promise<ServiceDetail[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      const cachedAll = getStored<ServiceDetail[]>(SERVICES_KEY, []);

      const services: ServiceDetail[] = data.map((item: any) => {
        // 1. Check for fallback storage in faqs JSONB column
        const faqsStorage = Array.isArray(item.faqs) 
          ? item.faqs.find((f: any) => f.question === '__sub_services_storage__') 
          : null;
        let parsedSubServices: SubServiceOption[] | null = null;
        if (faqsStorage && faqsStorage.answer) {
          try {
            parsedSubServices = JSON.parse(faqsStorage.answer);
          } catch {}
        }
        const cleanFaqs = Array.isArray(item.faqs) 
          ? item.faqs.filter((f: any) => f.question !== '__sub_services_storage__') 
          : [];

        // 2. Check cached subServices in localStorage
        const cachedSvc = cachedAll.find(s => s.id === item.id || s.slug === item.slug);
        const cachedSubs = cachedSvc?.subServices && cachedSvc.subServices.length > 0 
          ? cachedSvc.subServices 
          : null;

        // Resolve subServices with priority: direct column -> fallback faqs storage -> cache -> statutory default
        const resolvedSubServices = 
          (item.sub_services && item.sub_services.length > 0 ? item.sub_services : null) ||
          (parsedSubServices && parsedSubServices.length > 0 ? parsedSubServices : null) ||
          cachedSubs ||
          getDefaultSubServices(item.slug);

        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          shortDescription: item.short_description || item.shortDescription,
          fullDescription: item.full_description || item.fullDescription,
          accentColor: item.accent_color || item.accentColor || '#104A96',
          badge: item.badge || 'Popular',
          iconName: item.icon_name || item.iconName || 'FileText',
          subServices: resolvedSubServices,
          documents: item.documents || [],
          officialDisclaimer: item.official_disclaimer || item.officialDisclaimer || '',
          benefits: item.benefits || [],
          processSteps: item.process_steps || item.processSteps || [],
          faqs: cleanFaqs
        };
      });

      setStored(SERVICES_KEY, services);
      return services;
    }
  } catch (err) {
    console.warn('Supabase fetch services failed, using cache:', err);
  }

  const cached = getStored<ServiceDetail[]>(SERVICES_KEY, initialServicesData);
  return cached.map(svc => ({
    ...svc,
    subServices: svc.subServices && svc.subServices.length > 0 ? svc.subServices : getDefaultSubServices(svc.slug)
  }));
}

export function getInitialServiceBySlug(slug: string): ServiceDetail {
  const cached = getStored<ServiceDetail[]>(SERVICES_KEY, initialServicesData);
  if (!slug) {
    const first = cached[0] || initialServicesData[0];
    return { ...first, subServices: first.subServices || getDefaultSubServices(first.slug) };
  }
  const raw = slug.toLowerCase().trim();

  const normalized = 
    raw === 'aadhaar-card' || raw === 'aadhaar' || raw.includes('aadhaar') || raw.includes('aadhar') ? 'aadhaar' :
    raw === 'pan' || raw === 'pan-card' || raw.includes('pan') ? 'pan-card' :
    raw === 'voter' || raw === 'voter-id' || raw.includes('voter') ? 'voter-id' :
    raw === 'msme-registration' || raw === 'msme' || raw.includes('msme') || raw.includes('udyam') ? 'msme' :
    raw === 'labour-license' || raw === 'labour' || raw.includes('labour') || raw.includes('labor') ? 'labour-license' :
    raw === 'uan-pf-services' || raw === 'uan-pf' || raw === 'pf' || raw === 'uan' || raw.includes('uan') || raw.includes('pf') ? 'uan-pf' :
    raw === 'esi-details-update' || raw === 'esi' || raw.includes('esi') ? 'esi' :
    raw;

  const found = cached.find(s => s.slug === normalized || s.id === normalized || s.slug === raw || s.id === raw);
  if (found) {
    return { ...found, subServices: found.subServices || getDefaultSubServices(found.slug) };
  }

  const partial = cached.find(s => s.slug.includes(normalized) || normalized.includes(s.slug));
  const res = partial || cached[0] || initialServicesData[0];
  return { ...res, subServices: res.subServices || getDefaultSubServices(res.slug) };
}

export async function getServiceBySlug(slug: string): Promise<ServiceDetail> {
  const all = await getServices();
  if (!slug) return all[0] || initialServicesData[0];
  const raw = slug.toLowerCase().trim();

  const normalized = 
    raw === 'aadhaar-card' || raw === 'aadhaar' || raw.includes('aadhaar') || raw.includes('aadhar') ? 'aadhaar' :
    raw === 'pan' || raw === 'pan-card' || raw.includes('pan') ? 'pan-card' :
    raw === 'voter' || raw === 'voter-id' || raw.includes('voter') ? 'voter-id' :
    raw === 'msme-registration' || raw === 'msme' || raw.includes('msme') || raw.includes('udyam') ? 'msme' :
    raw === 'labour-license' || raw === 'labour' || raw.includes('labour') || raw.includes('labor') ? 'labour-license' :
    raw === 'uan-pf-services' || raw === 'uan-pf' || raw === 'pf' || raw === 'uan' || raw.includes('uan') || raw.includes('pf') ? 'uan-pf' :
    raw === 'esi-details-update' || raw === 'esi' || raw.includes('esi') ? 'esi' :
    raw;

  const found = all.find(s => s.slug === normalized || s.id === normalized || s.slug === raw || s.id === raw);
  if (found) return found;

  const partial = all.find(s => s.slug.includes(normalized) || normalized.includes(s.slug));
  return partial || all[0] || initialServicesData[0];
}

export async function saveService(service: ServiceDetail): Promise<ServiceDetail> {
  const all = getStored<ServiceDetail[]>(SERVICES_KEY, initialServicesData);
  const idx = all.findIndex(s => s.id === service.id || s.slug === service.slug);

  if (idx >= 0) {
    all[idx] = { ...service };
  } else {
    all.push(service);
  }
  setStored(SERVICES_KEY, all);

  // Sync to Supabase
  // Prepare sub_services in faqs JSONB column as fallback storage
  // so that even if the SQL column sub_services is pending in Supabase,
  // the data is 100% saved and persisted across all devices!
  const cleanFaqs = (service.faqs || []).filter((f: any) => f.question !== '__sub_services_storage__');
  const faqsWithSubServices = [
    ...cleanFaqs,
    ...(service.subServices && service.subServices.length > 0 
      ? [{ question: '__sub_services_storage__', answer: JSON.stringify(service.subServices) }] 
      : [])
  ];

  const payload: any = {
    id: service.id,
    slug: service.slug,
    title: service.title,
    short_description: service.shortDescription,
    full_description: service.fullDescription,
    accent_color: service.accentColor,
    badge: service.badge,
    icon_name: service.iconName,
    sub_services: service.subServices,
    documents: service.documents,
    benefits: service.benefits,
    process_steps: service.processSteps,
    faqs: faqsWithSubServices,
    updated_at: new Date().toISOString()
  };

  const { error: primaryError } = await supabase.from('services').upsert({
    ...payload,
    official_disclaimer: service.officialDisclaimer
  });

  if (primaryError) {
    // Retry without sub_services column if it hasn't been added via SQL yet.
    // faqsWithSubServices still preserves the sub_services in Supabase!
    const { sub_services, ...strippedPayload } = payload;
    const { error: fallbackError } = await supabase.from('services').upsert({
      ...strippedPayload,
      official_disclaimer: service.officialDisclaimer
    });
    if (fallbackError) {
      console.error('Supabase service fallback upsert failed:', fallbackError);
      throw new Error(`Supabase error: ${fallbackError.message}`);
    }
  }

  await logActivity('Service Updated', 'service', service.id, `Admin modified service: ${service.title}`);
  notifyDataChange('services', service);
  return service;
}

export async function deleteService(serviceId: string): Promise<void> {
  const all = getStored<ServiceDetail[]>(SERVICES_KEY, initialServicesData);
  const filtered = all.filter(s => s.id !== serviceId && s.slug !== serviceId);
  setStored(SERVICES_KEY, filtered);

  try {
    await supabase.from('services').delete().or(`id.eq.${serviceId},slug.eq.${serviceId}`);
  } catch (err) {
    console.warn('Supabase service delete warning:', err);
  }

  await logActivity('Service Deleted', 'service', serviceId, `Admin removed service ID: ${serviceId}`);
  notifyDataChange('services');
}

export async function getServiceDocuments(serviceId: string): Promise<ServiceDocument[]> {
  const service = await getServiceBySlug(serviceId);
  if (!service || !service.documents) return [];

  return service.documents.map((doc: any, idx: number) => {
    const isOpt = doc.isOptional === true || doc.isMandatory === false || (doc.name && doc.name.toLowerCase().includes('optional'));
    return {
      id: doc.id || `doc-${service.id}-${idx + 1}`,
      serviceId: service.id,
      name: doc.name,
      shortLabel: doc.shortLabel || doc.name.split('(')[0].trim(),
      description: doc.description || 'Valid supporting documentation as required under statutory guidelines.',
      instructions: doc.instructions || 'Ensure all details, dates and text are completely clear, readable and uncropped.',
      category: doc.category || (doc.name.toLowerCase().includes('address') || doc.name.toLowerCase().includes('bill') ? 'Address Proof' : doc.name.toLowerCase().includes('photo') ? 'Photograph / Signature' : 'Identity Proof'),
      isMandatory: !isOpt,
      isOptional: isOpt,
      isActive: doc.isActive !== false,
      allowMultipleFiles: doc.allowMultipleFiles || false,
      allowedFileTypes: doc.allowedFileTypes || ['pdf', 'jpg', 'jpeg', 'png'],
      maxFileSizeMB: doc.maxFileSizeMB || 10,
      minFiles: doc.minFiles || 1,
      maxFiles: doc.maxFiles || (doc.allowMultipleFiles ? 5 : 1),
      displayOrder: doc.displayOrder ?? (idx + 1)
    };
  });
}

export async function saveServiceDocuments(serviceId: string, documents: ServiceDocument[]): Promise<ServiceDocument[]> {
  const service = await getServiceBySlug(serviceId);
  if (!service) throw new Error(`Service ${serviceId} not found`);

  const normalizedDocs = documents.map((doc, idx) => ({
    ...doc,
    serviceId: service.id,
    displayOrder: idx + 1,
    isMandatory: doc.isMandatory !== false,
    isOptional: doc.isMandatory === false || doc.isOptional === true
  }));

  service.documents = normalizedDocs;
  await saveService(service);
  notifyDataChange('service_documents', { serviceId: service.id, documents: normalizedDocs });
  return normalizedDocs;
}

export async function copyServiceDocuments(fromServiceId: string, toServiceId: string): Promise<ServiceDocument[]> {
  const sourceDocs = await getServiceDocuments(fromServiceId);
  if (!sourceDocs || sourceDocs.length === 0) {
    throw new Error('Source service has no documents to copy');
  }

  const clonedDocs: ServiceDocument[] = sourceDocs.map((doc, idx) => ({
    ...doc,
    id: `doc-${toServiceId}-${Date.now()}-${idx + 1}`,
    serviceId: toServiceId,
    displayOrder: idx + 1
  }));

  return await saveServiceDocuments(toServiceId, clonedDocs);
}

// ==========================================
// 5. LEADS AND ENQUIRIES API
// ==========================================
export async function getLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const leads: Lead[] = data.map((item: any) => ({
        id: item.id,
        customerName: item.customer_name || item.customerName,
        mobile: item.mobile,
        email: item.email,
        leadType: item.lead_type || item.leadType,
        targetId: item.target_id || item.targetId,
        targetTitle: item.target_title || item.targetTitle,
        message: item.message,
        status: item.status || 'new',
        attachments: item.attachments || [],
        adminNotes: item.admin_notes || item.adminNotes,
        assignedTo: item.assigned_to || item.assignedTo,
        createdAt: item.created_at || item.createdAt,
        updatedAt: item.updated_at || item.updatedAt
      }));
      setStored(LEADS_KEY, leads);
      return leads;
    }
  } catch (err) {
    console.warn('Supabase fetch leads failed, checking cache:', err);
  }

  return getStored<Lead[]>(LEADS_KEY, []);
}

export async function submitLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string; status?: Lead['status'] }): Promise<Lead> {
  const newLead: Lead = {
    id: lead.id || `LEAD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    customerName: lead.customerName,
    mobile: lead.mobile,
    email: lead.email || '',
    leadType: lead.leadType,
    targetId: lead.targetId || '',
    targetTitle: lead.targetTitle || '',
    message: lead.message || '',
    status: lead.status || 'new',
    attachments: lead.attachments || [],
    adminNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const all = getStored<Lead[]>(LEADS_KEY, []);
  all.unshift(newLead);
  setStored(LEADS_KEY, all);

  try {
    await supabase.from('leads').insert({
      id: newLead.id,
      customer_name: newLead.customerName,
      mobile: newLead.mobile,
      email: newLead.email,
      lead_type: newLead.leadType,
      target_id: newLead.targetId,
      target_title: newLead.targetTitle,
      message: newLead.message,
      status: newLead.status,
      attachments: newLead.attachments,
      admin_notes: newLead.adminNotes,
      created_at: newLead.createdAt,
      updated_at: newLead.updatedAt
    });
  } catch (err) {
    console.warn('Supabase lead insert failed, stored in local fallback:', err);
  }

  await logActivity('Lead Received', 'lead', newLead.id, `New lead from ${newLead.customerName} (${newLead.leadType})`);
  notifyDataChange('leads', newLead);
  return newLead;
}

export async function updateLeadStatus(id: string, status: Lead['status'], notes?: string): Promise<void> {
  const all = getStored<Lead[]>(LEADS_KEY, []);
  const lead = all.find(l => l.id === id);
  if (lead) {
    lead.status = status;
    if (notes !== undefined) lead.adminNotes = notes;
    lead.updatedAt = new Date().toISOString();
    setStored(LEADS_KEY, all);

    try {
      await supabase.from('leads').update({
        status,
        admin_notes: lead.adminNotes,
        updated_at: lead.updatedAt
      }).eq('id', id);
    } catch (err) {
      console.warn('Supabase lead update failed:', err);
    }

    await logActivity('Lead Status Changed', 'lead', id, `Lead ${id} changed to ${status}`);
    notifyDataChange('leads', lead);
  }
}

// ==========================================
// 6. APPLICATIONS API
// ==========================================
export async function getAllApplications(): Promise<CustomerApplication[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const apps: CustomerApplication[] = data.map((item: any) => ({
        id: item.id,
        customerId: item.customer_id || item.customerId || '',
        customerName: item.customer_name || item.customerName,
        customerMobile: item.customer_mobile || item.customerMobile,
        customerEmail: item.customer_email || item.customerEmail,
        serviceId: item.service_slug || item.serviceId || 'aadhaar',
        serviceSlug: item.service_slug || item.serviceSlug,
        serviceTitle: item.service_title || item.serviceTitle,
        serviceType: item.service_type || item.serviceType || 'Standard',
        formData: item.form_data || item.formData || {},
        documents: item.documents || [],
        status: item.status || 'submitted',
        priority: item.priority || 'standard',
        submissionDate: item.created_at || item.submissionDate || new Date().toISOString(),
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        updatedAt: item.updated_at || item.updatedAt || new Date().toISOString()
      }));
      setStored(APPLICATIONS_KEY, apps);
      return apps;
    }
  } catch (err) {
    console.warn('Supabase fetch applications failed, using cache:', err);
  }

  return getStored<CustomerApplication[]>(APPLICATIONS_KEY, []);
}

export async function updateApplicationStatus(id: string, status: CustomerApplication['status']): Promise<void> {
  const all = getStored<CustomerApplication[]>(APPLICATIONS_KEY, []);
  const app = all.find(a => a.id === id);
  if (app) {
    app.status = status;
    app.updatedAt = new Date().toISOString();
    setStored(APPLICATIONS_KEY, all);

    try {
      await supabase.from('applications').update({
        status,
        updated_at: app.updatedAt
      }).eq('id', id);
    } catch (err) {
      console.warn('Supabase app status update failed:', err);
    }

    await logActivity('Application Updated', 'application', id, `Application ${id} status set to ${status}`);
    notifyDataChange('applications', app);
  }
}

// ==========================================
// 6B. STATUS HISTORY & LIFECYCLE MANAGEMENT API
// ==========================================
export async function getApplicationStatusHistory(applicationId: string): Promise<ApplicationStatusHistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('application_status_history')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const history: ApplicationStatusHistoryItem[] = data.map((item: any) => ({
        id: item.id,
        applicationId: item.application_id,
        previousStatus: item.previous_status,
        newStatus: item.new_status,
        customerMessage: item.customer_message,
        internalNote: item.internal_note,
        expectedCompletionDate: item.expected_completion_date,
        updatedBy: item.updated_by || 'Super Administrator',
        createdAt: item.created_at
      }));
      return history;
    }
  } catch (err) {
    console.warn('Supabase fetch status history failed, using cache:', err);
  }

  const all = getStored<ApplicationStatusHistoryItem[]>(STATUS_HISTORY_KEY, []);
  return all.filter(h => h.applicationId === applicationId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateApplicationDates(
  id: string,
  newSubmissionDate?: string,
  expectedCompletionDate?: string
): Promise<CustomerApplication> {
  const all = getStored<CustomerApplication[]>(APPLICATIONS_KEY, []);
  const app = all.find(a => a.id === id);
  if (!app) {
    throw new Error(`Application ${id} not found`);
  }

  if (newSubmissionDate) {
    app.submissionDate = newSubmissionDate;
    app.createdAt = newSubmissionDate;
  }
  if (expectedCompletionDate !== undefined) {
    app.expectedCompletionDate = expectedCompletionDate;
  }
  app.updatedAt = new Date().toISOString();
  setStored(APPLICATIONS_KEY, all);

  try {
    const updatePayload: any = { updated_at: app.updatedAt };
    if (newSubmissionDate) updatePayload.created_at = newSubmissionDate;
    await supabase.from('applications').update(updatePayload).eq('id', id);
  } catch (err) {
    console.warn('Supabase app date update failed:', err);
  }

  await logActivity('Application Date Modified', 'application', id, `Admin updated date for application ${id}`);
  notifyDataChange('applications', app);
  return app;
}

export async function updateApplicationWithHistory(
  id: string,
  newStatus: string,
  customerMessage: string,
  internalNote?: string,
  expectedDate?: string,
  customSubmissionDate?: string,
  updatedBy: string = 'Super Administrator'
): Promise<CustomerApplication> {
  const all = getStored<CustomerApplication[]>(APPLICATIONS_KEY, []);
  const app = all.find(a => a.id === id);
  if (!app) {
    throw new Error(`Application ${id} not found`);
  }

  const prevStatus = app.status;
  app.status = newStatus as any;
  if (customSubmissionDate) {
    app.submissionDate = customSubmissionDate;
    app.createdAt = customSubmissionDate;
  }
  if (expectedDate !== undefined) {
    app.expectedCompletionDate = expectedDate;
  }
  app.updatedAt = new Date().toISOString();
  setStored(APPLICATIONS_KEY, all);

  // 1. Update Supabase Application
  try {
    const updatePayload: any = {
      status: newStatus,
      updated_at: app.updatedAt
    };
    if (customSubmissionDate) {
      updatePayload.created_at = customSubmissionDate;
    }
    await supabase.from('applications').update(updatePayload).eq('id', id);
  } catch (err) {
    console.warn('Supabase app status update failed:', err);
  }

  // 2. Insert Status History Record
  const historyItem: ApplicationStatusHistoryItem = {
    id: `hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    applicationId: id,
    previousStatus: prevStatus,
    newStatus,
    customerMessage: customerMessage || `Application status changed to ${newStatus.replace(/_/g, ' ')}.`,
    internalNote,
    expectedCompletionDate: expectedDate,
    updatedBy,
    createdAt: new Date().toISOString()
  };

  const allHistory = getStored<ApplicationStatusHistoryItem[]>(STATUS_HISTORY_KEY, []);
  allHistory.unshift(historyItem);
  setStored(STATUS_HISTORY_KEY, allHistory);

  try {
    await supabase.from('application_status_history').insert({
      id: historyItem.id,
      application_id: historyItem.applicationId,
      previous_status: historyItem.previousStatus,
      new_status: historyItem.newStatus,
      customer_message: historyItem.customerMessage,
      internal_note: historyItem.internalNote,
      expected_completion_date: historyItem.expectedCompletionDate,
      updated_by: historyItem.updatedBy,
      created_at: historyItem.createdAt
    });
  } catch (err) {
    console.warn('Supabase insert status history failed:', err);
  }

  // 3. Create Customer Notification
  if (app.customerId) {
    await createNotification({
      customerId: app.customerId,
      applicationId: app.id,
      notificationType: 'status_update',
      title: `${app.serviceTitle} Status Updated: ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
      message: customerMessage || `Your application status has been updated to ${newStatus.replace(/_/g, ' ')}.`,
      deliveryChannel: 'in_app'
    });
  }

  await logActivity(
    'Application Status Changed',
    'application',
    id,
    `Admin changed ${id} status from ${prevStatus} to ${newStatus}. Note: ${internalNote || 'None'}`
  );

  notifyDataChange('applications', app);
  notifyDataChange('status_history', historyItem);

  return app;
}

// ==========================================
// 6C. APPLICATION DOCUMENT DELIVERY API
// ==========================================
export async function getApplicationDeliveries(applicationId: string): Promise<ApplicationDeliveryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('application_deliveries')
      .select('*')
      .eq('application_id', applicationId)
      .order('sent_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const deliveries: ApplicationDeliveryRecord[] = data.map((item: any) => ({
        id: item.id,
        applicationId: item.application_id,
        customerId: item.customer_id,
        deliveryChannel: item.delivery_channel,
        recipient: item.recipient,
        documentReference: item.document_reference,
        deliveryStatus: item.delivery_status,
        failureReason: item.failure_reason,
        sentBy: item.sent_by,
        sentAt: item.sent_at
      }));
      return deliveries;
    }
  } catch (err) {
    console.warn('Supabase fetch deliveries failed, using cache:', err);
  }

  const all = getStored<ApplicationDeliveryRecord[]>(DELIVERIES_KEY, []);
  return all.filter(d => d.applicationId === applicationId).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export async function sendApplicationSoftCopy(
  applicationId: string,
  channel: 'email' | 'whatsapp' | 'portal_notification',
  recipient: string,
  sentBy: string = 'Super Administrator'
): Promise<ApplicationDeliveryRecord> {
  const allApps = getStored<CustomerApplication[]>(APPLICATIONS_KEY, []);
  const app = allApps.find(a => a.id === applicationId);

  const delivery: ApplicationDeliveryRecord = {
    id: `deliv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    applicationId,
    customerId: app?.customerId || 'customer',
    deliveryChannel: channel,
    recipient,
    documentReference: `APP365-DOSSIER-${applicationId}.pdf`,
    deliveryStatus: 'sent',
    sentBy,
    sentAt: new Date().toISOString()
  };

  const allDeliveries = getStored<ApplicationDeliveryRecord[]>(DELIVERIES_KEY, []);
  allDeliveries.unshift(delivery);
  setStored(DELIVERIES_KEY, allDeliveries);

  try {
    await supabase.from('application_deliveries').insert({
      id: delivery.id,
      application_id: delivery.applicationId,
      customer_id: delivery.customerId,
      delivery_channel: delivery.deliveryChannel,
      recipient: delivery.recipient,
      document_reference: delivery.documentReference,
      delivery_status: delivery.deliveryStatus,
      sent_by: delivery.sentBy,
      sent_at: delivery.sentAt
    });
  } catch (err) {
    console.warn('Supabase insert delivery failed:', err);
  }

  // Also notify in customer portal
  if (app?.customerId) {
    await createNotification({
      customerId: app.customerId,
      applicationId: app.id,
      notificationType: 'document_delivery',
      title: `Official Application Soft Copy Generated (${channel.toUpperCase()})`,
      message: `Your verified ${app.serviceTitle} soft copy is ready and dispatched to ${recipient}.`,
      deliveryChannel: channel === 'portal_notification' ? 'in_app' : channel
    });
  }

  await logActivity(
    'Application Soft Copy Dispatched',
    'application',
    applicationId,
    `Admin dispatched application copy to ${recipient} via ${channel.toUpperCase()}`
  );

  notifyDataChange('deliveries', delivery);
  return delivery;
}

// ==========================================
// 6D. INVOICE MANAGEMENT & BILLING API
// ==========================================
export async function getInvoices(): Promise<CustomerInvoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const invoices: CustomerInvoice[] = data.map((item: any) => ({
        id: item.id,
        invoiceNumber: item.invoice_number,
        customerId: item.customer_id,
        customerName: item.customer_name,
        customerEmail: item.customer_email || '',
        customerMobile: item.customer_mobile,
        customerAddress: item.customer_address,
        applicationId: item.application_id,
        serviceName: item.service_name,
        invoiceDate: item.invoice_date || item.created_at,
        dueDate: item.due_date,
        items: item.items || [],
        subtotal: Number(item.subtotal || 0),
        discount: Number(item.discount || 0),
        taxRate: Number(item.tax_rate || 0),
        taxAmount: Number(item.tax_amount || 0),
        totalAmount: Number(item.total_amount || 0),
        amountPaid: Number(item.amount_paid || 0),
        balanceDue: Number(item.balance_due || 0),
        paymentStatus: item.payment_status || 'unpaid',
        invoiceStatus: item.invoice_status || 'draft',
        payments: item.payments || [],
        notes: item.notes,
        paymentInstructions: item.payment_instructions,
        createdBy: item.created_by,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString()
      }));
      setStored(INVOICES_KEY, invoices);
      return invoices;
    }
  } catch (err) {
    console.warn('Supabase fetch invoices failed, using local cache:', err);
  }

  return getStored<CustomerInvoice[]>(INVOICES_KEY, []);
}

export async function getCustomerInvoices(customerId: string): Promise<CustomerInvoice[]> {
  const all = await getInvoices();
  if (!customerId) return all;
  return all.filter(inv => inv.customerId === customerId);
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const all = await getInvoices();
  const yearInvoices = all.filter(i => i.invoiceNumber && i.invoiceNumber.startsWith(`APP-INV-${year}`));
  
  let maxSeq = 0;
  yearInvoices.forEach(i => {
    const parts = i.invoiceNumber.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `APP-INV-${year}-${nextSeq}`;
}

export async function createInvoice(data: Partial<CustomerInvoice>): Promise<CustomerInvoice> {
  const invoiceNumber = data.invoiceNumber || (await generateInvoiceNumber());
  const now = new Date().toISOString();
  const subtotal = Number(data.subtotal || 0);
  const discount = Number(data.discount || 0);
  const taxRate = Number(data.taxRate || 0);
  const taxAmount = Number(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const totalAmount = Number((subtotal - discount + taxAmount).toFixed(2));
  const amountPaid = Number(data.amountPaid || 0);
  const balanceDue = Math.max(0, Number((totalAmount - amountPaid).toFixed(2)));

  let paymentStatus: InvoicePaymentStatus = 'unpaid';
  if (amountPaid >= totalAmount && totalAmount > 0) {
    paymentStatus = 'paid';
  } else if (amountPaid > 0) {
    paymentStatus = 'partially_paid';
  }

  const newInvoice: CustomerInvoice = {
    id: data.id || `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    invoiceNumber,
    customerId: data.customerId || `cust_${Date.now()}`,
    customerName: data.customerName || 'Valued Customer',
    customerEmail: data.customerEmail || '',
    customerMobile: data.customerMobile || '',
    customerAddress: data.customerAddress || '',
    applicationId: data.applicationId || undefined,
    serviceName: data.serviceName || 'Statutory Filing Service',
    invoiceDate: data.invoiceDate || now.slice(0, 10),
    dueDate: data.dueDate || '',
    items: data.items || [
      {
        id: `item-1`,
        description: `${data.serviceName || 'Statutory Filing'} Facilitation and Filing Charges`,
        quantity: 1,
        unitPrice: subtotal || totalAmount,
        total: subtotal || totalAmount
      }
    ],
    subtotal,
    discount,
    taxRate,
    taxAmount,
    totalAmount,
    amountPaid,
    balanceDue,
    paymentStatus,
    invoiceStatus: data.invoiceStatus || 'finalized',
    payments: data.payments || [],
    notes: data.notes || '',
    paymentInstructions: data.paymentInstructions || 'Please transfer to UPI: apply365@icici with invoice number in remarks.',
    createdBy: data.createdBy || 'Super Administrator',
    createdAt: now,
    updatedAt: now
  };

  const all = getStored<CustomerInvoice[]>(INVOICES_KEY, []);
  all.unshift(newInvoice);
  setStored(INVOICES_KEY, all);

  try {
    await supabase.from('invoices').insert({
      id: newInvoice.id,
      invoice_number: newInvoice.invoiceNumber,
      customer_id: newInvoice.customerId,
      customer_name: newInvoice.customerName,
      customer_email: newInvoice.customerEmail,
      customer_mobile: newInvoice.customerMobile,
      customer_address: newInvoice.customerAddress,
      application_id: newInvoice.applicationId,
      service_name: newInvoice.serviceName,
      invoice_date: newInvoice.invoiceDate,
      due_date: newInvoice.dueDate,
      items: newInvoice.items,
      subtotal: newInvoice.subtotal,
      discount: newInvoice.discount,
      tax_rate: newInvoice.taxRate,
      tax_amount: newInvoice.taxAmount,
      total_amount: newInvoice.totalAmount,
      amount_paid: newInvoice.amountPaid,
      balance_due: newInvoice.balanceDue,
      payment_status: newInvoice.paymentStatus,
      invoice_status: newInvoice.invoiceStatus,
      payments: newInvoice.payments,
      notes: newInvoice.notes,
      payment_instructions: newInvoice.paymentInstructions,
      created_by: newInvoice.createdBy,
      created_at: newInvoice.createdAt,
      updated_at: newInvoice.updatedAt
    });
  } catch (err) {
    console.warn('Supabase invoice insert failed:', err);
  }

  // Send customer portal notification
  if (newInvoice.customerId) {
    await createNotification({
      customerId: newInvoice.customerId,
      invoiceId: newInvoice.id,
      applicationId: newInvoice.applicationId,
      notificationType: 'invoice_created',
      title: `Invoice Generated: ${newInvoice.invoiceNumber}`,
      message: `Tax invoice of ₹${newInvoice.totalAmount.toLocaleString('en-IN')} has been generated for ${newInvoice.serviceName}.`,
      deliveryChannel: 'in_app'
    });
  }

  await logActivity(
    'Invoice Created',
    'invoice',
    newInvoice.id,
    `Admin created invoice ${newInvoice.invoiceNumber} for ${newInvoice.customerName} (₹${newInvoice.totalAmount})`
  );

  notifyDataChange('invoices', newInvoice);
  return newInvoice;
}

export async function recordInvoicePayment(
  invoiceId: string,
  paymentData: Omit<InvoicePayment, 'id' | 'createdAt'>
): Promise<CustomerInvoice> {
  const all = getStored<CustomerInvoice[]>(INVOICES_KEY, []);
  const invoice = all.find(i => i.id === invoiceId);
  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

  const paymentRecord: InvoicePayment = {
    id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    invoiceId,
    amount: Number(paymentData.amount || 0),
    paymentMethod: paymentData.paymentMethod || 'UPI',
    transactionReference: paymentData.transactionReference || '',
    paymentDate: paymentData.paymentDate || new Date().toISOString(),
    paymentNotes: paymentData.paymentNotes || '',
    recordedBy: paymentData.recordedBy || 'Super Administrator',
    createdAt: new Date().toISOString()
  };

  invoice.payments = [...(invoice.payments || []), paymentRecord];
  invoice.amountPaid = Number((invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0)).toFixed(2));
  invoice.balanceDue = Math.max(0, Number((invoice.totalAmount - invoice.amountPaid).toFixed(2)));

  if (invoice.balanceDue <= 0 && invoice.totalAmount > 0) {
    invoice.paymentStatus = 'paid';
  } else if (invoice.amountPaid > 0) {
    invoice.paymentStatus = 'partially_paid';
  } else {
    invoice.paymentStatus = 'unpaid';
  }

  invoice.updatedAt = new Date().toISOString();
  setStored(INVOICES_KEY, all);

  try {
    await supabase.from('invoices').update({
      amount_paid: invoice.amountPaid,
      balance_due: invoice.balanceDue,
      payment_status: invoice.paymentStatus,
      payments: invoice.payments,
      updated_at: invoice.updatedAt
    }).eq('id', invoiceId);

    await supabase.from('invoice_payments').insert({
      id: paymentRecord.id,
      invoice_id: paymentRecord.invoiceId,
      amount: paymentRecord.amount,
      payment_method: paymentRecord.paymentMethod,
      transaction_reference: paymentRecord.transactionReference,
      payment_date: paymentRecord.paymentDate,
      payment_notes: paymentRecord.paymentNotes,
      recorded_by: paymentRecord.recordedBy,
      created_at: paymentRecord.createdAt
    });
  } catch (err) {
    console.warn('Supabase payment record sync failed:', err);
  }

  // Notify customer
  if (invoice.customerId) {
    await createNotification({
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      applicationId: invoice.applicationId,
      notificationType: 'payment_recorded',
      title: `Payment Received: ₹${paymentRecord.amount.toLocaleString('en-IN')}`,
      message: `Confirmed payment of ₹${paymentRecord.amount.toLocaleString('en-IN')} for invoice ${invoice.invoiceNumber}. Remaining balance: ₹${invoice.balanceDue.toLocaleString('en-IN')}.`,
      deliveryChannel: 'in_app'
    });
  }

  await logActivity(
    'Payment Recorded',
    'invoice',
    invoice.id,
    `Admin recorded payment ₹${paymentRecord.amount} for ${invoice.invoiceNumber}. Balance: ₹${invoice.balanceDue}`
  );

  notifyDataChange('invoices', invoice);
  return invoice;
}

export async function cancelInvoice(invoiceId: string, reason?: string): Promise<CustomerInvoice> {
  const all = getStored<CustomerInvoice[]>(INVOICES_KEY, []);
  const invoice = all.find(i => i.id === invoiceId);
  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

  invoice.paymentStatus = 'cancelled';
  invoice.invoiceStatus = 'cancelled';
  invoice.notes = invoice.notes ? `${invoice.notes}\n[Cancelled]: ${reason || 'Admin cancelled'}` : `[Cancelled]: ${reason || 'Admin cancelled'}`;
  invoice.updatedAt = new Date().toISOString();
  setStored(INVOICES_KEY, all);

  try {
    await supabase.from('invoices').update({
      payment_status: 'cancelled',
      invoice_status: 'cancelled',
      notes: invoice.notes,
      updated_at: invoice.updatedAt
    }).eq('id', invoiceId);
  } catch (err) {
    console.warn('Supabase invoice cancel failed:', err);
  }

  await logActivity(
    'Invoice Cancelled',
    'invoice',
    invoice.id,
    `Admin cancelled invoice ${invoice.invoiceNumber}. Reason: ${reason || 'None'}`
  );

  notifyDataChange('invoices', invoice);
  return invoice;
}

// ==========================================
// 6E. CUSTOMER NOTIFICATIONS API
// ==========================================
export async function getCustomerNotifications(customerId: string): Promise<CustomerNotification[]> {
  try {
    const { data, error } = await supabase
      .from('customer_notifications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const notifs: CustomerNotification[] = data.map((item: any) => ({
        id: item.id,
        customerId: item.customer_id,
        applicationId: item.application_id,
        invoiceId: item.invoice_id,
        notificationType: item.notification_type,
        title: item.title,
        message: item.message,
        deliveryChannel: item.delivery_channel || 'in_app',
        isRead: item.is_read || false,
        createdAt: item.created_at
      }));
      return notifs;
    }
  } catch (err) {
    console.warn('Supabase fetch notifications failed, using cache:', err);
  }

  const all = getStored<CustomerNotification[]>(NOTIFICATIONS_KEY, []);
  return all.filter(n => n.customerId === customerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createNotification(data: Omit<CustomerNotification, 'id' | 'createdAt' | 'isRead'>): Promise<CustomerNotification> {
  const notif: CustomerNotification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...data,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const all = getStored<CustomerNotification[]>(NOTIFICATIONS_KEY, []);
  all.unshift(notif);
  setStored(NOTIFICATIONS_KEY, all);

  try {
    await supabase.from('customer_notifications').insert({
      id: notif.id,
      customer_id: notif.customerId,
      application_id: notif.applicationId,
      invoice_id: notif.invoiceId,
      notification_type: notif.notificationType,
      title: notif.title,
      message: notif.message,
      delivery_channel: notif.deliveryChannel,
      is_read: notif.isRead,
      created_at: notif.createdAt
    });
  } catch (err) {
    console.warn('Supabase insert notification failed:', err);
  }

  notifyDataChange('notifications', notif);
  return notif;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const all = getStored<CustomerNotification[]>(NOTIFICATIONS_KEY, []);
  const n = all.find(item => item.id === id);
  if (n) {
    n.isRead = true;
    setStored(NOTIFICATIONS_KEY, all);
  }

  try {
    await supabase.from('customer_notifications').update({ is_read: true }).eq('id', id);
  } catch (err) {
    console.warn('Supabase mark notification read failed:', err);
  }

  notifyDataChange('notifications');
}

// ==========================================
// 7. WEBSITE CONTENT AND SETTINGS API
// ==========================================
export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const { data, error } = await supabase
      .from('website_content')
      .select('content_data')
      .eq('section_key', 'homepage')
      .single();

    if (!error && data && data.content_data) {
      const content = data.content_data as WebsiteContent;
      setStored(CONTENT_KEY, content);
      return content;
    }
  } catch (err) {
    console.warn('Supabase fetch content failed, using cache:', err);
  }

  return getStored<WebsiteContent>(CONTENT_KEY, INITIAL_WEBSITE_CONTENT);
}

export async function saveWebsiteContent(content: WebsiteContent): Promise<WebsiteContent> {
  const now = new Date().toISOString();
  const updated = { ...content, updatedAt: now };
  setStored(CONTENT_KEY, updated);

  try {
    await supabase.from('website_content').upsert({
      section_key: 'homepage',
      content_data: updated,
      updated_at: now
    });
  } catch (err) {
    console.warn('Supabase website_content upsert failed:', err);
  }

  await logActivity('Website Content Updated', 'content', 'homepage', 'Admin updated website content');
  notifyDataChange('website_content', updated);
  return updated;
}

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .eq('id', 'main_settings')
      .single();

    if (!error && data) {
      const settings: WebsiteSettings = {
        id: data.id,
        siteName: data.site_name || data.siteName,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        address: data.address,
        logoUrl: data.logo_url || data.logoUrl,
        seoTitle: data.seo_title || data.seoTitle,
        seoDescription: data.seo_description || data.seoDescription,
        socialLinks: data.social_links || data.socialLinks || {},
        updatedAt: data.updated_at || data.updatedAt
      };
      setStored(SETTINGS_KEY, settings);
      return settings;
    }
  } catch (err) {
    console.warn('Supabase fetch settings failed, using cache:', err);
  }

  return getStored<WebsiteSettings>(SETTINGS_KEY, INITIAL_WEBSITE_SETTINGS);
}

export async function saveWebsiteSettings(settings: WebsiteSettings): Promise<WebsiteSettings> {
  const now = new Date().toISOString();
  const updated = { ...settings, updatedAt: now };
  setStored(SETTINGS_KEY, updated);

  try {
    await supabase.from('website_settings').upsert({
      id: 'main_settings',
      site_name: updated.siteName,
      phone: updated.phone,
      whatsapp: updated.whatsapp,
      email: updated.email,
      address: updated.address,
      logo_url: updated.logoUrl,
      seo_title: updated.seoTitle,
      seo_description: updated.seoDescription,
      social_links: updated.socialLinks,
      updated_at: now
    });
  } catch (err) {
    console.warn('Supabase website_settings upsert failed:', err);
  }

  await logActivity('Website Settings Updated', 'settings', 'main_settings', 'Admin saved contact info / settings');
  notifyDataChange('website_settings', updated);
  return updated;
}

// ==========================================
// 8. MEDIA ASSETS API
// ==========================================
export async function getMediaAssets(): Promise<MediaAsset[]> {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const media: MediaAsset[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category || 'general',
        url: item.url,
        publicId: item.public_id || item.publicId,
        format: item.format,
        sizeBytes: item.size_bytes || item.sizeBytes,
        createdAt: item.created_at || item.createdAt
      }));
      setStored(MEDIA_KEY, media);
      return media;
    }
  } catch (err) {
    console.warn('Supabase fetch media failed, using cache:', err);
  }

  return getStored<MediaAsset[]>(MEDIA_KEY, [
    {
      id: 'med-1',
      title: 'Official Apply365 Logo',
      category: 'general',
      url: '/apply365_logo.png',
      format: 'png',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'med-2',
      title: 'Hero Approved Banner',
      category: 'banners',
      url: '/hero-approved.png',
      format: 'png',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ]);
}

export async function saveMediaAsset(asset: MediaAsset): Promise<MediaAsset> {
  const all = getStored<MediaAsset[]>(MEDIA_KEY, []);
  all.unshift(asset);
  setStored(MEDIA_KEY, all);

  try {
    await supabase.from('media_assets').insert({
      id: asset.id,
      title: asset.title,
      category: asset.category,
      url: asset.url,
      public_id: asset.publicId,
      format: asset.format,
      size_bytes: asset.sizeBytes,
      created_at: asset.createdAt
    });
  } catch (err) {
    console.warn('Supabase media insert failed:', err);
  }

  await logActivity('Image Uploaded', 'media', asset.id, `Uploaded ${asset.title}`);
  notifyDataChange('media', asset);
  return asset;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const all = getStored<MediaAsset[]>(MEDIA_KEY, []);
  const filtered = all.filter(m => m.id !== id);
  setStored(MEDIA_KEY, filtered);

  try {
    await supabase.from('media_assets').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase media delete failed:', err);
  }

  await logActivity('Image Deleted', 'media', id, `Removed media asset ID: ${id}`);
  notifyDataChange('media');
}

// ==========================================
// 9. ACTIVITY LOGS API
// ==========================================
export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      const logs: ActivityLog[] = data.map((item: any) => ({
        id: item.id,
        adminEmail: item.admin_email || item.adminEmail,
        action: item.action,
        entityType: item.entity_type || item.entityType,
        entityId: item.entity_id || item.entityId,
        details: item.details,
        createdAt: item.created_at || item.createdAt
      }));
      setStored(LOGS_KEY, logs);
      return logs;
    }
  } catch (err) {
    console.warn('Supabase fetch logs failed, using cache:', err);
  }

  return getStored<ActivityLog[]>(LOGS_KEY, [
    {
      id: 'log-1',
      adminEmail: 'admin@apply365.in',
      action: 'System Initialized',
      entityType: 'system',
      details: 'Super Admin Backend & Realtime Synchronization operational',
      createdAt: new Date().toISOString()
    }
  ]);
}

export async function logActivity(action: string, entityType: string, entityId?: string, details?: string): Promise<void> {
  const adminEmail = typeof localStorage !== 'undefined' 
    ? (JSON.parse(localStorage.getItem('apply365_admin_session_v1') || '{}')?.user?.email || 'admin@apply365.in')
    : 'admin@apply365.in';

  const newLog: ActivityLog = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    adminEmail,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString()
  };

  const logs = getStored<ActivityLog[]>(LOGS_KEY, []);
  logs.unshift(newLog);
  if (logs.length > 100) logs.pop();
  setStored(LOGS_KEY, logs);

  try {
    await supabase.from('activity_logs').insert({
      id: newLog.id,
      admin_email: newLog.adminEmail,
      action: newLog.action,
      entity_type: newLog.entityType,
      entity_id: newLog.entityId,
      details: newLog.details,
      created_at: newLog.createdAt
    });
  } catch (err) {
    // Non-blocking log insertion
  }
}
