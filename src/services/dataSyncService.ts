import { supabase } from './supabaseClient';
import { Course, Lead, WebsiteSettings, WebsiteContent, MediaAsset, ActivityLog } from '../types/admin';
import { ServiceDetail } from '../types/services';
import { servicesData as initialServicesData } from '../data/servicesData';
import { CustomerApplication } from '../types/application';

// Local Storage Keys for Instant Cache & Fallback
const STORAGE_PREFIX = 'apply365_db_';
const COURSES_KEY = `${STORAGE_PREFIX}courses_v1`;
const SERVICES_KEY = `${STORAGE_PREFIX}services_v1`;
const LEADS_KEY = `${STORAGE_PREFIX}leads_v1`;
const APPLICATIONS_KEY = `${STORAGE_PREFIX}applications_v1`;
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
export async function getServices(): Promise<ServiceDetail[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      const services: ServiceDetail[] = data.map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        shortDescription: item.short_description || item.shortDescription,
        fullDescription: item.full_description || item.fullDescription,
        accentColor: item.accent_color || item.accentColor || '#104A96',
        badge: item.badge || 'Popular',
        iconName: item.icon_name || item.iconName || 'FileText',
        documents: item.documents || [],
        officialDisclaimer: item.official_disclaimer || item.officialDisclaimer || '',
        benefits: item.benefits || [],
        processSteps: item.process_steps || item.processSteps || [],
        faqs: item.faqs || []
      }));
      setStored(SERVICES_KEY, services);
      return services;
    }
  } catch (err) {
    console.warn('Supabase fetch services failed, using cache:', err);
  }

  return getStored<ServiceDetail[]>(SERVICES_KEY, initialServicesData);
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

  try {
    await supabase.from('services').upsert({
      id: service.id,
      slug: service.slug,
      title: service.title,
      short_description: service.shortDescription,
      full_description: service.fullDescription,
      accent_color: service.accentColor,
      badge: service.badge,
      icon_name: service.iconName,
      documents: service.documents,
      official_disclaimer: service.officialDisclaimer,
      benefits: service.benefits,
      process_steps: service.processSteps,
      faqs: service.faqs,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Supabase service upsert failed:', err);
  }

  await logActivity('Service Updated', 'service', service.id, `Admin modified service: ${service.title}`);
  notifyDataChange('services', service);
  return service;
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
