/**
 * Razorpay Checkout loader + open helper.
 *
 * Loads the hosted checkout.js on demand (kept out of the initial bundle) and
 * opens the payment modal. The actual "create order" and "verify signature"
 * steps live behind the PaymentService (src/services/payments.ts) because they
 * require the Key Secret, which must stay server-side.
 */

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

let loading: Promise<boolean> | null = null;

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return loading;
}

export async function openRazorpay(options: RazorpayOptions): Promise<void> {
  const ok = await loadRazorpay();
  if (!ok || !window.Razorpay) {
    throw new Error("Could not load Razorpay Checkout. Check your connection.");
  }
  new window.Razorpay(options).open();
}
