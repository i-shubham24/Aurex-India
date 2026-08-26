import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { data } from "@/services";
import type { Coupon, CartLine, Product, ProductVariant } from "@/services/types";
import { useToast } from "@/context/ToastContext";

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
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(LS_CART) ?? "[]");
    } catch {
      return [];
    }
  });
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
    fetch("http://localhost:5002/api/v1/campaigns/active")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.campaign) {
          setActiveCampaign(res.data.campaign);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch active campaign.", err);
      });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LS_CART, JSON.stringify(lines));
  }, [lines]);

  const add = useCallback(
    (product: Product, variant?: ProductVariant, qty = 1) => {
      const unitPrice = product.price + (variant?.priceDelta ?? 0);
      const key = lineKey(product.id, variant?.id);
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
            image: variant?.images?.[0] ?? product.images[0],
            variantId: variant?.id,
            variantName: variant?.name,
            unitPrice,
            quantity: qty,
          },
        ];
      });
      toast.success(`Added ${product.name} to cart.`);
      setOpen(true);
    },
    [toast]
  );

  const remove = useCallback((productId: string, variantId?: string) => {
    const key = lineKey(productId, variantId);
    setLines((prev) =>
      prev.filter((l) => lineKey(l.productId, l.variantId) !== key)
    );
  }, []);

  const setQty = useCallback(
    (productId: string, qty: number, variantId?: string) => {
      const key = lineKey(productId, variantId);
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => lineKey(l.productId, l.variantId) !== key)
          : prev.map((l) =>
              lineKey(l.productId, l.variantId) === key
                ? { ...l, quantity: qty }
                : l
            )
      );
    },
    []
  );

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines]
  );

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponMessage("");
    window.localStorage.removeItem(LS_COUPON);
    toast.info("Coupon removed.");
  }, [toast]);

  const applyCoupon = useCallback(
    async (code: string) => {
      const res = await data.validateCoupon(code, subtotal);
      setCouponMessage(res.message);
      if (res.ok && res.coupon) {
        setCoupon(res.coupon);
        window.localStorage.setItem(LS_COUPON, JSON.stringify(res.coupon));
        toast.success(`Coupon "${code}" applied successfully!`);
        return true;
      }
      setCoupon(null);
      window.localStorage.removeItem(LS_COUPON);
      toast.error(res.message || "Invalid coupon code.");
      return false;
    },
    [subtotal, toast]
  );

  const clear = useCallback(() => {
    setLines([]);
    removeCoupon();
  }, [removeCoupon]);

  // Re-validate the coupon whenever the subtotal changes (e.g. a min-spend
  // coupon that no longer qualifies after removing items).
  useEffect(() => {
    if (!coupon) return;
    data.validateCoupon(coupon.code, subtotal).then((res) => {
      if (!res.ok) removeCoupon();
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
