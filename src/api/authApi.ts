import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { SignUpInput, User } from '@/services/types';

const mapUser = (backendUser: any): User => {
  return {
    ...backendUser,
    fullName: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || undefined,
  };
};

export const authApi = {
  login: async (identifier: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { identifier, password });
    return {
      token: response.data.data.token || response.data.data.accessToken,
      user: mapUser(response.data.data.user)
    };
  },
  
  register: async (input: SignUpInput): Promise<{ token: string; user: User }> => {
    // The backend register endpoint expects firstName, lastName, email, password
    const names = input.fullName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || ' ';
    
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      firstName,
      lastName,
      email: input.email,
      password: input.password
    });
    return {
      token: response.data.data.token || response.data.data.accessToken,
      user: mapUser(response.data.data.user)
    };
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return { user: mapUser(response.data.data.user) };
  }
};
