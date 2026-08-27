import apiClient from "./apiClient";

export interface CreateOrderPayload {
  addressId: string;
  couponCode?: string;
  notes?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
}

export interface BackendOrder {
  _id: string;
  orderNumber: string;
  user: string;
  items: Array<{
    product: string;
    name: string;
    sku?: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    shippingFee: number;
    tax: number;
    total: number;
  };
  coupon?: string;
  payment?: {
    status: string;
    method?: string;
  };
  shipping?: {
    awbCode?: string;
    courierName?: string;
    shipmentId?: number;
    orderId?: number;
  };
  orderStatus: string;
  notes?: string;
  createdAt: string;
}

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<BackendOrder> => {
    const res = await apiClient.post("/orders", payload);
    return res.data?.data?.order;
  },

  getOrders: async (): Promise<BackendOrder[]> => {
    const res = await apiClient.get("/orders");
    return res.data?.data?.orders || [];
  },

  getMyOrders: async (): Promise<BackendOrder[]> => {
    const res = await apiClient.get("/orders");
    return res.data?.data?.orders || [];
  },

  getOrderById: async (id: string): Promise<BackendOrder> => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data?.data?.order;
  },
};
