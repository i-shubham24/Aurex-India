import apiClient from './apiClient';

export interface WelcomeOffer {
  _id?: string;
  isEnabled: boolean;
  image?: {
    url: string;
    publicId?: string;
  };
  badgeText: string;
  heading: string;
  description: string;
  footerPerk: string;
  showOfferBanner: boolean;
  offerTag: string;
  offerTitle: string;
  offerCouponCode: string;
  offerDescription?: string;
  offerCtaText: string;
  signupHeading?: string;
  signupDescription?: string;
}

export const getWelcomeOffer = async (): Promise<WelcomeOffer> => {
  const response = await apiClient.get('/welcome-offer');
  return response.data?.data?.welcomeOffer;
};
