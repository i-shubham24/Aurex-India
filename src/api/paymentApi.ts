import apiClient from "./apiClient";

export interface CreatePaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentConfig {
  partialPaymentEnabled: boolean;
  partialPaymentType: 'FIXED' | 'PERCENTAGE';
  partialPaymentValue: number;
  minOrderAmount: number;
  description: string;
}

export const paymentApi = {
  getPaymentConfig: async (): Promise<PaymentConfig> => {
    try {
      const res = await apiClient.get("/payments/config");
      return res.data?.data;
    } catch {
      return {
        partialPaymentEnabled: true,
        partialPaymentType: 'FIXED',
        partialPaymentValue: 149,
        minOrderAmount: 0,
        description: 'Pay a small advance deposit online to confirm your order, and pay the remaining balance via Cash or UPI on delivery.'
      };
    }
  },

  createRazorpayOrder: async (backendOrderId: string): Promise<CreatePaymentOrderResponse> => {
    const res = await apiClient.post("/payments/create-order", { orderId: backendOrderId });
    return res.data?.data;
  },

  verifyPayment: async (payload: VerifyPaymentPayload): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post("/payments/verify", payload);
    return res.data;
  },
};
