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

const CACHE_KEY = "aurex_welcome_offer_cache";

export const getCachedWelcomeOffer = (): WelcomeOffer | undefined => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Preload image in memory if url exists
      if (parsed?.image?.url) {
        const img = new Image();
        img.src = parsed.image.url;
      }
      return parsed;
    }
  } catch {}
  return undefined;
};

export const getWelcomeOffer = async (): Promise<WelcomeOffer> => {
  const response = await apiClient.get('/welcome-offer');
  const data = response.data?.data?.welcomeOffer;
  if (data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      if (data?.image?.url) {
        const img = new Image();
        img.src = data.image.url;
      }
    } catch {}
  }
  return data;
};
