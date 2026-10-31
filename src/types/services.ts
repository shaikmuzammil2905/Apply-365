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

export interface ServiceDetail {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  accentColor: string;
  badge: string;
  iconName: string;
  documents: ServiceDocument[];
  officialDisclaimer: string;
  benefits: string[];
  processSteps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
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

