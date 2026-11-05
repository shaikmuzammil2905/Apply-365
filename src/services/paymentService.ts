import { PaymentSettings, PaymentSubmission, PaymentAuditLog, PaymentVerificationStatus } from '../types/payment';
export type { PaymentSettings, PaymentSubmission, PaymentAuditLog, PaymentVerificationStatus } from '../types/payment';
import { supabase } from './supabaseClient';
import { saveApplication, getStoredApplications } from './dbService';
import { createInvoice, recordInvoicePayment, getInvoices } from './dataSyncService';

const SETTINGS_KEY = 'apply365_upi_settings_v1';
const SUBMISSIONS_KEY = 'apply365_upi_submissions_v1';
const AUDIT_LOGS_KEY = 'apply365_upi_audit_v1';

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: '9346801736@ybl',
  beneficiaryName: 'KATIKAM JAYANTH',
  accountHolderName: 'KATIKAM JAYANTH',
  qrImageUrl: '/payment/phonepe_qr.jpg',
  qrCodeImageUrl: '/payment/phonepe_qr.jpg',
  paymentInstructions: '1. Scan the PhonePe QR code using PhonePe, GPay, Paytm or any UPI App.\n2. Verify the recipient name is KATIKAM JAYANTH before paying.\n3. Pay the exact order amount.\n4. Enter the 12-digit UTR/Ref number and upload your payment confirmation screenshot below for admin verification.',
  isEnabled: true,
  isUpiEnabled: true,
  currency: '₹',
  updatedAt: new Date().toISOString()
};

function normalizeSettings(s: PaymentSettings): PaymentSettings {
  const name = s.accountHolderName || s.beneficiaryName || 'KATIKAM JAYANTH';
  const qr = s.qrCodeImageUrl || s.qrImageUrl || '/payment/phonepe_qr.jpg';
  const enabled = s.isUpiEnabled !== undefined ? s.isUpiEnabled : (s.isEnabled !== undefined ? s.isEnabled : true);
  return {
    ...s,
    beneficiaryName: name,
    accountHolderName: name,
    qrImageUrl: qr,
    qrCodeImageUrl: qr,
    isEnabled: enabled,
    isUpiEnabled: enabled
  };
}

function normalizeSubmission(s: any): PaymentSubmission {
  const amt = Number(s.paidAmount || s.amount || s.expectedAmount || 50);
  const st = s.status || s.verificationStatus || 'PENDING_VERIFICATION';
  const title = s.serviceTitle || s.serviceName || 'Statutory Application';
  return {
    ...s,
    amount: amt,
    paidAmount: amt,
    expectedAmount: Number(s.expectedAmount || amt),
    status: st,
    verificationStatus: st,
    serviceTitle: title,
    serviceName: title
  };
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`LocalStorage write warning for ${key}:`, err);
  }
}

function notifyPaymentChange(): void {
  try {
    window.dispatchEvent(new CustomEvent('apply365_payment_sync'));
    window.dispatchEvent(new CustomEvent('apply365_data_sync'));
  } catch {}
}

// =========================================================================
// 1. PAYMENT SETTINGS
// =========================================================================

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const settings: PaymentSettings = normalizeSettings({
        id: data.id,
        upiId: data.upi_id || DEFAULT_PAYMENT_SETTINGS.upiId,
        beneficiaryName: data.beneficiary_name || DEFAULT_PAYMENT_SETTINGS.beneficiaryName,
        qrImageUrl: data.qr_image_path || DEFAULT_PAYMENT_SETTINGS.qrImageUrl,
        paymentInstructions: data.payment_instructions || DEFAULT_PAYMENT_SETTINGS.paymentInstructions,
        isEnabled: data.is_enabled !== undefined ? Boolean(data.is_enabled) : DEFAULT_PAYMENT_SETTINGS.isEnabled,
        currency: data.currency || '₹',
        updatedAt: data.updated_at
      });
      setStored(SETTINGS_KEY, settings);
      return settings;
    }
  } catch (err) {
    console.warn('Supabase payment_settings fetch failed, using local cache:', err);
  }

  return normalizeSettings(getStored<PaymentSettings>(SETTINGS_KEY, DEFAULT_PAYMENT_SETTINGS));
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<PaymentSettings> {
  const now = new Date().toISOString();
  const updated: PaymentSettings = normalizeSettings({
    ...settings,
    updatedAt: now
  });
  setStored(SETTINGS_KEY, updated);

  try {
    await supabase.from('payment_settings').upsert({
      id: settings.id || 'default_upi_settings',
      upi_id: updated.upiId,
      beneficiary_name: updated.beneficiaryName,
      qr_image_path: updated.qrImageUrl,
      payment_instructions: updated.paymentInstructions,
      is_enabled: updated.isEnabled,
      updated_at: now
    });
  } catch (err) {
    console.warn('Supabase payment_settings save error, cached locally:', err);
  }

  notifyPaymentChange();
  return updated;
}

// =========================================================================
// 2. PAYMENT SUBMISSIONS & PROOF MANAGEMENT
// =========================================================================

export async function getPaymentSubmissions(): Promise<PaymentSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('payment_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: PaymentSubmission[] = data.map((item: any) => normalizeSubmission({
        id: item.id,
        orderId: item.order_id,
        applicationId: item.application_id || item.order_id,
        customerId: item.user_id || item.customer_id,
        customerName: item.customer_name,
        customerEmail: item.customer_email,
        customerMobile: item.customer_mobile,
        serviceId: item.service_id,
        serviceTitle: item.service_title,
        serviceType: item.service_type,
        expectedAmount: Number(item.expected_amount || item.paid_amount || 0),
        paidAmount: Number(item.paid_amount || 0),
        utrNumber: item.utr_number,
        screenshotUrl: item.screenshot_path,
        paymentDate: item.payment_date || item.submitted_at,
        status: (item.payment_status || 'PENDING_VERIFICATION') as PaymentVerificationStatus,
        submittedAt: item.submitted_at,
        verifiedAt: item.verified_at,
        verifiedBy: item.verified_by,
        adminNotes: item.admin_note,
        rejectionReason: item.rejection_reason,
        serviceActivated: Boolean(item.service_activated)
      }));
      setStored(SUBMISSIONS_KEY, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase payment_submissions fetch failed, using local cache:', err);
  }

  const local = getStored<PaymentSubmission[]>(SUBMISSIONS_KEY, []);
  return local.map(normalizeSubmission);
}

export async function getPaymentSubmissionsByCustomerId(customerId: string): Promise<PaymentSubmission[]> {
  const all = await getPaymentSubmissions();
  return all.filter(s => s.customerId === customerId);
}

export async function submitPaymentProof(
  submissionData: Omit<PaymentSubmission, 'id' | 'status' | 'submittedAt' | 'amount'> & { amount?: number }
): Promise<PaymentSubmission> {
  const all = getStored<PaymentSubmission[]>(SUBMISSIONS_KEY, []);

  // Duplicate UTR prevention check
  const trimmedUtr = submissionData.utrNumber.trim();
  const existingUtr = all.find(
    s => s.utrNumber.trim() === trimmedUtr && s.status !== 'REJECTED'
  );
  if (existingUtr && existingUtr.orderId !== submissionData.orderId) {
    throw new Error(`This UPI UTR / Transaction Reference Number (${trimmedUtr}) has already been submitted for another order (${existingUtr.orderId}). Duplicate submissions are blocked.`);
  }

  const now = new Date().toISOString();
  const id = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const newSubmission: PaymentSubmission = normalizeSubmission({
    ...submissionData,
    id,
    amount: submissionData.amount ?? submissionData.paidAmount,
    paidAmount: submissionData.paidAmount,
    expectedAmount: submissionData.expectedAmount,
    utrNumber: trimmedUtr,
    status: 'PENDING_VERIFICATION',
    submittedAt: now,
    serviceActivated: false
  });

  // Check if an existing submission exists for this order (replace or append)
  const existingIdx = all.findIndex(s => s.orderId === submissionData.orderId);
  if (existingIdx >= 0) {
    all[existingIdx] = newSubmission;
  } else {
    all.unshift(newSubmission);
  }
  setStored(SUBMISSIONS_KEY, all);

  // Sync to Supabase
  try {
    await supabase.from('payment_submissions').upsert({
      id: newSubmission.id,
      order_id: newSubmission.orderId,
      application_id: newSubmission.applicationId || newSubmission.orderId,
      user_id: newSubmission.customerId,
      customer_name: newSubmission.customerName,
      customer_email: newSubmission.customerEmail,
      customer_mobile: newSubmission.customerMobile,
      service_id: newSubmission.serviceId,
      service_title: newSubmission.serviceTitle,
      service_type: newSubmission.serviceType,
      expected_amount: newSubmission.expectedAmount,
      paid_amount: newSubmission.paidAmount,
      utr_number: newSubmission.utrNumber,
      screenshot_path: newSubmission.screenshotUrl,
      payment_date: newSubmission.paymentDate,
      payment_status: 'PENDING_VERIFICATION',
      submitted_at: now
    });
  } catch (err) {
    console.warn('Supabase payment submission upsert error, saved locally:', err);
  }

  // Record Audit Log
  await logPaymentAudit({
    submissionId: newSubmission.id,
    orderId: newSubmission.orderId,
    action: 'SUBMITTED',
    previousStatus: 'NONE',
    newStatus: 'PENDING_VERIFICATION',
    adminName: newSubmission.customerName + ' (Customer Submission)',
    notes: `Customer submitted payment proof for ₹${newSubmission.paidAmount}. UTR: ${newSubmission.utrNumber}`
  });

  notifyPaymentChange();
  return newSubmission;
}

// =========================================================================
// 3. ADMIN VERIFICATION & SERVICE ACTIVATION ACTIONS
// =========================================================================

export async function verifyPaymentSubmission(
  submissionId: string,
  action: 'APPROVE' | 'REJECT' | 'RESUBMIT',
  options?: {
    adminName: string;
    adminId?: string;
    reason?: string;
    notes?: string;
  } | string,
  maybeReason?: string
): Promise<PaymentSubmission> {
  const opts = typeof options === 'string'
    ? { adminName: options, reason: maybeReason, notes: maybeReason }
    : (options || { adminName: 'Super Administrator' });

  const all = getStored<PaymentSubmission[]>(SUBMISSIONS_KEY, []);
  const idx = all.findIndex(s => s.id === submissionId);
  if (idx < 0) {
    throw new Error('Payment submission record not found.');
  }

  const current = all[idx];
  const prevStatus = current.status;
  const now = new Date().toISOString();

  let newStatus: PaymentVerificationStatus = current.status;
  let serviceActivated = current.serviceActivated || false;

  if (action === 'APPROVE') {
    newStatus = 'APPROVED';
    serviceActivated = true;
  } else if (action === 'REJECT') {
    newStatus = 'REJECTED';
    serviceActivated = false;
  } else if (action === 'RESUBMIT') {
    newStatus = 'RESUBMISSION_REQUESTED';
    serviceActivated = false;
  }

  const updated: PaymentSubmission = normalizeSubmission({
    ...current,
    status: newStatus,
    verificationStatus: newStatus,
    verifiedAt: now,
    verifiedBy: opts.adminName,
    adminNotes: opts.notes || opts.reason,
    rejectionReason: action === 'REJECT' ? opts.reason : undefined,
    serviceActivated
  });

  all[idx] = updated;
  setStored(SUBMISSIONS_KEY, all);

  // Sync update to Supabase
  try {
    await supabase.from('payment_submissions').update({
      payment_status: newStatus,
      verified_at: now,
      verified_by: opts.adminName,
      admin_note: opts.notes || opts.reason,
      rejection_reason: action === 'REJECT' ? opts.reason : null,
      service_activated: serviceActivated
    }).eq('id', submissionId);
  } catch (err) {
    console.warn('Supabase update submission error:', err);
  }

  // =========================================================================
  // AUTOMATIC SERVICE ACTIVATION & INVOICE GENERATION ON APPROVAL
  // =========================================================================
  if (action === 'APPROVE') {
    try {
      // 1. Locate and update the customer application
      const apps = getStoredApplications();
      const targetApp = apps.find(a => a.id === updated.orderId || a.id === updated.applicationId);
      if (targetApp) {
        const activatedApp = {
          ...targetApp,
          status: 'application_received' as const,
          paymentStatus: 'payment_completed',
          paymentAmount: updated.paidAmount,
          paymentTransactionId: updated.utrNumber,
          paymentMethod: 'UPI (PhonePe Manual QR)',
          paymentDate: updated.paymentDate || now,
          updatedAt: now
        };
        await saveApplication(activatedApp);
      }

      // 2. Auto-generate or mark Invoice as PAID
      const invoices = await getInvoices();
      const existingInv = invoices.find(i => i.applicationId === updated.orderId || i.id === updated.orderId);

      if (existingInv) {
        await recordInvoicePayment(existingInv.id, {
          invoiceId: existingInv.id,
          amount: updated.paidAmount,
          paymentMethod: 'UPI',
          transactionReference: updated.utrNumber,
          paymentDate: updated.paymentDate || now,
          recordedBy: `${opts.adminName} (UPI Manual Verification)`,
          paymentNotes: `PhonePe QR payment verified & approved. UTR: ${updated.utrNumber}`
        });
      } else {
        await createInvoice({
          applicationId: updated.orderId,
          customerId: updated.customerId,
          customerName: updated.customerName,
          customerEmail: updated.customerEmail,
          customerMobile: updated.customerMobile,
          serviceName: updated.serviceTitle,
          invoiceDate: now.slice(0, 10),
          dueDate: now.slice(0, 10),
          items: [
            {
              id: `item-${Date.now()}`,
              description: `${updated.serviceTitle} — Statutory Facilitation Fee`,
              quantity: 1,
              unitPrice: updated.paidAmount,
              total: updated.paidAmount
            }
          ],
          subtotal: updated.paidAmount,
          taxAmount: 0,
          discount: 0,
          taxRate: 0,
          totalAmount: updated.paidAmount,
          amountPaid: updated.paidAmount,
          balanceDue: 0,
          paymentStatus: 'paid',
          invoiceStatus: 'finalized',
          payments: [
            {
              id: `pay_${Date.now()}`,
              amount: updated.paidAmount,
              paymentDate: now.slice(0, 10),
              paymentMethod: 'UPI',
              transactionReference: updated.utrNumber,
              recordedBy: `${opts.adminName} (Admin Approval)`,
              notes: `UPI/PhonePe QR payment verified. UTR: ${updated.utrNumber}`
            }
          ],
          notes: `Official Apply-365 payment receipt. Transaction verified via UPI (${updated.utrNumber}).`
        });
      }
    } catch (actErr) {
      console.error('Service auto-activation error:', actErr);
    }
  }

  // Log Audit Action
  await logPaymentAudit({
    submissionId: updated.id,
    orderId: updated.orderId,
    action: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'RESUBMISSION_REQUESTED',
    previousStatus: prevStatus,
    newStatus,
    adminName: opts.adminName,
    adminId: opts.adminId,
    reason: opts.reason,
    notes: opts.notes
  });

  notifyPaymentChange();
  return updated;
}

// =========================================================================
// 4. AUDIT LOGS
// =========================================================================

export async function logPaymentAudit(data: Omit<PaymentAuditLog, 'id' | 'timestamp'>): Promise<void> {
  const logs = getStored<PaymentAuditLog[]>(AUDIT_LOGS_KEY, []);
  const entry: PaymentAuditLog = {
    ...data,
    id: `LOG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(entry);
  setStored(AUDIT_LOGS_KEY, logs.slice(0, 200)); // Keep latest 200 logs
}

export function getPaymentAuditLogs(orderId?: string): PaymentAuditLog[] {
  const logs = getStored<PaymentAuditLog[]>(AUDIT_LOGS_KEY, []);
  return orderId ? logs.filter(l => l.orderId === orderId) : logs;
}
