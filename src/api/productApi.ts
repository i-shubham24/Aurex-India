import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ProductQuery } from '@/services/types';

const sanitizeFeature = (f: any): string => {
  if (!f) return '';
  if (typeof f === 'string') return f;
  if (typeof f === 'object') {
    return f.title || f.value || f.name || f.key || (f._id ? '' : JSON.stringify(f));
  }
  return String(f);
};

const sanitizeBadge = (b: any): string => {
  if (!b) return '';
  if (typeof b === 'string') return b;
  if (typeof b === 'object') {
    return b.label || b.name || b.title || b.value || '';
  }
  return String(b);
};

const getMaterial = (p: any): string => {
  if (!Array.isArray(p.specifications)) return p.name || '';
  const spec = p.specifications.find((s: any) => 
    s?.key?.toLowerCase() === 'material' || 
    s?.title?.toLowerCase() === 'material' ||
    s?.name?.toLowerCase() === 'material'
  );
  if (!spec) return p.name || '';
  const val = spec.value || spec.title || spec.key || '';
  return typeof val === 'string' ? val : (typeof val === 'object' ? (val.value || val.title || '') : String(val));
};

const mapProduct = (p: any) => {
  if (!p) return null;
  return {
    id: p._id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.category?.slug || '',
    price: p.pricing?.sellingPrice || 0,
    compareAtPrice: p.pricing?.mrp || undefined,
    currency: "INR",
    images: p.images?.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean) || [],
    shortDescription: p.shortDescription || p.description?.substring(0, 100) || '',
    description: typeof p.description === 'string' ? p.description : (p.description ? String(p.description) : ''),
    features: Array.isArray(p.features) ? p.features.map(sanitizeFeature).filter(Boolean) : [],
    material: getMaterial(p),
    variants: p.inventory?.variants || [],
    rating: p.rating || 5.0,
    reviewCount: p.reviewCount || 0,
    stock: p.inventory?.total || 10,
    badges: Array.isArray(p.badges) ? p.badges.map(sanitizeBadge).filter(Boolean) : [],
    isNew: p.isNew || false,
    isFeatured: p.isFeatured || false,
  };
};

export const getProducts = async (params?: ProductQuery) => {
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
  return response.data.data.products.map(mapProduct).filter(Boolean);
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
  return {
    products: response.data.data.products.map(mapProduct).filter(Boolean),
    pagination: response.data.pagination
  };
};

export const getProductBySlug = async (slug: string) => {
  const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_SLUG(slug));
  const p = response.data.data.product;
  return mapProduct(p);
};
