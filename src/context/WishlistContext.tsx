import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "@/context/ToastContext";

interface WishlistContextValue {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string, productName?: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const LS_WISHLIST = "aurex.wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [ids, setIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(LS_WISHLIST) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(LS_WISHLIST, JSON.stringify(ids));
  }, [ids]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string, productName?: string) =>
      setIds((prev) => {
        const isWished = prev.includes(id);
        if (isWished) {
          toast.info(productName ? `Removed ${productName} from wishlist.` : "Removed from wishlist.");
          return prev.filter((x) => x !== id);
        } else {
          toast.success(productName ? `Added ${productName} to wishlist.` : "Added to wishlist.");
          return [...prev, id];
        }
      }),
    [toast]
  );
  const remove = useCallback((id: string) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, count: ids.length, has, toggle, remove, clear }),
    [ids, has, toggle, remove, clear]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
