import apiClient from "./apiClient";

export const wishlistApi = {
  getWishlist: async () => {
    const res = await apiClient.get("/wishlist/");
    return res.data;
  },

  addToWishlist: async (productId: string) => {
    const res = await apiClient.post(`/wishlist/${productId}`);
    return res.data;
  },

  removeFromWishlist: async (productId: string) => {
    const res = await apiClient.delete(`/wishlist/${productId}`);
    return res.data;
  },
};
