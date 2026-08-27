import apiClient from "./apiClient";

export interface AddressItem {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType?: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType?: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
}

export const addressApi = {
  getAddresses: async (): Promise<AddressItem[]> => {
    const res = await apiClient.get("/addresses");
    return res.data?.data?.addresses || [];
  },

  createAddress: async (data: AddressInput): Promise<AddressItem> => {
    const res = await apiClient.post("/addresses", data);
    return res.data?.data?.address;
  },

  updateAddress: async (id: string, data: Partial<AddressInput>): Promise<AddressItem> => {
    const res = await apiClient.put(`/addresses/${id}`, data);
    return res.data?.data?.address;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<AddressItem> => {
    const res = await apiClient.patch(`/addresses/${id}/default`);
    return res.data?.data?.address;
  },
};
