import { CheckoutOrder, CheckoutState, CheckoutPaymentProof } from '../types/checkout';
import { submitPaymentProof } from './paymentService';
import { saveApplication } from './dbService';
import { saveNewApplication } from './dataSyncService';
import { CustomerApplication } from '../types/application';

const CHECKOUT_STORAGE_KEY = 'apply365_active_checkout_v2';

export function getActiveCheckout(): CheckoutOrder | null {
  try {
    const rawSession = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (rawSession) {
      return JSON.parse(rawSession);
    }
    const rawLocal = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (rawLocal) {
      return JSON.parse(rawLocal);
    }
  } catch (err) {
    console.warn('Error reading active checkout from storage:', err);
  }
  return null;
}

export function setActiveCheckout(order: CheckoutOrder): void {
  try {
    const serialized = JSON.stringify(order);
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, serialized);
    localStorage.setItem(CHECKOUT_STORAGE_KEY, serialized);
    window.dispatchEvent(new CustomEvent('apply365_checkout_sync', { detail: order }));
  } catch (err) {
    console.warn('Error saving active checkout to storage:', err);
  }
}

export function updateCheckoutState(state: CheckoutState, extraUpdates?: Partial<CheckoutOrder>): CheckoutOrder | null {
  const current = getActiveCheckout();
  if (!current) return null;

  const updated: CheckoutOrder = {
    ...current,
    ...extraUpdates,
    state,
    updatedAt: new Date().toISOString()
  };

  setActiveCheckout(updated);
  return updated;
}

export function clearActiveCheckout(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('apply365_checkout_sync', { detail: null }));
  } catch {}
}

export interface CreateCheckoutOrderParams {
  orderId?: string;
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  serviceDescription?: string;
  serviceType?: string;
  originalPrice: number;
  discount?: number;
  payableAmount: number;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  formData?: Record<string, any>;
  documents?: any[];
}

export function createCheckoutOrder(params: CreateCheckoutOrderParams): CheckoutOrder {
  const prefix = params.serviceSlug.slice(0, 3).toUpperCase() || 'SRV';
  const orderId = params.orderId || `APP365-${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const newOrder: CheckoutOrder = {
    orderId,
    applicationId: orderId,
    customerId: params.customerId || `guest_${Date.now()}`,
    customerName: params.customerName || 'Customer',
    customerEmail: params.customerEmail || 'applyallservices365@gmail.com',
    customerMobile: params.customerMobile || '9121992365',
    serviceId: params.serviceId,
    serviceSlug: params.serviceSlug,
    serviceTitle: params.serviceTitle,
    serviceDescription: params.serviceDescription || `Application and statutory facilitation for ${params.serviceTitle}.`,
    serviceType: params.serviceType || 'Standard',
    originalPrice: params.originalPrice,
    discount: params.discount || 0,
    payableAmount: params.payableAmount,
    state: 'ORDER_CREATED',
    createdAt: now,
    updatedAt: now,
    formData: params.formData,
    documents: params.documents
  };

  setActiveCheckout(newOrder);

  // Sync initial application record into DB so it is tracked
  const initialApp: CustomerApplication = {
    id: orderId,
    customerId: newOrder.customerId,
    customerName: newOrder.customerName,
    customerEmail: newOrder.customerEmail,
    customerMobile: newOrder.customerMobile,
    serviceId: newOrder.serviceId,
    serviceSlug: newOrder.serviceSlug,
    serviceTitle: newOrder.serviceTitle,
    serviceType: newOrder.serviceType,
    status: 'Submitted',
    paymentStatus: 'payment_pending',
    paymentAmount: newOrder.payableAmount,
    submissionDate: now,
    createdAt: now,
    updatedAt: now,
    formData: (params.formData as any) || {},
    documents: (params.documents as any) || []
  };

  saveApplication(initialApp).catch(console.warn);
  saveNewApplication(initialApp).catch(console.warn);

  return newOrder;
}

/**
 * Route Guard: Determine if the customer is authorized to see /payment-status
 * Strictly BLOCKS if order is null or in ORDER_CREATED / PAYMENT_REQUIRED states.
 */
export function canAccessPaymentStatus(order?: CheckoutOrder | null): boolean {
  const target = order !== undefined ? order : getActiveCheckout();
  if (!target) return false;

  const validStatuses: CheckoutState[] = [
    'PAYMENT_PROOF_SUBMITTED',
    'PENDING_VERIFICATION',
    'APPROVED',
    'REJECTED',
    'RESUBMISSION_REQUIRED'
  ];

  return validStatuses.includes(target.state);
}

export interface SubmitPaymentProofParams {
  utrNumber: string;
  screenshotUrl: string;
  screenshotFileName?: string;
  screenshotFileSize?: string;
  paymentDate?: string;
  paidAmount?: number;
}

export async function submitCheckoutPaymentProof(params: SubmitPaymentProofParams): Promise<CheckoutOrder> {
  const active = getActiveCheckout();
  if (!active) {
    throw new Error('No active order found. Please select a service and proceed to checkout.');
  }

  const cleanUtr = (params.utrNumber || '').trim();
  if (!cleanUtr) {
    throw new Error('Please enter the 12-digit UPI Transaction ID / UTR Number.');
  }

  if (cleanUtr.length < 8) {
    throw new Error('Invalid UTR / Transaction ID. Most UPI UTR numbers are 12 digits.');
  }

  if (!params.screenshotUrl) {
    throw new Error('Payment confirmation screenshot is required.');
  }

  const now = new Date().toISOString();
  const paymentDate = params.paymentDate || now.slice(0, 10);
  const paidAmount = params.paidAmount ?? active.payableAmount;

  // 1. Submit to UPI payment verification queue
  await submitPaymentProof({
    orderId: active.orderId,
    applicationId: active.applicationId,
    customerId: active.customerId,
    customerName: active.customerName,
    customerEmail: active.customerEmail,
    customerMobile: active.customerMobile,
    serviceId: active.serviceId,
    serviceTitle: active.serviceTitle,
    serviceType: active.serviceType,
    expectedAmount: active.payableAmount,
    paidAmount,
    utrNumber: cleanUtr,
    screenshotUrl: params.screenshotUrl,
    screenshotFileName: params.screenshotFileName || 'screenshot.jpg',
    screenshotFileSize: params.screenshotFileSize,
    paymentDate
  });

  // 2. Update Application in DB to Under Review (Payment Pending Verification)
  const updatedApp: CustomerApplication = {
    id: active.orderId,
    customerId: active.customerId,
    customerName: active.customerName,
    customerEmail: active.customerEmail,
    customerMobile: active.customerMobile,
    serviceId: active.serviceId,
    serviceSlug: active.serviceSlug,
    serviceTitle: active.serviceTitle,
    serviceType: active.serviceType,
    status: 'Under Review',
    paymentStatus: 'payment_pending',
    paymentAmount: paidAmount,
    paymentTransactionId: cleanUtr,
    paymentMethod: 'UPI (PhonePe Manual QR)',
    paymentDate,
    submissionDate: active.createdAt,
    createdAt: active.createdAt,
    updatedAt: now,
    formData: active.formData as any,
    documents: active.documents as any
  };

  await saveApplication(updatedApp);
  await saveNewApplication(updatedApp);

  // 3. Update active checkout state machine: PAYMENT_PROOF_SUBMITTED -> PENDING_VERIFICATION
  const proof: CheckoutPaymentProof = {
    utrNumber: cleanUtr,
    screenshotUrl: params.screenshotUrl,
    screenshotFileName: params.screenshotFileName,
    screenshotFileSize: params.screenshotFileSize,
    paymentDate,
    paidAmount,
    submittedAt: now
  };

  const completedOrder: CheckoutOrder = {
    ...active,
    state: 'PENDING_VERIFICATION',
    paymentProof: proof,
    updatedAt: now
  };

  setActiveCheckout(completedOrder);
  return completedOrder;
}

