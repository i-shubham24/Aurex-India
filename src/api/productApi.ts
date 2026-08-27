import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ProductQuery } from '@/services/types';

export const getProducts = async (params?: ProductQuery) => {
  const queryParams = new URLSearchParams();
  if (params?.categorySlug) queryParams.append('category', params.categorySlug);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.priceMin) queryParams.append('minPrice', params.priceMin.toString());
  if (params?.priceMax) queryParams.append('maxPrice', params.priceMax.toString());
  if (params?.sort === 'price-asc') queryParams.append('sort', 'price_asc');
  if (params?.sort === 'price-desc') queryParams.append('sort', 'price_desc');
  // ... handle other sort options if needed

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS.GET_ALL}?${queryParams.toString()}`);
  
  const mapProduct = (p: any) => ({
    id: p._id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.category?.slug || '',
    price: p.pricing?.sellingPrice || 0,
    compareAtPrice: p.pricing?.mrp || undefined,
    currency: "INR",
    images: p.images?.map((img: any) => img.url) || [],
    shortDescription: p.shortDescription || p.description?.substring(0, 100) || '',
    description: p.description || '',
    features: Array.isArray(p.features) ? p.features.map((f: any) => f.title || f) : [],
    material: p.specifications?.find((s: any) => s.key === 'Material')?.value || p.name,
    variants: p.inventory?.variants || [],
    rating: p.rating || 5.0,
    reviewCount: p.reviewCount || 0,
    stock: p.inventory?.total || 10,
    badges: p.badges?.map((b: any) => b.label) || [],
    isNew: p.isNew || false,
    isFeatured: p.isFeatured || false,
  });

  return response.data.data.products.map(mapProduct);
};

export const getProductsPaginated = async (params?: ProductQuery) => {
  const queryParams = new URLSearchParams();
  if (params?.categorySlug) queryParams.append('category', params.categorySlug);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.priceMin) queryParams.append('minPrice', params.priceMin.toString());
  if (params?.priceMax) queryParams.append('maxPrice', params.priceMax.toString());
  if (params?.sort === 'price-asc') queryParams.append('sort', 'price_asc');
  if (params?.sort === 'price-desc') queryParams.append('sort', 'price_desc');
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS.GET_ALL}?${queryParams.toString()}`);
  
  const mapProduct = (p: any) => ({
    id: p._id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.category?.slug || '',
    price: p.pricing?.sellingPrice || 0,
    compareAtPrice: p.pricing?.mrp || undefined,
    currency: "INR",
    images: p.images?.map((img: any) => img.url) || [],
    shortDescription: p.shortDescription || p.description?.substring(0, 100) || '',
    description: p.description || '',
    features: Array.isArray(p.features) ? p.features.map((f: any) => f.title || f) : [],
    material: p.specifications?.find((s: any) => s.key === 'Material')?.value || p.name,
    variants: p.inventory?.variants || [],
    rating: p.rating || 5.0,
    reviewCount: p.reviewCount || 0,
    stock: p.inventory?.total || 10,
    badges: p.badges?.map((b: any) => b.label) || [],
    isNew: p.isNew || false,
    isFeatured: p.isFeatured || false,
  });

  return {
    products: response.data.data.products.map(mapProduct),
    pagination: response.data.pagination
  };
};

export const getProductBySlug = async (slug: string) => {
  const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_SLUG(slug));
  const p = response.data.data.product;
  
  if (!p) return null;

  return {
    id: p._id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.category?.slug || '',
    price: p.pricing?.sellingPrice || 0,
    compareAtPrice: p.pricing?.mrp || undefined,
    currency: "INR",
    images: p.images?.map((img: any) => img.url) || [],
    shortDescription: p.shortDescription || p.description?.substring(0, 100) || '',
    description: p.description || '',
    features: Array.isArray(p.features) ? p.features.map((f: any) => f.title || f) : [],
    material: p.specifications?.find((s: any) => s.key === 'Material')?.value || p.name,
    variants: p.inventory?.variants || [],
    rating: p.rating || 5.0,
    reviewCount: p.reviewCount || 0,
    stock: p.inventory?.total || 10,
    badges: p.badges?.map((b: any) => b.label) || [],
    isNew: p.isNew || false,
    isFeatured: p.isFeatured || false,
  };
};
