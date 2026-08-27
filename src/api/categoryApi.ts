import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export const getCategories = async () => {
  const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
  return response.data;
};

export const getCategoryBySlug = async (slug: string) => {
  const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.GET_BY_SLUG(slug));
  return response.data;
};
