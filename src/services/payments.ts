import type { RazorpaySuccess } from "@/lib/razorpay";

/**
 * Payment abstraction — the same swappable pattern as the data layer.
 *
 * Two adapters:
 *  • demo    — no server. Opens Razorpay Checkout in TEST mode with just the
 *              public Key ID (VITE_RAZORPAY_KEY_ID). Good for showing the real
 *              payment flow now. Cannot create a real order_id or verify the
 *              signature (both need the Key Secret), so verify() is optimistic
 *              and MUST NOT be trusted for real money.
 *  • server  — calls a backend endpoint (VITE_PAYMENTS_API_URL) that creates
 *              the order and verifies the signature server-side. Point this at
 *              a Supabase Edge Function now, or your MERN backend later — the
 *              frontend never changes. See supabase/functions/ for ready code.
 *
 * Selection: if VITE_PAYMENTS_API_URL is set → server, else → demo.
 * If VITE_RAZORPAY_KEY_ID is absent entirely, isPaymentConfigured() is false
 * and the UI falls back to the WhatsApp-order stub.
 */

export interface CreatedOrder {
  orderId?: string; // Razorpay order_id (server adapter only)
  amount: number; // paise
  currency: string;
  keyId: string; // public key id
}

export interface VerifyResult {
  verified: boolean;
}

export interface PaymentService {
  createOrder(amountPaise: number, receipt: string): Promise<CreatedOrder>;
  verify(payload: RazorpaySuccess): Promise<VerifyResult>;
}

const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "";
const apiUrl = import.meta.env.VITE_PAYMENTS_API_URL ?? "";

export function isPaymentConfigured(): boolean {
  return Boolean(keyId);
}

const demoPayment: PaymentService = {
  async createOrder(amountPaise) {
    // No server → no order_id. Checkout opens with amount only (test mode).
    return { amount: amountPaise, currency: "INR", keyId };
  },
  async verify() {
    // Cannot verify without the Key Secret. Optimistic — demo/test only.
    return { verified: true };
  },
};

const serverPayment: PaymentService = {
  async createOrder(amountPaise, receipt) {
    const res = await fetch(`${apiUrl}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
    });
    if (!res.ok) throw new Error("Could not start payment. Please try again.");
    const data = await res.json();
    return { orderId: data.orderId, amount: data.amount, currency: data.currency ?? "INR", keyId };
  },
  async verify(payload) {
    const res = await fetch(`${apiUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { verified: false };
    return (await res.json()) as VerifyResult;
  },
};

export const payments: PaymentService = apiUrl ? serverPayment : demoPayment;
