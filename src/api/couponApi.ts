import apiClient from './apiClient';

export interface PublicCoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscount?: number;
  endDate: string;
}

export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  data?: {
    discount: number;
    couponId: string;
  };
}

export const couponApi = {
  getPublicCoupons: async (): Promise<PublicCoupon[]> => {
    try {
      const response = await apiClient.get('/coupons');
      return response.data?.data?.coupons || [];
    } catch {
      return [];
    }
  },

  validateCoupon: async (code: string, cartTotal: number): Promise<ValidateCouponResponse> => {
    try {
      const response = await apiClient.post('/coupons/validate', { code, cartValue: cartTotal });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Invalid coupon code');
      }
      throw new Error('Failed to validate coupon');
    }
  },
};
