export type PaymentVerificationStatus = 
  | 'PENDING_VERIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUIRED'
  | 'RESUBMISSION_REQUESTED';

export interface PaymentSettings {
  id?: string;
  upiId: string; // e.g. "9346801736@ybl"
  beneficiaryName: string; // e.g. "KATIKAM JAYANTH"
  accountHolderName?: string; // alias for beneficiaryName
  qrImageUrl: string; // URL or base64 of PhonePe/UPI QR image
  qrCodeImageUrl?: string; // alias for qrImageUrl
  paymentInstructions: string;
  isEnabled: boolean;
  isUpiEnabled?: boolean; // alias for isEnabled
  minAmount?: number;
  currency?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PaymentSubmission {
  id: string; // e.g. "PAY-2026-948201"
  orderId: string; // e.g. "AP365-2026-00001" or Application ID
  applicationId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  serviceId: string;
  serviceTitle: string;
  serviceName?: string; // alias for serviceTitle
  serviceType?: string;
  expectedAmount: number;
  paidAmount: number;
  amount: number; // alias for paidAmount
  utrNumber: string; // 12-digit UPI reference / UTR
  screenshotUrl: string; // Base64 data URL or storage URL
  screenshotFileName?: string;
  screenshotFileSize?: string;
  paymentDate: string; // ISO date string or YYYY-MM-DD
  status: PaymentVerificationStatus;
  verificationStatus?: PaymentVerificationStatus; // alias for status
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  serviceActivated?: boolean;
}

export interface PaymentAuditLog {
  id: string;
  submissionId: string;
  orderId: string;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUESTED';
  previousStatus: string;
  newStatus: string;
  adminName: string;
  adminId?: string;
  notes?: string;
  reason?: string;
  timestamp: string;
}
