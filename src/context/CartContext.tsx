import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { Coupon, CartLine, Product, ProductVariant } from "@/services/types";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { cartApi } from "@/api/cartApi";
import { couponApi } from "@/api/couponApi";
import { fireCouponConfetti } from "@/lib/confetti";
import apiClient from "@/api/apiClient";

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  campaignDiscount: number;
  total: number;
  coupon: Coupon | null;
  couponMessage: string;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (product: Product, variant?: ProductVariant, qty?: number) => void;
  remove: (productId: string, variantId?: string) => void;
  setQty: (productId: string, qty: number, variantId?: string) => void;
  clear: () => void;
  activeCampaign: any;
}

const CartContext = createContext<CartContextValue | null>(null);
const LS_CART = "aurex.cart";
const LS_COUPON = "aurex.coupon";

function lineKey(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(LS_CART) ?? "[]");
    } catch {
      return [];
    }
  });
  const linesRef = useRef(lines);
  const prevUser = useRef(user);

  const [isOpen, setOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(window.localStorage.getItem(LS_COUPON) ?? "null");
    } catch {
      return null;
    }
  });
  const [couponMessage, setCouponMessage] = useState("");
  const [activeCampaign, setActiveCampaign] = useState<any>(null);

  useEffect(() => {
    apiClient.get("/campaigns/active")
      .then((res) => {
        if (res.data?.success && res.data?.data?.campaign) {
          setActiveCampaign(res.data.data.campaign);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch active campaign.", err);
      });
  }, []);

  useEffect(() => {
    linesRef.current = lines;
    window.localStorage.setItem(LS_CART, JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    if (authLoading) return;
    
    const loggedOut = prevUser.current && !user;
    prevUser.current = user;

    if (loggedOut) {
      setLines([]);
      return;
    }

    if (user) {
      const syncCart = async () => {
        try {
          const res = await cartApi.getCart();
          const serverItems = res.data?.cart?.items || [];
          
          const newLines: CartLine[] = serverItems.map((item: any) => ({
            productId: item.product._id || item.product,
            slug: item.product.slug || "",
            name: item.product.name || "Product",
            shortDescription: item.product.shortDescription || "",
            image: item.product.images?.[0]?.url || item.product.images?.[0] || "",
            unitPrice: item.priceSnapshot,
            compareAtPrice: item.product.pricing?.mrp,
            quantity: item.quantity,
          }));
          
          setLines(newLines);
        } catch (error) {
          console.error("Failed to sync cart", error);
        }
      };
      syncCart();
    }
  }, [user, authLoading, toast]);

  const add = useCallback(
    async (product: Product, variant?: ProductVariant, qty = 1) => {
      const unitPrice = product.price + (variant?.priceDelta ?? 0);
      const key = lineKey(product.id, variant?.id);
      const originalLines = linesRef.current;
      setLines((prev) => {
        const existing = prev.find(
          (l) => lineKey(l.productId, l.variantId) === key
        );
        if (existing) {
          return prev.map((l) =>
            lineKey(l.productId, l.variantId) === key
              ? { ...l, quantity: l.quantity + qty }
              : l
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            shortDescription: product.shortDescription,
            image: variant?.images?.[0] ?? product.images[0],
            variantId: variant?.id,
            variantName: variant?.name,
            unitPrice,
            compareAtPrice: product.compareAtPrice,
            quantity: qty,
          },
        ];
      });
      toast.success(`Added ${product.name} to cart.`);
      setOpen(true);
      
      if (user) {
        try {
          await cartApi.addToCart(product.id, qty);
        } catch (error) {
          console.error("Cart add error", error);
          toast.error("Failed to sync cart item");
          setLines(originalLines);
        }
      }
    },
    [toast, user]
  );

  const remove = useCallback(async (productId: string, variantId?: string) => {
    const key = lineKey(productId, variantId);
    const originalLines = linesRef.current;
    setLines((prev) =>
      prev.filter((l) => lineKey(l.productId, l.variantId) !== key)
    );
    if (user) {
      try {
        await cartApi.removeCartItem(productId);
      } catch (error) {
        toast.error("Failed to remove from server cart");
        setLines(originalLines);
      }
    }
  }, [user, toast]);

  const setQty = useCallback(
    async (productId: string, qty: number, variantId?: string) => {
      const key = lineKey(productId, variantId);
      const originalLines = linesRef.current;
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => lineKey(l.productId, l.variantId) !== key)
          : prev.map((l) =>
              lineKey(l.productId, l.variantId) === key
                ? { ...l, quantity: qty }
                : l
            )
      );
      if (user) {
        try {
          if (qty <= 0) {
            await cartApi.removeCartItem(productId);
          } else {
            await cartApi.updateCartItem(productId, qty);
          }
        } catch (error) {
          toast.error("Failed to update server cart");
          setLines(originalLines);
        }
      }
    },
    [user, toast]
  );

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines]
  );

  const removeCoupon = useCallback((notify = true) => {
    setCoupon((prev) => {
      if (prev && notify) {
        toast.info("Coupon removed.");
      }
      return null;
    });
    setCouponMessage("");
    window.localStorage.removeItem(LS_COUPON);
  }, [toast]);

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!user) {
        toast.info("Please sign in or register to apply coupons.");
        openAuthModal("login");
        return false;
      }
      try {
        const res = await couponApi.validateCoupon(code, subtotal);
        if (res.success && res.data) {
          const validCoupon: Coupon = {
            code,
            label: `${code}`,
            type: "flat", // Backend calculates exact discount amount
            value: res.data.discount
          };
          setCoupon(validCoupon);
          setCouponMessage(res.message);
          window.localStorage.setItem(LS_COUPON, JSON.stringify(validCoupon));
          fireCouponConfetti();
          toast.success(`Coupon "${code}" applied successfully!`);
          return true;
        }
      } catch (error: any) {
        setCoupon(null);
        window.localStorage.removeItem(LS_COUPON);
        setCouponMessage(error.message || "Invalid coupon code.");
        toast.error(error.message || "Invalid coupon code.");
        return false;
      }
      return false;
    },
    [subtotal, toast, user, openAuthModal]
  );

  const clear = useCallback(async () => {
    const originalLines = linesRef.current;
    setLines([]);
    removeCoupon(false);
    if (user) {
      try {
        await cartApi.clearCart();
      } catch (error) {
        console.error("Failed to clear server cart", error);
        setLines(originalLines);
      }
    }
  }, [user, removeCoupon]);

  // Re-validate the coupon whenever the subtotal changes (e.g. a min-spend
  // coupon that no longer qualifies after removing items).
  useEffect(() => {
    if (!coupon || subtotal <= 0) return;
    couponApi.validateCoupon(coupon.code, subtotal).then((res) => {
      if (!res.success) removeCoupon(true);
    }).catch(() => {
      removeCoupon(true);
    });
  }, [subtotal, coupon, removeCoupon]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
    const discount = coupon
      ? Math.min(
          coupon.type === "percent"
            ? Math.min(
                Math.round((subtotal * coupon.value) / 100),
                coupon.maxDiscount ?? Infinity
              )
            : coupon.value,
          subtotal
        )
      : 0;
    const campaignDiscount = activeCampaign && activeCampaign.discountPercentage > 0
      ? lines.reduce((sum, l) => {
          const qualifies = !activeCampaign.discountedProductIds ||
                            activeCampaign.discountedProductIds.length === 0 ||
                            activeCampaign.discountedProductIds.includes(l.productId);
          if (qualifies) {
            return sum + Math.round(l.unitPrice * l.quantity * (activeCampaign.discountPercentage / 100));
          }
          return sum;
        }, 0)
      : 0;
    return {
      lines,
      subtotal,
      discount,
      campaignDiscount,
      total: Math.max(0, subtotal - discount - campaignDiscount),
      itemCount,
      coupon,
      couponMessage,
      applyCoupon,
      removeCoupon,
      isOpen,
      setOpen,
      add,
      remove,
      setQty,
      clear,
      activeCampaign,
    };
  }, [lines, subtotal, coupon, couponMessage, applyCoupon, removeCoupon, isOpen, add, remove, setQty, clear, activeCampaign]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
