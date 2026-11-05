export type CheckoutState =
  | 'SERVICE_SELECTED'
  | 'ORDER_CREATED'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_PROOF_SUBMITTED'
  | 'PENDING_VERIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUIRED';

export interface CheckoutPaymentProof {
  utrNumber: string;
  screenshotUrl: string;
  screenshotFileName?: string;
  screenshotFileSize?: string;
  paymentDate: string;
  paidAmount: number;
  submittedAt: string;
}

export interface CheckoutOrder {
  orderId: string;
  applicationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  serviceDescription?: string;
  serviceType: string;
  originalPrice: number;
  discount: number;
  payableAmount: number;
  state: CheckoutState;
  createdAt: string;
  updatedAt: string;
  paymentProof?: CheckoutPaymentProof;
  adminRemarks?: string;
  formData?: Record<string, any>;
  documents?: any[];
}

