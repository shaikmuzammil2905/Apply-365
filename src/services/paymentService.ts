import { PaymentSettings, PaymentSubmission, PaymentAuditLog, PaymentVerificationStatus } from '../types/payment';
export type { PaymentSettings, PaymentSubmission, PaymentVerificationStatus } from '../types/payment';
import { supabase } from './supabaseClient';
import { saveApplication, getStoredApplications } from './dbService';
import { createInvoice, recordInvoicePayment, getInvoices, getAllApplications } from './dataSyncService';

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

function normalizeSettings(s: Partial<PaymentSettings> = {}): PaymentSettings {
  const name = s.accountHolderName || s.beneficiaryName || DEFAULT_PAYMENT_SETTINGS.beneficiaryName;
  const qr = s.qrCodeImageUrl || s.qrImageUrl || DEFAULT_PAYMENT_SETTINGS.qrImageUrl;
  const enabled = s.isUpiEnabled !== undefined ? Boolean(s.isUpiEnabled) : (s.isEnabled !== undefined ? Boolean(s.isEnabled) : true);
  return {
    ...DEFAULT_PAYMENT_SETTINGS,
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
    id: s.id || `PAY-${Date.now().toString().slice(-6)}`,
    orderId: s.orderId || s.order_id || s.id,
    applicationId: s.applicationId || s.application_id || s.orderId || s.id,
    customerId: s.customerId || s.user_id || s.customer_id || 'guest',
    customerName: s.customerName || s.customer_name || 'Customer',
    customerEmail: s.customerEmail || s.customer_email || 'applyallservices365@gmail.com',
    customerMobile: s.customerMobile || s.customer_mobile || '9121992365',
    serviceId: s.serviceId || s.service_id || 'srv_gen',
    serviceTitle: title,
    serviceName: title,
    serviceType: s.serviceType || s.service_type || 'Standard',
    amount: amt,
    paidAmount: amt,
    expectedAmount: Number(s.expectedAmount || s.expected_amount || amt),
    utrNumber: (s.utrNumber || s.utr_number || '').trim(),
    screenshotUrl: s.screenshotUrl || s.screenshot_path || '',
    screenshotFileName: s.screenshotFileName || s.screenshot_file_name || 'screenshot.jpg',
    screenshotFileSize: s.screenshotFileSize || s.screenshot_file_size || '',
    paymentDate: s.paymentDate || s.payment_date || s.submittedAt || s.submitted_at || new Date().toISOString().slice(0, 10),
    status: st as PaymentVerificationStatus,
    verificationStatus: st as PaymentVerificationStatus,
    submittedAt: s.submittedAt || s.submitted_at || new Date().toISOString(),
    verifiedAt: s.verifiedAt || s.verified_at,
    verifiedBy: s.verifiedBy || s.verified_by,
    adminNotes: s.adminNotes || s.admin_notes || s.admin_note,
    rejectionReason: s.rejectionReason || s.rejection_reason,
    serviceActivated: Boolean(s.serviceActivated || s.service_activated || st === 'APPROVED')
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
  // 1. Try dedicated payment_settings table
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const settings = normalizeSettings({
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
    // Continue to fallback
  }

  // 2. Try website_content table (which always exists in Supabase)
  try {
    const { data: contentData, error: contentErr } = await supabase
      .from('website_content')
      .select('*')
      .eq('section_key', 'upi_payment_settings')
      .maybeSingle();

    if (!contentErr && contentData && contentData.content_data) {
      const parsed = normalizeSettings(contentData.content_data);
      setStored(SETTINGS_KEY, parsed);
      return parsed;
    }
  } catch (err) {
    // Continue to local cache
  }

  // 3. Fall back to local storage
  return normalizeSettings(getStored<PaymentSettings>(SETTINGS_KEY, DEFAULT_PAYMENT_SETTINGS));
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<PaymentSettings> {
  const now = new Date().toISOString();
  const updated: PaymentSettings = normalizeSettings({
    ...settings,
    updatedAt: now
  });
  setStored(SETTINGS_KEY, updated);

  // 1. Upsert to website_content table (100% supported with anon full access)
  try {
    await supabase.from('website_content').upsert({
      section_key: 'upi_payment_settings',
      content_data: updated,
      updated_at: now
    });
  } catch (err) {
    console.warn('Supabase website_content upsert error:', err);
  }

  // 2. Upsert to payment_settings table if it exists
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
    // Non-fatal if table not yet migrated
  }

  notifyPaymentChange();
  return updated;
}

// =========================================================================
// 2. PAYMENT SUBMISSIONS & PROOF MANAGEMENT
// =========================================================================

export async function getPaymentSubmissions(): Promise<PaymentSubmission[]> {
  const mergedMap = new Map<string, PaymentSubmission>();

  // A. Local storage cached submissions
  const localSubs = getStored<PaymentSubmission[]>(SUBMISSIONS_KEY, []);
  localSubs.forEach(s => {
    if (s && (s.id || s.orderId)) {
      const key = s.orderId || s.id;
      mergedMap.set(key, normalizeSubmission(s));
    }
  });

  // B. Query dedicated payment_submissions table (if present in Supabase)
  try {
    const { data, error } = await supabase
      .from('payment_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      data.forEach((item: any) => {
        const sub = normalizeSubmission({
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
          status: item.payment_status || 'PENDING_VERIFICATION',
          submittedAt: item.submitted_at,
          verifiedAt: item.verified_at,
          verifiedBy: item.verified_by,
          adminNotes: item.admin_note,
          rejectionReason: item.rejection_reason,
          serviceActivated: Boolean(item.service_activated)
        });
        const key = sub.orderId || sub.id;
        mergedMap.set(key, sub);
      });
    }
  } catch (err) {
    // Continue to synthesize from applications
  }

  // C. Query public.applications table (which is actively working in Supabase)
  try {
    const { data: apps, error: appsErr } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!appsErr && Array.isArray(apps)) {
      apps.forEach((app: any) => {
        const paymentMeta = app.form_data?._payment || {};
        
        // Find screenshot in documents array if not directly in _payment
        let screenshotUrl = paymentMeta.screenshotUrl || '';
        let screenshotFileName = paymentMeta.screenshotFileName || '';
        let screenshotFileSize = paymentMeta.screenshotFileSize || '';
        
        if (!screenshotUrl && Array.isArray(app.documents)) {
          const docProof = app.documents.find((d: any) => 
            d.id?.includes('screenshot') || 
            d.id?.includes('proof') || 
            d.name?.toLowerCase().includes('payment') || 
            d.name?.toLowerCase().includes('screenshot') ||
            d.type === 'proof'
          );
          if (docProof) {
            screenshotUrl = docProof.url || '';
            screenshotFileName = docProof.name || '';
          }
        }

        const utr = (paymentMeta.utrNumber || paymentMeta.txnId || app.payment_transaction_id || '').trim();
        const amt = Number(paymentMeta.paidAmount || paymentMeta.amount || app.payment_amount || 50);

        // Normalize Status
        let derivedStatus: PaymentVerificationStatus = 'PENDING_VERIFICATION';
        const rawStatus = (paymentMeta.status || app.status || '').toUpperCase();
        if (rawStatus.includes('APPROV') || rawStatus === 'COMPLETED' || rawStatus === 'DOCUMENT_VERIFIED') {
          derivedStatus = 'APPROVED';
        } else if (rawStatus.includes('REJECT')) {
          derivedStatus = 'REJECTED';
        } else if (rawStatus.includes('RESUBMIT')) {
          derivedStatus = 'RESUBMISSION_REQUESTED';
        } else {
          derivedStatus = 'PENDING_VERIFICATION';
        }

        const key = app.id;
        const existing = mergedMap.get(key);

        const synthesized: PaymentSubmission = normalizeSubmission({
          id: paymentMeta.submissionId || existing?.id || `PAY-${app.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}`,
          orderId: app.id,
          applicationId: app.id,
          customerId: app.customer_id || app.customerId || 'guest',
          customerName: app.customer_name || 'Customer',
          customerEmail: app.customer_email || 'applyallservices365@gmail.com',
          customerMobile: app.customer_mobile || '9121992365',
          serviceId: app.service_slug || 'srv_gen',
          serviceTitle: app.service_title || 'Government & Statutory Service',
          serviceType: app.service_type || 'Standard',
          expectedAmount: amt,
          paidAmount: amt,
          amount: amt,
          utrNumber: utr || existing?.utrNumber || `UTR-${app.id.slice(-6)}`,
          screenshotUrl: screenshotUrl || existing?.screenshotUrl || '',
          screenshotFileName: screenshotFileName || existing?.screenshotFileName || 'screenshot.jpg',
          screenshotFileSize: screenshotFileSize || existing?.screenshotFileSize || '',
          paymentDate: paymentMeta.date || app.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          status: existing ? existing.status : derivedStatus,
          submittedAt: paymentMeta.submittedAt || app.created_at || new Date().toISOString(),
          verifiedAt: paymentMeta.verifiedAt || existing?.verifiedAt,
          verifiedBy: paymentMeta.verifiedBy || existing?.verifiedBy,
          adminNotes: app.admin_notes || paymentMeta.adminNotes || existing?.adminNotes || '',
          rejectionReason: paymentMeta.rejectionReason || existing?.rejectionReason,
          serviceActivated: derivedStatus === 'APPROVED' || existing?.serviceActivated
        });

        // Always merge, preserving verified or newer statuses
        if (!existing) {
          mergedMap.set(key, synthesized);
        } else {
          mergedMap.set(key, {
            ...synthesized,
            ...existing,
            screenshotUrl: existing.screenshotUrl || synthesized.screenshotUrl,
            utrNumber: existing.utrNumber || synthesized.utrNumber,
            adminNotes: existing.adminNotes || synthesized.adminNotes
          });
        }
      });
    }
  } catch (err) {
    console.warn('Error reading from applications for payment submissions:', err);
  }

  const allSubmissions = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  setStored(SUBMISSIONS_KEY, allSubmissions);
  return allSubmissions;
}

export async function getPaymentSubmissionsByCustomerId(customerId: string): Promise<PaymentSubmission[]> {
  const all = await getPaymentSubmissions();
  return all.filter(s => s.customerId === customerId);
}

export async function submitPaymentProof(
  submissionData: Omit<PaymentSubmission, 'id' | 'status' | 'submittedAt' | 'amount'> & { amount?: number }
): Promise<PaymentSubmission> {
  const all = getStored<PaymentSubmission[]>(SUBMISSIONS_KEY, []);

  // Duplicate UTR prevention check (excluding rejected)
  const trimmedUtr = (submissionData.utrNumber || '').trim();
  const existingUtr = all.find(
    s => s.utrNumber.trim() === trimmedUtr && s.status !== 'REJECTED' && s.orderId !== submissionData.orderId
  );
  if (existingUtr && trimmedUtr.length >= 8) {
    throw new Error(`This UPI UTR / Transaction Reference Number (${trimmedUtr}) has already been submitted for order ${existingUtr.orderId}. Duplicate submissions are blocked.`);
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

  // Save to local cache
  const existingIdx = all.findIndex(s => s.orderId === submissionData.orderId);
  if (existingIdx >= 0) {
    all[existingIdx] = newSubmission;
  } else {
    all.unshift(newSubmission);
  }
  setStored(SUBMISSIONS_KEY, all);

  // 1. Try to upsert into dedicated payment_submissions table
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
    // Non-fatal if table not yet created
  }

  // 2. CRITICAL: Upsert / Update public.applications table in Supabase
  // This guarantees that any admin on any device immediately sees the submission!
  try {
    const paymentMeta = {
      submissionId: newSubmission.id,
      status: 'PENDING_VERIFICATION',
      amount: newSubmission.paidAmount,
      paidAmount: newSubmission.paidAmount,
      expectedAmount: newSubmission.expectedAmount,
      utrNumber: newSubmission.utrNumber,
      screenshotUrl: newSubmission.screenshotUrl,
      screenshotFileName: newSubmission.screenshotFileName,
      screenshotFileSize: newSubmission.screenshotFileSize,
      date: newSubmission.paymentDate,
      submittedAt: now,
      method: 'UPI (PhonePe Manual QR)'
    };

    const docProof = {
      id: `doc-screenshot-${Date.now()}`,
      name: `Payment Screenshot (${newSubmission.utrNumber})`,
      url: newSubmission.screenshotUrl,
      type: 'proof',
      uploadedAt: now
    };

    const { data: existingApp } = await supabase
      .from('applications')
      .select('*')
      .eq('id', newSubmission.orderId)
      .maybeSingle();

    if (existingApp) {
      const existingDocs = Array.isArray(existingApp.documents) ? existingApp.documents : [];
      const updatedDocs = [
        ...existingDocs.filter((d: any) => !d.id?.includes('screenshot') && d.type !== 'proof'),
        docProof
      ];

      await supabase.from('applications').update({
        status: 'under_review',
        form_data: {
          ...(existingApp.form_data || {}),
          _payment: paymentMeta
        },
        documents: updatedDocs,
        updated_at: now
      }).eq('id', newSubmission.orderId);
    } else {
      await supabase.from('applications').insert({
        id: newSubmission.orderId,
        customer_id: newSubmission.customerId,
        customer_name: newSubmission.customerName,
        customer_mobile: newSubmission.customerMobile,
        customer_email: newSubmission.customerEmail,
        service_slug: newSubmission.serviceId,
        service_title: newSubmission.serviceTitle,
        service_type: newSubmission.serviceType || 'Standard',
        form_data: {
          _payment: paymentMeta
        },
        documents: [docProof],
        status: 'under_review',
        priority: 'standard',
        created_at: now,
        updated_at: now
      });
    }
  } catch (appErr) {
    console.warn('Failed to sync payment submission to applications table:', appErr);
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
  let idx = all.findIndex(s => s.id === submissionId || s.orderId === submissionId);
  
  if (idx < 0) {
    // If not found directly by id, refresh all submissions from DB and find
    const refreshed = await getPaymentSubmissions();
    idx = refreshed.findIndex(s => s.id === submissionId || s.orderId === submissionId);
    if (idx < 0) {
      throw new Error('Payment submission record not found.');
    }
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

  // 1. Sync update to payment_submissions table
  try {
    await supabase.from('payment_submissions').update({
      payment_status: newStatus,
      verified_at: now,
      verified_by: opts.adminName,
      admin_note: opts.notes || opts.reason,
      rejection_reason: action === 'REJECT' ? opts.reason : null,
      service_activated: serviceActivated
    }).eq('id', updated.id);
  } catch (err) {
    // Non-fatal if table not yet created
  }

  // 2. CRITICAL: Sync update to public.applications table in Supabase
  try {
    const { data: existingApp } = await supabase
      .from('applications')
      .select('*')
      .eq('id', updated.orderId)
      .maybeSingle();

    if (existingApp) {
      const existingFormData = existingApp.form_data || {};
      const existingPayment = existingFormData._payment || {};
      const updatedPayment = {
        ...existingPayment,
        status: newStatus,
        verifiedAt: now,
        verifiedBy: opts.adminName,
        adminNotes: opts.notes || opts.reason,
        rejectionReason: action === 'REJECT' ? opts.reason : undefined,
        resubmissionReason: action === 'RESUBMIT' ? opts.notes || opts.reason : undefined
      };

      await supabase.from('applications').update({
        status: action === 'APPROVE' ? 'document_verified' : (action === 'REJECT' ? 'rejected' : 'under_review'),
        admin_notes: opts.notes || opts.reason || (action === 'APPROVE' ? 'Payment verified and service unlocked' : ''),
        form_data: { ...existingFormData, _payment: updatedPayment },
        updated_at: now
      }).eq('id', updated.orderId);
    }
  } catch (appErr) {
    console.warn('Failed to sync verification to applications table:', appErr);
  }

  // =========================================================================
  // AUTOMATIC SERVICE ACTIVATION & INVOICE GENERATION ON APPROVAL
  // =========================================================================
  if (action === 'APPROVE') {
    try {
      // 1. Locate and update local customer application
      const apps = getStoredApplications();
      const targetApp = apps.find(a => a.id === updated.orderId || a.id === updated.applicationId);
      if (targetApp) {
        const activatedApp = {
          ...targetApp,
          status: 'document_verified' as const,
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
          id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          invoiceNumber: `INV-${updated.orderId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}`,
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
  setStored(AUDIT_LOGS_KEY, logs.slice(0, 200));
}

export function getPaymentAuditLogs(orderId?: string): PaymentAuditLog[] {
  const logs = getStored<PaymentAuditLog[]>(AUDIT_LOGS_KEY, []);
  return orderId ? logs.filter(l => l.orderId === orderId) : logs;
}
