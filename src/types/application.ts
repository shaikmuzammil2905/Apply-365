export type DocumentType = 
  | 'aadhaar-front' 
  | 'aadhaar-back' 
  | 'electricity-bill' 
  | 'passport' 
  | 'other';

export type DocumentStatus = 'uploaded' | 'pending' | 'ready';

export interface ApplicationDocument {
  id: string;
  name: string;
  type: DocumentType;
  isReady: boolean;
  status: DocumentStatus;
  fileUrl?: string; // Base64 or Blob URL for preview
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  uploadedAt?: string;
}

export type ApplicationStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Action Required' 
  | 'Completed'
  | 'submitted'
  | 'under_review'
  | 'document_verified'
  | 'processing'
  | 'completed'
  | 'rejected';

export interface AadhaarFormData {
  // Step 1: Customer Details
  fullName: string;
  aadhaarNumber: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  guardianName: string;
  mobile: string;
  email: string;
  isMobileLinked: boolean;
  serviceType: 'address-update' | 'name-correction' | 'dob-update' | 'mobile-linking' | 'new-enrolment';
  
  // Address fields
  doorNo: string;
  street: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pincode: string;

  // Step 3: Specific Request
  specificRequest: string;
  urgency: 'Standard (Within normal timeline)' | 'Urgent (Priority processing)' | 'Immediate Consultation';
  customerRemarks: string;
}

export interface CustomerApplication {
  id: string; // e.g. APP365-AAD-849201
  customerId: string; // Scoped strictly to logged in customer
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  serviceId: string; // 'aadhaar'
  serviceSlug?: string;
  serviceTitle: string;
  serviceType?: string;
  status: ApplicationStatus;
  submissionDate: string;
  createdAt?: string;
  priority?: string;
  formData: any;
  documents: ApplicationDocument[];
  updatedAt: string;
}

