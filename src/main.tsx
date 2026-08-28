import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh window (no re-fetching on navigation)
      gcTime: 1000 * 60 * 30, // 30 minutes in-memory cache retention
      refetchOnWindowFocus: false, // Prevents background API spam when switching tabs
      refetchOnReconnect: true,
      retry: 1, // Retry failed network requests once
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
