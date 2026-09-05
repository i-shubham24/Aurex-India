import { useState, useEffect } from "react";
import { Star, X, Check, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi, BackendOrder } from "@/api/orderApi";
import { createReview, getMyReviews } from "@/api/reviewApi";
import { useToast } from "@/context/ToastContext";

export default function DeliveredOrderReviewPrompt() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: myReviewsData } = useQuery({
    queryKey: ['my-reviews', user?.id],
    queryFn: getMyReviews,
    enabled: !!user,
  });

  const backendReviewedIds = myReviewsData?.reviewedProductIds || [];

  const [promptItem, setPromptItem] = useState<{
    orderId: string;
    productId: string;
    productName: string;
    productImage?: string;
    deliveredCity?: string;
  } | null>(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const uid = user?.id || (user as any)?._id;
  const userReviewedKey = uid ? `aurex_reviewed_products_${uid}` : null;
  const dismissedOrderKey = uid ? `aurex_dismissed_review_prompts_${uid}` : null;

  useEffect(() => {
    if (!user) {
      setPromptItem(null);
      return;
    }

    // Clean up legacy global key if present to prevent cross-user contamination
    try {
      localStorage.removeItem("aurex_reviewed_products");
    } catch {}

    let isMounted = true;

    // Small delay so it feels natural and smooth
    const timer = setTimeout(async () => {
      try {
        const userReviewedIds: string[] = userReviewedKey
          ? JSON.parse(localStorage.getItem(userReviewedKey) || "[]")
          : [];
        const dismissedOrderIds: string[] = dismissedOrderKey
          ? JSON.parse(sessionStorage.getItem(dismissedOrderKey) || "[]")
          : [];

        const orders: BackendOrder[] = await orderApi.getOrders();
        if (!isMounted || !orders || !orders.length) return;

        // Find first delivered order with an unreviewed product for THIS user
        const deliveredOrders = orders.filter((o) => o.orderStatus === "DELIVERED");

        for (const order of deliveredOrders) {
          if (dismissedOrderIds.includes(order._id)) continue;

          for (const item of order.items) {
            const prodId =
              typeof item.product === "object" && item.product !== null
                ? (item.product as any)._id
                : item.product;

            const isAlreadyReviewed =
              prodId &&
              (userReviewedIds.some((id) => id?.toString() === prodId?.toString()) ||
                backendReviewedIds.some((id) => id?.toString() === prodId?.toString()));

            if (prodId && !isAlreadyReviewed) {
              setPromptItem({
                orderId: order._id,
                productId: prodId,
                productName: item.name,
                productImage: item.image,
                deliveredCity: order.shippingAddress?.city,
              });
              return;
            }
          }
        }
      } catch (err) {
        console.warn("DeliveredOrderReviewPrompt error", err);
      }
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user, backendReviewedIds, userReviewedKey, dismissedOrderKey]);

  const handleDismiss = () => {
    if (promptItem && dismissedOrderKey) {
      const dismissed: string[] = JSON.parse(
        sessionStorage.getItem(dismissedOrderKey) || "[]"
      );
      if (!dismissed.includes(promptItem.orderId)) {
        dismissed.push(promptItem.orderId);
        sessionStorage.setItem(dismissedOrderKey, JSON.stringify(dismissed));
      }
    }
    setPromptItem(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptItem) return;

    setIsSubmitting(true);
    try {
      await createReview({
        productId: promptItem.productId,
        orderId: promptItem.orderId,
        rating,
        title: `${rating} Star Rating`,
        comment: comment.trim() || "Excellent cookware quality, heats evenly and looks beautiful.",
      });

      setIsSubmitted(true);
      toast.success("⭐ Thank you! Your review is now live.");

      if (userReviewedKey) {
        const reviewed: string[] = JSON.parse(
          localStorage.getItem(userReviewedKey) || "[]"
        );
        if (!reviewed.includes(promptItem.productId)) {
          reviewed.push(promptItem.productId);
          localStorage.setItem(userReviewedKey, JSON.stringify(reviewed));
        }
      }

      const currentUid = user?.id || (user as any)?._id;
      if (currentUid) {
        queryClient.setQueryData(['my-reviews', currentUid], (old: any) => {
          if (!old) return { reviews: [], reviewedProductIds: [promptItem.productId] };
          return {
            ...old,
            reviewedProductIds: Array.from(new Set([...(old.reviewedProductIds || []), promptItem.productId])),
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });

      setTimeout(() => {
        setPromptItem(null);
        setIsSubmitted(false);
      }, 2200);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
      setIsSubmitting(false);
    }
  };

  if (!promptItem) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-ink/10 overflow-hidden animate-fade-up">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-copper to-copper-dark px-4 py-2.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Sparkles size={14} className="text-gold animate-pulse" />
          <span>Order Delivered!</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white p-1 rounded-full transition-colors"
          aria-label="Dismiss prompt"
        >
          <X size={15} />
        </button>
      </div>

      {isSubmitted ? (
        <div className="p-6 text-center space-y-2 animate-scale-up">
          <div className="w-12 h-12 rounded-full bg-forest/10 text-forest mx-auto flex items-center justify-center">
            <Check size={24} />
          </div>
          <h4 className="font-bold text-ink text-sm">Review Submitted!</h4>
          <p className="text-xs text-ink/60">
            Thank you for helping fellow cooks with your verified review.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3.5">
          {/* Product Info */}
          <div className="flex items-center gap-3">
            {promptItem.productImage && (
              <img
                src={promptItem.productImage}
                alt={promptItem.productName}
                className="w-12 h-12 rounded-xl object-cover border border-ink/5 bg-sand/30 flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-copper">
                How was your experience?
              </p>
              <h4 className="text-xs font-bold text-ink truncate">{promptItem.productName}</h4>
              {promptItem.deliveredCity && (
                <p className="text-[10px] text-ink/40">Delivered to {promptItem.deliveredCity}</p>
              )}
            </div>
          </div>

          {/* Interactive 5 Star Selector */}
          <div className="bg-sand/20 rounded-xl p-3 text-center space-y-1.5 border border-ink/5">
            <p className="text-[11px] font-bold text-ink/70">Tap stars to rate:</p>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      setRating(star);
                      setShowInput(true);
                    }}
                    className="p-1 hover:scale-125 active:scale-95 transition-transform focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={`${
                        isFilled ? "fill-gold text-gold" : "text-gray-200 fill-gray-100"
                      } transition-colors`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-bold text-copper block">
              {rating === 5 && "⭐ 5/5 · Excellent"}
              {rating === 4 && "⭐ 4/5 · Very Good"}
              {rating === 3 && "⭐ 3/5 · Good"}
              {rating === 2 && "⭐ 2/5 · Fair"}
              {rating === 1 && "⭐ 1/5 · Needs Improvement"}
            </span>
          </div>

          {/* Optional Review Comment (Accordion or expandable) */}
          {showInput ? (
            <div className="space-y-1.5 animate-fade-in">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Share your thoughts on heat distribution, build, or finish (optional)..."
                className="w-full text-xs p-2.5 rounded-xl border border-ink/15 focus:border-copper focus:ring-2 focus:ring-copper/10 outline-none resize-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="text-[11px] font-semibold text-copper hover:underline text-center w-full block"
            >
              + Add a short written review
            </button>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 py-2 text-xs font-semibold text-ink/60 hover:bg-sand/40 rounded-xl transition-colors"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="flex-1 py-2 bg-copper hover:bg-copper-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <Star size={12} className="fill-white" />
                  <span>Submit Rating</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
