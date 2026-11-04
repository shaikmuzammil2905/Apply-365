export interface ServiceDocument {
  id?: string;
  serviceId?: string;
  name: string;
  shortLabel?: string;
  description?: string;
  instructions?: string;
  category?: string;
  isOptional?: boolean;
  isMandatory?: boolean;
  isActive?: boolean;
  allowMultipleFiles?: boolean;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  minFiles?: number;
  maxFiles?: number;
  displayOrder?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  status?: 'pending' | 'uploaded';
  isReady?: boolean;
}

export interface SubServiceOption {
  id?: string;
  value: string;
  label: string;
  description?: string;
  fees?: number | string;
  price?: number;
  originalPrice?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export type PricingModel = 'subservice_based' | 'service_based' | 'service_plus_fee' | 'free';

export interface ServiceDetail {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  accentColor: string;
  badge: string;
  iconName: string;
  subServices?: SubServiceOption[];
  documents: ServiceDocument[];
  officialDisclaimer: string;
  benefits: string[];
  processSteps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];

  // Dedicated Service Pricing & Fee Configuration
  pricingEnabled?: boolean;
  pricingModel?: PricingModel;
  servicePrice?: number;
  currency?: string;
  priceLabel?: string;
  priceDescription?: string;
  originalPrice?: number;
  discountedPrice?: number;
  additionalFee?: number;
  taxRate?: number;
}

export interface ApplicationFormData {
  serviceId: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  email?: string;
  preferredLanguage: string;
  cityTown: string;
  additionalMessage?: string;
  confirmedDocuments: string[];
  agreePrivacy: boolean;
}

