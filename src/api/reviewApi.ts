import apiClient from './apiClient';

export interface ReviewImage {
  url: string;
  publicId?: string;
}

export interface ReviewItem {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  product: {
    _id: string;
    name: string;
    slug?: string;
    images?: string[];
  } | string;
  rating: number;
  title: string;
  comment: string;
  images?: ReviewImage[];
  isApproved: boolean;
  createdAt: string;
}

export interface CreateReviewPayload {
  productId: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: ReviewImage[];
}

export const getProductReviews = async (productId: string): Promise<ReviewItem[]> => {
  const res = await apiClient.get(`/products/${productId}/reviews`);
  return res.data.data?.reviews || [];
};

export const getRecentReviews = async (): Promise<ReviewItem[]> => {
  const res = await apiClient.get('/reviews/recent');
  return res.data.data?.reviews || [];
};

export const getMyReviews = async (): Promise<{
  reviews: ReviewItem[];
  reviewedProductIds: string[];
  reviewedOrderProductKeys?: string[];
}> => {
  const res = await apiClient.get('/reviews/my-reviews');
  return res.data.data || { reviews: [], reviewedProductIds: [], reviewedOrderProductKeys: [] };
};

export const uploadReviewImage = async (file: File): Promise<ReviewImage> => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await apiClient.post('/reviews/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const createReview = async (payload: CreateReviewPayload): Promise<ReviewItem> => {
  const { productId, orderId, rating, title, comment, images } = payload;
  const res = await apiClient.post(`/products/${productId}/reviews`, {
    rating,
    title,
    comment,
    orderId,
    images,
  });
  return res.data.data?.review;
};
