import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/ChatWidget";
import DeliveredOrderReviewPrompt from "@/components/DeliveredOrderReviewPrompt";
import AuthModal from "@/components/AuthModal";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";

import { useQuery } from "@tanstack/react-query";
import { getWelcomeOffer, getCachedWelcomeOffer } from "@/api/welcomeOfferApi";

// Synchronous import for main landing page (for instant LCP)
import HomePage from "@/pages/HomePage";

// Lazy-loaded routes for code splitting & minimal initial JS bundle size
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const StoryPage = lazy(() => import("@/pages/StoryPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const ContentPage = lazy(() => import("@/pages/ContentPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const AdminPage = lazy(() => import("@/pages/admin/AdminPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-copper border-t-transparent" />
    </div>
  );
}

export default function App() {
  const { user, loading, openAuthModal } = useAuth();
  const { pathname } = useLocation();

  const { data: welcomeOffer } = useQuery({
    queryKey: ["welcome-offer"],
    queryFn: getWelcomeOffer,
    initialData: getCachedWelcomeOffer,
    staleTime: 1000 * 60 * 10,
  });

  // Show Welcome / Discount Modal when user visits Aurex India
  useEffect(() => {
    // Skip if user is authenticated, still loading auth state, on admin routes, or modal is disabled from admin
    if (loading || user || pathname.startsWith("/admin")) return;
    if (welcomeOffer && welcomeOffer.isEnabled === false) return;

    const hasShown = sessionStorage.getItem("aurex_welcome_modal_shown");
    if (!hasShown) {
      // 800ms gentle delay to allow initial page layout to paint seamlessly
      const timer = setTimeout(() => {
        openAuthModal("login");
        sessionStorage.setItem("aurex_welcome_modal_shown", "true");
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [loading, user, pathname, openAuthModal, welcomeOffer]);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            <Route path="/wishlist" element={<WishlistPage />} />

            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/*"
              element={
                <RequireAuth admin>
                  <AdminPage />
                </RequireAuth>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            {/* Policy pages share one content component */}
            <Route path="/shipping" element={<ContentPage slug="shipping" />} />
            <Route path="/returns" element={<ContentPage slug="returns" />} />
            <Route path="/faq" element={<ContentPage slug="faq" />} />
            <Route path="/privacy" element={<ContentPage slug="privacy" />} />
            <Route path="/terms" element={<ContentPage slug="terms" />} />
            <Route path="/refund" element={<ContentPage slug="refund" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
      <AuthModal />
      <DeliveredOrderReviewPrompt />
    </div>
  );
}
