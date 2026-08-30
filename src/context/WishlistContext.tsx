import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  useRef,
} from "react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { wishlistApi } from "@/api/wishlistApi";
import { trackUserActivity } from "@/utils/activityTracker";

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
const LS_PENDING_WISHLIST = "aurex.pending_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { user, openAuthModal } = useAuth();

  const [ids, setIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(LS_WISHLIST) ?? "[]");
    } catch {
      return [];
    }
  });

  const idsRef = useRef(ids);

  useEffect(() => {
    idsRef.current = ids;
    window.localStorage.setItem(LS_WISHLIST, JSON.stringify(ids));
  }, [ids]);

  useEffect(() => {
    if (user) {
      wishlistApi.getWishlist().then((res) => {
        console.log("DEBUG WISHLIST RES:", res);
        const data = res.data?.wishlist?.products || res.wishlist?.products || res.data?.products || res.products || (Array.isArray(res.data) ? res.data : []) || (Array.isArray(res) ? res : []);
        console.log("DEBUG WISHLIST DATA EXTRACTED:", data);
        const validIds = Array.isArray(data) ? data.map((i: any) => i.product?._id || i._id || i.id || i.product?.id).filter(Boolean) : [];
        console.log("DEBUG WISHLIST VALID IDS:", validIds);
        setIds(validIds);
      }).catch(err => {
        console.error("DEBUG WISHLIST ERROR:", err);
      });
    } else {
      setIds([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const pendingId = window.localStorage.getItem(LS_PENDING_WISHLIST);
      if (pendingId) {
        window.localStorage.removeItem(LS_PENDING_WISHLIST);
        wishlistApi.addToWishlist(pendingId).then(() => {
          setIds((prev) => {
            if (!prev.includes(pendingId)) return [...prev, pendingId];
            return prev;
          });
          toast.success("Added pending item to wishlist.");
        }).catch(console.error);
      }
    }
  }, [user, toast]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    async (id: string, productName?: string) => {
      if (!user) {
        window.localStorage.setItem(LS_PENDING_WISHLIST, id);
        toast.info("Please login to wishlist this item.");
        openAuthModal("login");
        return;
      }

      const isWished = idsRef.current.includes(id);

      // Optimistic update
      setIds((prev) => isWished ? prev.filter((x) => x !== id) : [...prev, id]);

      try {
        if (isWished) {
          await wishlistApi.removeFromWishlist(id);
          toast.info(productName ? `Removed ${productName} from wishlist.` : "Removed from wishlist.");
          trackUserActivity({
            eventType: 'REMOVE_FROM_WISHLIST',
            item: { id, name: productName }
          });
        } else {
          await wishlistApi.addToWishlist(id);
          toast.success(productName ? `Added ${productName} to wishlist.` : "Added to wishlist.");
          trackUserActivity({
            eventType: 'ADD_TO_WISHLIST',
            item: { id, name: productName }
          });
        }
      } catch (error) {
        // Revert on failure
        setIds((prev) => isWished ? [...prev, id] : prev.filter((x) => x !== id));
        toast.error("Failed to update wishlist.");
      }
    },
    [user, openAuthModal, toast]
  );

  const remove = useCallback(async (id: string) => {
    if (!user) {
      setIds((prev) => prev.filter((x) => x !== id));
      return;
    }

    setIds((prev) => prev.filter((x) => x !== id));
    try {
      await wishlistApi.removeFromWishlist(id);
    } catch (error) {
      setIds((prev) => [...prev, id]);
      toast.error("Failed to remove from wishlist.");
    }
  }, [user, toast]);
  const clear = useCallback(async () => {
    const currentIds = idsRef.current;
    setIds([]);
    if (user && currentIds.length > 0) {
      try {
        await Promise.all(currentIds.map(id => wishlistApi.removeFromWishlist(id)));
      } catch (err) {
        console.error("Failed to clear wishlist on server", err);
      }
    }
  }, [user]);

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
