import apiClient from '../api/apiClient';

export interface ActivityPayload {
  eventType:
    | 'PRODUCT_VIEW'
    | 'CATEGORY_VIEW'
    | 'ADD_TO_CART'
    | 'REMOVE_FROM_CART'
    | 'ADD_TO_WISHLIST'
    | 'REMOVE_FROM_WISHLIST'
    | 'SEARCH'
    | 'CHECKOUT_STARTED'
    | 'COUPON_APPLIED'
    | 'ORDER_PLACED'
    | 'WELCOME_OFFER_CLAIM'
    | 'PAGE_VIEW';
  item?: {
    id?: string;
    name?: string;
    slug?: string;
    price?: number;
    image?: string;
    category?: string;
  };
  metadata?: {
    searchQuery?: string;
    cartTotal?: number;
    quantity?: number;
    couponCode?: string;
    pageUrl?: string;
    referrer?: string;
  };
}

let cachedSessionId: string | null = null;
function getSessionId() {
  if (typeof window === 'undefined') return 'sess_default';
  if (!cachedSessionId) {
    cachedSessionId = sessionStorage.getItem('aurex_session_id');
    if (!cachedSessionId) {
      cachedSessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem('aurex_session_id', cachedSessionId);
    }
  }
  return cachedSessionId;
}

export const trackUserActivity = (payload: ActivityPayload) => {
  try {
    const sessionId = getSessionId();
    apiClient.post('/activity/track', {
      ...payload,
      sessionId,
      metadata: {
        pageUrl: window.location.pathname + window.location.search,
        referrer: document.referrer || '',
        ...payload.metadata,
      }
    }).catch(() => {
      // Silently ignore network failures for tracking
    });
  } catch {
    // Non-blocking
  }
};
