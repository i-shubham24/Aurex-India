import apiClient from './apiClient';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  coverImage: string;
  isFeatured: boolean;
  isPublished: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export const getBlogs = async (params?: { category?: string; search?: string; featured?: boolean }): Promise<BlogPost[]> => {
  const response = await apiClient.get('/blogs', { params });
  return response.data?.data?.blogs || [];
};

export const getBlogBySlug = async (slug: string): Promise<{ blog: BlogPost; related: BlogPost[] }> => {
  const response = await apiClient.get(`/blogs/${slug}`);
  return response.data?.data || { blog: null, related: [] };
};
