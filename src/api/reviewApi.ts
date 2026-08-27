import apiClient from './apiClient';

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
  isApproved: boolean;
  createdAt: string;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}

export const getProductReviews = async (productId: string): Promise<ReviewItem[]> => {
  const res = await apiClient.get(`/products/${productId}/reviews`);
  return res.data.data?.reviews || [];
};

export const getRecentReviews = async (): Promise<ReviewItem[]> => {
  const res = await apiClient.get('/reviews/recent');
  return res.data.data?.reviews || [];
};

export const getMyReviews = async (): Promise<{ reviews: ReviewItem[]; reviewedProductIds: string[] }> => {
  const res = await apiClient.get('/reviews/my-reviews');
  return res.data.data || { reviews: [], reviewedProductIds: [] };
};

export const createReview = async (payload: CreateReviewPayload): Promise<ReviewItem> => {
  const { productId, rating, title, comment } = payload;
  const res = await apiClient.post(`/products/${productId}/reviews`, {
    rating,
    title,
    comment,
  });
  return res.data.data?.review;
};
