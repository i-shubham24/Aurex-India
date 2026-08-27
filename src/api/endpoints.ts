export const API_ENDPOINTS = {
  CATEGORIES: {
    GET_ALL: '/categories',
    GET_BY_SLUG: (slug: string) => `/categories/${slug}`,
  },
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_SLUG: (slug: string) => `/products/${slug}`,
  },
};
