export type InvoicePaymentStatus = 
  | 'unpaid' 
  | 'partially_paid' 
  | 'paid' 
  | 'overdue' 
  | 'cancelled' 
  | 'refunded';

export type InvoiceStatus = 'draft' | 'finalized' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash' | 'Credit/Debit Card' | 'Net Banking' | 'Other';
  transactionReference?: string;
  paymentDate: string;
  paymentNotes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string; // e.g. APP-INV-2026-0001
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress?: string;
  applicationId?: string; // Optional link to existing application
  serviceName: string;
  invoiceDate: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxRate: number; // Percentage e.g. 18 for GST or 0
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: InvoicePaymentStatus;
  invoiceStatus: InvoiceStatus;
  payments: InvoicePayment[];
  notes?: string;
  paymentInstructions?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
