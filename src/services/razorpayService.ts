// Razorpay Payment Gateway Integration for Apply365
// Supports Standard Checkout with UPI, Cards, Net Banking, and QR Codes

export interface RazorpayPaymentOptions {
  amount: number; // in Rupees (will be multiplied by 100 for paise)
  currency?: string;
  name?: string;
  description?: string;
  invoiceId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: Record<string, string>;
  themeColor?: string;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Configured Razorpay Keys (Test Keys provided by Admin)
export const RAZORPAY_CONFIG = {
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TvkCL1OAbneDCO',
  keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'XCWHY5IwxtP49KB6t7DJILjt',
  currency: 'INR',
  merchantName: 'Apply365 — Services for People',
  themeColor: '#104A96',
  isTestMode: true
};

/**
 * Dynamically loads the Razorpay checkout.js script if not already present.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK checkout.js');
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/**
 * Opens Razorpay Standard Checkout popup.
 * Returns a Promise that resolves with payment details on success,
 * or rejects on failure / user dismissal.
 */
export async function openRazorpayCheckout(
  options: RazorpayPaymentOptions,
  customKeyId?: string
): Promise<RazorpaySuccessResponse> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !(window as any).Razorpay) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  const key = customKeyId || RAZORPAY_CONFIG.keyId;
  if (!key) {
    throw new Error('Razorpay Key ID is not configured.');
  }

  const amountInPaise = Math.round(Number(options.amount) * 100);
  if (isNaN(amountInPaise) || amountInPaise <= 0) {
    throw new Error('Invalid payment amount.');
  }

  // Get current website origin for hosted logo
  const logoUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/apply365_transparent_logo.png` 
    : '/apply365_transparent_logo.png';

  return new Promise((resolve, reject) => {
    try {
      const rzpOptions: any = {
        key: key,
        amount: amountInPaise,
        currency: options.currency || RAZORPAY_CONFIG.currency,
        name: options.name || RAZORPAY_CONFIG.merchantName,
        description: options.description || (options.invoiceId ? `Invoice Payment: ${options.invoiceId}` : 'Statutory Documentation Fee'),
        image: logoUrl,
        prefill: {
          name: options.customerName || '',
          email: options.customerEmail || '',
          contact: options.customerPhone || ''
        },
        notes: {
          platform: 'Apply365 Facilitation Portal',
          invoice_id: options.invoiceId || '',
          ...(options.notes || {})
        },
        theme: {
          color: options.themeColor || RAZORPAY_CONFIG.themeColor,
          backdrop_color: 'rgba(15, 23, 42, 0.65)'
        },
        modal: {
          confirm_close: true,
          ondismiss: function () {
            reject(new Error('Payment window closed by user.'));
          }
        },
        handler: function (response: RazorpaySuccessResponse) {
          if (response && response.razorpay_payment_id) {
            resolve(response);
          } else {
            reject(new Error('Payment failed or no transaction ID received from Razorpay.'));
          }
        }
      };

      const rzp = new (window as any).Razorpay(rzpOptions);

      rzp.on('payment.failed', function (resp: any) {
        console.error('Razorpay payment failed:', resp.error);
        reject(new Error(resp.error?.description || 'Payment was declined by bank or gateway.'));
      });

      rzp.open();
    } catch (err: any) {
      reject(new Error(err?.message || 'Failed to initialize Razorpay checkout.'));
    }
  });
}

