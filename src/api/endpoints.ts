export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  CATEGORIES: {
    GET_ALL: '/categories',
    GET_BY_SLUG: (slug: string) => `/categories/${slug}`,
  },
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_SLUG: (slug: string) => `/products/${slug}`,
  },
};
