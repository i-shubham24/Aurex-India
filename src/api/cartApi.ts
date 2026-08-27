import apiClient from './apiClient';

export const cartApi = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },
  
  addToCart: async (productId: string, quantity: number) => {
    const response = await apiClient.post('/cart/items', { productId, quantity });
    return response.data;
  },
  
  updateCartItem: async (productId: string, quantity: number) => {
    const response = await apiClient.patch(`/cart/items/${productId}`, { quantity });
    return response.data;
  },
  
  removeCartItem: async (productId: string) => {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return response.data;
  },
  
  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },
};
