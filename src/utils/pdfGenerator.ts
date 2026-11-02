import { jsPDF } from 'jspdf';
import { CustomerInvoice } from '../types/invoices';
import { CustomerApplication } from '../types/application';

// Helper to format Indian Rupee currency
export function formatINR(val: number): string {
  return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Generate a professional Apply365 PDF Invoice
 */
export function generateInvoicePDF(invoice: CustomerInvoice): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 18;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(16, 74, 150); // Apply365 Deep Navy (#104A96)
  doc.rect(0, 0, pageWidth, 6, 'F');
  doc.setFillColor(255, 133, 0); // Apply365 Orange Accent (#FF8500)
  doc.rect(pageWidth - 60, 0, 60, 6, 'F');

  // 2. Company Brand & Logo Area
  doc.setTextColor(16, 74, 150);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Apply365', margin, y);

  doc.setTextColor(255, 133, 0);
  doc.setFontSize(10);
  doc.text('SERVICES FOR PEOPLE', margin + 37, y - 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Statutory & Citizen Facilitation Services', margin, y + 5);
  doc.text('support@apply365.in  |  +91 91219 92365  |  www.apply-365.vercel.app', margin, y + 9);

  // 3. Invoice Header Right (Invoice Number & Status Badge)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('TAX INVOICE', pageWidth - margin, y, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 74, 150);
  doc.text(invoice.invoiceNumber, pageWidth - margin, y + 5, { align: 'right' });

  // Status Badge (Paid / Unpaid / Partially Paid)
  const statusColors: Record<string, [number, number, number]> = {
    paid: [16, 185, 129],          // Emerald
    partially_paid: [245, 158, 11], // Amber
    unpaid: [239, 68, 68],          // Red
    cancelled: [100, 116, 139],     // Slate
    overdue: [220, 38, 38]          // Dark Red
  };

  const badgeColor = statusColors[invoice.paymentStatus] || [100, 116, 139];
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(pageWidth - margin - 35, y + 8, 35, 6.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.paymentStatus.toUpperCase().replace('_', ' '), pageWidth - margin - 17.5, y + 12.5, { align: 'center' });

  y += 20;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // 4. Two-Column Billing & Invoice Details
  const colWidth = (pageWidth - margin * 2) / 2;

  // Left: Bill To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('BILLED TO (CUSTOMER):', margin, y);

  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || 'Valued Customer', margin, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile: ${invoice.customerMobile || 'N/A'}`, margin, y + 10);
  doc.text(`Email: ${invoice.customerEmail || 'N/A'}`, margin, y + 14);
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(`Address: ${invoice.customerAddress}`, colWidth - 5);
    doc.text(addressLines, margin, y + 18);
  }

  // Right: Invoice Meta
  const rightX = margin + colWidth + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('INVOICE DETAILS:', rightX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice Date: ${invoice.invoiceDate || new Date().toISOString().slice(0, 10)}`, rightX, y + 5);
  doc.text(`Due Date: ${invoice.dueDate || 'Upon Receipt'}`, rightX, y + 9);
  doc.text(`Service: ${invoice.serviceName || 'Statutory Filing'}`, rightX, y + 13);
  if (invoice.applicationId) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 74, 150);
    doc.text(`Linked Application: ${invoice.applicationId}`, rightX, y + 17);
  }

  y += 28;

  // 5. Line Items Table
  // Table Header
  doc.setFillColor(16, 74, 150);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 7.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  const colX = {
    num: margin + 4,
    desc: margin + 14,
    qty: pageWidth - margin - 60,
    price: pageWidth - margin - 38,
    total: pageWidth - margin - 4
  };

  doc.text('#', colX.num, y + 5);
  doc.text('Service Description', colX.desc, y + 5);
  doc.text('Qty', colX.qty, y + 5, { align: 'right' });
  doc.text('Rate', colX.price, y + 5, { align: 'right' });
  doc.text('Total', colX.total, y + 5, { align: 'right' });

  y += 8;

  // Table Body Rows
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      id: 'item-1',
      description: `${invoice.serviceName} Processing & Portal Filing Assistance`,
      quantity: 1,
      unitPrice: invoice.subtotal || invoice.totalAmount,
      total: invoice.subtotal || invoice.totalAmount
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    }

    doc.setTextColor(71, 85, 105);
    doc.text(String(index + 1), colX.num, y + 5.5);
    doc.setTextColor(15, 23, 42);
    
    const descLines = doc.splitTextToSize(item.description, 95);
    doc.text(descLines, colX.desc, y + 5.5);
    
    doc.setTextColor(71, 85, 105);
    doc.text(String(item.quantity || 1), colX.qty, y + 5.5, { align: 'right' });
    doc.text(formatINR(item.unitPrice), colX.price, y + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatINR(item.total), colX.total, y + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += Math.max(8, descLines.length * 5 + 3);
  });

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);

  y += 4;

  // 6. Summary Totals Area
  const sumWidth = 75;
  const sumX = pageWidth - margin - sumWidth;

  const renderSumRow = (label: string, value: string, isBold = false, isHighlight = false, color?: [number, number, number]) => {
    if (isHighlight) {
      doc.setFillColor(241, 245, 249);
      doc.rect(sumX, y - 3, sumWidth, 6.5, 'F');
    }
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 9.5 : 8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, sumX + 2, y + 1);

    if (color) {
      doc.setTextColor(color[0], color[1], color[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(value, pageWidth - margin - 2, y + 1, { align: 'right' });
    y += 5.5;
  };

  renderSumRow('Subtotal:', formatINR(invoice.subtotal));
  if (invoice.discount > 0) {
    renderSumRow('Discount Applied:', `-${formatINR(invoice.discount)}`, false, false, [22, 101, 52]);
  }
  if (invoice.taxAmount > 0) {
    renderSumRow(`Tax (${invoice.taxRate}%):`, formatINR(invoice.taxAmount));
  }
  
  y += 1;
  renderSumRow('Grand Total:', formatINR(invoice.totalAmount), true, true, [16, 74, 150]);
  renderSumRow('Amount Paid:', formatINR(invoice.amountPaid), false, false, [22, 163, 74]);
  renderSumRow('Balance Due:', formatINR(invoice.balanceDue), true, false, invoice.balanceDue > 0 ? [220, 38, 38] : [22, 163, 74]);

  // 7. Payment Instructions & Bank Details (Left side beside totals)
  const notesY = y - 32;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, notesY, colWidth - 5, 30, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, notesY, colWidth - 5, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(16, 74, 150);
  doc.text('OFFICIAL PAYMENT OPTIONS & INSTRUCTIONS', margin + 3.5, notesY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('UPI ID: apply365@icici  (Instant confirmation)', margin + 3.5, notesY + 10);
  doc.text('Bank: ICICI Bank  |  A/C: 002105018365', margin + 3.5, notesY + 14.5);
  doc.text('IFSC Code: ICIC0000021  |  Branch: Hyderabad Central', margin + 3.5, notesY + 19);
  doc.text('Please quote invoice number as payment remark.', margin + 3.5, notesY + 23.5);

  y = Math.max(y + 8, notesY + 36);

  // 8. Payment History (If multiple payments recorded)
  if (invoice.payments && invoice.payments.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('CONFIRMED PAYMENT TRANSACTIONS:', margin, y);
    y += 4;

    invoice.payments.forEach((p) => {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 6, 1, 1, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Date: ${p.paymentDate.slice(0, 10)}  |  Method: ${p.paymentMethod}  |  Ref: ${p.transactionReference || 'Direct'}`, margin + 3, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74);
      doc.text(formatINR(p.amount), pageWidth - margin - 3, y + 4, { align: 'right' });
      y += 7.5;
    });
  }

  // 9. Footer and Authorized Signatory
  const footerY = pageHeight - 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an electronically generated statutory facilitation invoice from Apply365. No physical signature required.', margin, footerY + 5);
  doc.text('Thank you for trusting Apply365 with your official documentation.', margin, footerY + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 74, 150);
  doc.text('Apply365 Accounts Team', pageWidth - margin, footerY + 5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Digitally Authorized Record', pageWidth - margin, footerY + 8.5, { align: 'right' });

  return doc;
}

/**
 * Generate a professional Application Soft Copy PDF
 */
// Robust date formatting helper that gracefully handles ISO strings, pre-formatted strings, and legacy formats
export function formatPDFDate(rawDate: any): string {
  if (!rawDate) {
    return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    return rawDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  if (typeof rawDate === 'string') {
    // If it contains " at " (e.g. "2 Nov 2026 at 11:38 AM")
    if (rawDate.includes(' at ')) {
      const partBeforeAt = rawDate.split(' at ')[0].trim();
      const parsedPart = new Date(partBeforeAt);
      if (!isNaN(parsedPart.getTime())) {
        return parsedPart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return partBeforeAt;
    }

    const directDate = new Date(rawDate);
    if (!isNaN(directDate.getTime())) {
      return directDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    if (rawDate.length >= 6 && !rawDate.toLowerCase().includes('invalid')) {
      return rawDate;
    }
  }

  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function generateApplicationSummaryPDF(app: CustomerApplication): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 18;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(16, 74, 150);
  doc.rect(0, 0, pageWidth, 6, 'F');
  doc.setFillColor(255, 133, 0);
  doc.rect(pageWidth - 60, 0, 60, 6, 'F');

  // 2. Company Brand
  doc.setTextColor(16, 74, 150);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Apply365', margin, y);

  doc.setTextColor(255, 133, 0);
  doc.setFontSize(10);
  doc.text('OFFICIAL APPLICATION SOFT COPY', margin + 37, y - 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Statutory Service Filing & Verification Dossier', margin, y + 5);
  doc.text('Official Citizen Support Portal  |  support@apply365.in', margin, y + 9);

  // 3. Application ID Badge Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 74, 150);
  doc.text(app.id, pageWidth - margin, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Submitted: ${formatPDFDate(app.createdAt || app.submissionDate)}`, pageWidth - margin, y + 5, { align: 'right' });

  // Status Badge
  doc.setFillColor(16, 74, 150);
  doc.roundedRect(pageWidth - margin - 40, y + 8, 40, 6.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(String(app.status).toUpperCase().replace('_', ' '), pageWidth - margin - 20, y + 12.5, { align: 'center' });

  y += 20;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // 4. Applicant Profile Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 74, 150);
  doc.text('APPLICANT DETAILS & SERVICE CLASSIFICATION', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  
  const midX = margin + (pageWidth - margin * 2) / 2;
  doc.text(`Applicant Name: `, margin + 4, y + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(app.customerName, margin + 28, y + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text(`Mobile: ${app.customerMobile}`, margin + 4, y + 16.5);
  doc.text(`Email: ${app.customerEmail || 'Not Provided'}`, margin + 4, y + 21.5);

  doc.text(`Service: `, midX, y + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 74, 150);
  doc.text(app.serviceTitle, midX + 13, y + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text(`Request Type: ${app.serviceType || 'Standard Filing'}`, midX, y + 16.5);
  doc.text(`Customer ID: ${app.customerId || 'Guest / Verified'}`, midX, y + 21.5);

  y += 32;

  // 5. Submitted Form Fields Table
  if (app.formData && Object.keys(app.formData).length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('SUBMITTED FORM DATA & SPECIFICATIONS', margin, y);
    y += 4;

    const entries = Object.entries(app.formData);
    entries.forEach(([key, value]) => {
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      doc.text(formattedKey, margin + 3, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      const valLines = doc.splitTextToSize(valStr, 110);
      doc.text(valLines, margin + 65, y + 4.5);

      y += Math.max(6.5, valLines.length * 4.5 + 2);
    });

    y += 4;
  }

  // 6. Submitted Documents Checklist
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`REQUIRED DOCUMENTS CHECKLIST (${app.documents?.length || 0})`, margin, y);
  y += 4;

  // Table header for documents
  doc.setFillColor(16, 74, 150);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('#', margin + 3, y + 4.5);
  doc.text('Document Name', margin + 12, y + 4.5);
  doc.text('Attachment Status', pageWidth - margin - 40, y + 4.5);
  doc.text('File Verification', pageWidth - margin - 4, y + 4.5, { align: 'right' });
  y += 7;

  if (app.documents && app.documents.length > 0) {
    app.documents.forEach((d, idx) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(String(idx + 1), margin + 3, y + 4.5);
      doc.text(d.name, margin + 12, y + 4.5);

      const isUploaded = d.status === 'uploaded' || d.fileUrl;
      if (isUploaded) {
        doc.setTextColor(22, 163, 74);
        doc.setFont('helvetica', 'bold');
        doc.text('ATTACHED', pageWidth - margin - 40, y + 4.5);
        doc.text('VERIFIED', pageWidth - margin - 4, y + 4.5, { align: 'right' });
      } else {
        doc.setTextColor(202, 138, 4);
        doc.setFont('helvetica', 'normal');
        doc.text('PENDING UPLOAD', pageWidth - margin - 40, y + 4.5);
        doc.text('AWAITING', pageWidth - margin - 4, y + 4.5, { align: 'right' });
      }
      y += 6.5;
    });
  }

  y += 6;

  // 7. Official Regulatory Disclaimer
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(254, 243, 199); // Soft Amber
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('STATUTORY REGULATORY NOTICE:', margin + 3.5, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9);
  const noticeLines = doc.splitTextToSize(
    'Apply365 is a private facilitation consultancy assisting citizens in document preparation, online submission, and compliance. Acceptance and granting of official certificates/documents rests solely with respective statutory departments (UIDAI, NSDL, ECI, MCA, EPFO, ESIC).',
    pageWidth - margin * 2 - 7
  );
  doc.text(noticeLines, margin + 3.5, y + 8.5);

  // 8. Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Official Apply365 Electronic Soft Copy. Valid for citizen status tracking and portal reference.', margin, footerY + 4);
  doc.text('For queries or escalations, contact support@apply365.in quoting your Application ID.', margin, footerY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 74, 150);
  doc.text('Apply365 Citizen Support Team', pageWidth - margin, footerY + 6, { align: 'right' });

  return doc;
}

