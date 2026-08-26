import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/ChatWidget";

import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import CartPage from "@/pages/CartPage";
import WishlistPage from "@/pages/WishlistPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import AccountPage from "@/pages/AccountPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import BlogPage from "@/pages/BlogPage";
import ContentPage from "@/pages/ContentPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminPage from "@/pages/admin/AdminPage";
import RequireAuth from "@/components/RequireAuth";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:category" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
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
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          {/* Policy pages share one content component */}
          <Route path="/shipping" element={<ContentPage slug="shipping" />} />
          <Route path="/returns" element={<ContentPage slug="returns" />} />
          <Route path="/faq" element={<ContentPage slug="faq" />} />
          <Route path="/privacy" element={<ContentPage slug="privacy" />} />
          <Route path="/terms" element={<ContentPage slug="terms" />} />
          <Route path="/refund" element={<ContentPage slug="refund" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
