import { ServiceDetail } from './services';
import { CustomerApplication } from './application';

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  thumbnailUrl?: string;
  duration: string;
  price: string;
  features: string[];
  eligibility: string;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

export type LeadType = 
  | 'course_enquiry'
  | 'course_application'
  | 'service_enquiry'
  | 'aadhaar_request'
  | 'pan_request'
  | 'voter_request'
  | 'callback_request'
  | 'contact_form';

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'in_progress'
  | 'waiting_for_customer'
  | 'converted'
  | 'closed'
  | 'rejected';

export interface LeadAttachment {
  name: string;
  url: string;
  type: string;
  sizeBytes?: number;
  size?: string;
}

export interface Lead {
  id: string;
  customerName: string;
  mobile: string;
  email?: string;
  leadType: LeadType;
  targetId?: string;
  targetTitle?: string;
  message?: string;
  status: LeadStatus;
  attachments?: LeadAttachment[];
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayBusinessHours {
  isOpen: boolean;
  openTime: string; // e.g. "09:00"
  closeTime: string; // e.g. "19:00"
}

export interface BusinessHoursConfig {
  timezone: string; // default "Asia/Kolkata"
  isTemporarilyClosed?: boolean;
  temporaryClosureReason?: string;
  specialHolidayNote?: string;
  monday: DayBusinessHours;
  tuesday: DayBusinessHours;
  wednesday: DayBusinessHours;
  thursday: DayBusinessHours;
  friday: DayBusinessHours;
  saturday: DayBusinessHours;
  sunday: DayBusinessHours;
}

export interface ContactVisibilitySettings {
  showTaglineHeader: boolean;
  showTaglineFooter: boolean;
  showTaglinePortal: boolean;
  showTaglineInvoice: boolean;
  showCallButton: boolean;
  showWhatsAppButton: boolean;
  showAlternatePhone: boolean;
}

export interface WebsiteSettings {
  id?: string;
  siteName: string;
  tagline?: string;
  phone: string;
  alternatePhone?: string;
  whatsapp: string;
  customerSupportPhone?: string;
  email: string;
  supportEmail?: string;
  customerServiceEmail?: string;
  address: string;
  logoUrl: string;
  seoTitle: string;
  seoDescription: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    extraSettings?: any;
  };
  businessHours?: BusinessHoursConfig;
  contactVisibility?: ContactVisibilitySettings;
  applicationFee?: number;
  requirePaymentBeforeApply?: boolean;
  paymentGateway?: {
    provider: 'razorpay';
    keyId: string;
    keySecret?: string;
    isEnabled: boolean;
    isTestMode: boolean;
    merchantName?: string;
    themeColor?: string;
  };
  updatedAt: string;
}

export interface WebsiteContent {
  hero: {
    badge: string;
    headlinePart1: string;
    headlinePart2: string;
    description: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    bannerImage?: string;
  };
  trustIndicators: Array<{
    title: string;
    description?: string;
    icon?: string;
  }>;
  aboutSection: {
    title: string;
    subtitle: string;
    content: string;
    yearsOfExcellence: string;
    satisfiedClients: string;
  };
  contactSection: {
    supportHeading: string;
    supportSubheading: string;
    operatingHours: string;
  };
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  category: 'courses' | 'services' | 'banners' | 'documents' | 'general';
  url: string;
  publicId?: string;
  format?: string;
  sizeBytes?: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'editor' | 'moderator';
  isActive: boolean;
  createdAt?: string;
}

