import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, Tag, X, ShoppingBag, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import { payments, isPaymentConfigured } from "@/services/payments";
import { openRazorpay } from "@/lib/razorpay";
import { formatINR } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import CouponsModal from "@/components/CouponsModal";
import Seo from "@/components/Seo";
import { couponApi } from "@/api/couponApi";

const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917814477667";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    lines, subtotal, discount, total, itemCount,
    coupon, couponMessage, applyCoupon, removeCoupon,
    setQty, remove, clear, campaignDiscount, activeCampaign
  } = useCart();
  const { user, openAuthModal } = useAuth();

  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  // Fetch available coupons from backend
  const { data: publicCoupons } = useAsync(() => couponApi.getPublicCoupons(), []);

  // "You may also like" — products not in the cart, same categories first.
  const { data: allProducts } = useAsync(() => data.getProducts(), []);
  const recommendations = useMemo(() => {
    if (!allProducts) return [];
    const cartIds = new Set(lines.map((l) => l.productId));
    const cartCats = new Set(
      allProducts.filter((p) => cartIds.has(p.id)).map((p) => p.categorySlug)
    );
    const candidates = allProducts.filter((p) => !cartIds.has(p.id));
    const sameCat = candidates.filter((p) => cartCats.has(p.categorySlug));
    const rest = candidates.filter((p) => !cartCats.has(p.categorySlug));
    return [...sameCat, ...rest].slice(0, 4);
  }, [allProducts, lines]);

  const mrpTotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const mrp = l.compareAtPrice && l.compareAtPrice > l.unitPrice ? l.compareAtPrice : l.unitPrice;
      return sum + mrp * l.quantity;
    }, 0);
  }, [lines]);

  const itemDiscount = useMemo(() => {
    return Math.max(0, mrpTotal - subtotal);
  }, [mrpTotal, subtotal]);

  const totalSavings = useMemo(() => {
    return itemDiscount + discount + campaignDiscount;
  }, [itemDiscount, discount, campaignDiscount]);

  // Find the single best suggested coupon for the current cart
  const suggestedCoupon: any = useMemo(() => {
    if (!publicCoupons || publicCoupons.length === 0 || coupon) return null;

    // Filter eligible coupons and calculate exact savings
    const eligible = publicCoupons
      .filter((c) => !c.minimumOrderValue || subtotal >= c.minimumOrderValue)
      .map((c) => {
        let savings = 0;
        if (c.discountType === "PERCENTAGE") {
          const raw = Math.round((subtotal * c.discountValue) / 100);
          savings = c.maximumDiscount ? Math.min(raw, c.maximumDiscount) : raw;
        } else {
          savings = Math.min(c.discountValue, subtotal);
        }
        return { ...c, savings, isEligible: true };
      })
      .sort((a, b) => (b.savings || 0) - (a.savings || 0));

    if (eligible.length > 0) return eligible[0];

    // If no coupon is eligible yet, recommend the one with closest unlocking threshold
    const closest = publicCoupons
      .filter((c) => (c.minimumOrderValue || 0) > subtotal)
      .map((c) => ({
        ...c,
        gap: (c.minimumOrderValue || 0) - subtotal,
        isEligible: false,
      }))
      .sort((a, b) => a.gap - b.gap);

    return closest.length > 0 ? closest[0] : null;
  }, [publicCoupons, subtotal, coupon]);

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    await applyCoupon(code);
    setApplying(false);
  }

  const [payError, setPayError] = useState("");

  // Pre-compute coupon card render helper (used in both inline and modal)
  const useModalForCoupons = (publicCoupons?.length ?? 0) > 2;

  const renderCouponCard = (c: any) => {
    const discountText = c.discountType === 'PERCENTAGE'
      ? `${c.discountValue}% off${c.maximumDiscount ? ` (up to ${formatINR(c.maximumDiscount)})` : ''}`
      : `${formatINR(c.discountValue)} off`;
    const conditionText = c.description ||
      (c.minimumOrderValue > 0
        ? `Min. order ${formatINR(c.minimumOrderValue)}`
        : 'No minimum order required');
    return (
      <div
        key={c._id}
        className="flex items-center justify-between rounded-lg border border-dashed border-copper/40 bg-copper/[0.03] px-3 py-2.5"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-copper bg-copper/10 px-1.5 py-0.5 rounded">{c.code}</span>
            <span className="text-xs font-semibold text-ink">{discountText}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-ink/50">{conditionText}</p>
        </div>
        <button
          onClick={() => {
            setCode(c.code);
            setShowAllCoupons(false);
            setApplying(true);
            applyCoupon(c.code).finally(() => setApplying(false));
          }}
          disabled={applying}
          className="ml-3 flex-shrink-0 text-xs font-bold text-copper hover:text-white hover:bg-copper border border-copper rounded-lg px-2.5 py-1 transition-all"
        >
          Apply
        </button>
      </div>
    );
  };

  async function placeOrder() {
    const order = await data.createOrder(user!.id, lines, undefined, coupon?.code);
    setPlacedId(order.id);
    clear();
  }

  function checkout() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    navigate("/checkout");
  }

  if (placedId) {
    return (
      <div className="container-x py-20">
        <Seo title="Order Confirmed" noindex />
        <div className="mx-auto max-w-lg card p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest/10 text-forest">
            <Check size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Order placed!</h1>
          <p className="mt-2 text-ink/60">
            Your order <span className="font-semibold text-ink">{placedId}</span> is confirmed.
            Payment is being set up — our team will reach out on WhatsApp to finalise delivery.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/account" className="btn-primary">View my orders</Link>
            <Link to="/shop" className="btn-outline">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <Seo title="Your Cart" noindex />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sand">
          <ShoppingBag className="text-ink/40" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Discover cookware built to last a lifetime.</p>
        <Link to="/shop" className="btn-copper mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-6 sm:py-10 max-w-full overflow-x-hidden">
      <Seo title="Your Cart" noindex />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold">Your cart <span className="text-base sm:text-lg font-normal text-ink/50">({itemCount} items)</span></h1>
        <button onClick={clear} className="text-xs text-ink/40 hover:text-red-600 transition-colors flex items-center gap-1.5 font-medium">
          <Trash2 size={13} />Clear cart
        </button>
      </div>

      <div className="mt-6 sm:mt-8 grid gap-6 lg:gap-8 lg:grid-cols-[1fr_360px] items-start">
        {/* Lines */}
        <div className="space-y-3.5 sm:space-y-4">
          {lines.map((l) => (
            <div
              key={`${l.productId}-${l.variantId ?? ""}`}
              className="card p-3.5 sm:p-4 rounded-2xl flex gap-3 sm:gap-4 items-center bg-white border border-ink/10 shadow-2xs transition-all hover:border-ink/20 w-full overflow-hidden"
            >
              {/* Product Thumbnail */}
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-xl bg-sand/25 border border-ink/5 overflow-hidden flex items-center justify-center p-1.5 self-start">
                <img
                  src={l.image}
                  alt={l.name}
                  className="h-full w-full object-contain mix-blend-multiply transition-transform hover:scale-105"
                />
              </div>

              {/* Product Info & Actions */}
              <div className="flex flex-1 flex-col min-w-0 self-stretch justify-between py-0.5">
                {/* Top: Name & Remove */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/product/${l.slug}`}
                      className="text-xs sm:text-sm font-bold text-ink leading-snug line-clamp-2 hover:text-copper transition-colors"
                    >
                      {l.name}
                    </Link>
                    <button
                      onClick={() => remove(l.productId, l.variantId)}
                      className="p-1 text-ink/35 hover:text-red-600 transition-colors flex-shrink-0"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {l.shortDescription && (
                    <p className="mt-1 line-clamp-1 text-xs text-ink/60">
                      {l.shortDescription}
                    </p>
                  )}

                  {l.variantName && (
                    <span className="inline-block mt-1 text-[11px] font-semibold text-copper bg-copper/10 px-2 py-0.5 rounded-md">
                      {l.variantName}
                    </span>
                  )}
                </div>

                {/* Bottom: Qty Selector & Price Alignment */}
                <div className="mt-3 flex items-end justify-between gap-2 sm:gap-3 pt-2 border-t border-ink/5">
                  {/* Quantity Counter */}
                  <div className="flex items-center rounded-xl border border-ink/15 bg-sand/20 shadow-2xs">
                    <button
                      onClick={() => setQty(l.productId, l.quantity - 1, l.variantId)}
                      disabled={l.quantity <= 1}
                      className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center text-ink/70 disabled:opacity-25 hover:text-copper transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-black text-ink">
                      {l.quantity}
                    </span>
                    <button
                      onClick={() => setQty(l.productId, l.quantity + 1, l.variantId)}
                      className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center text-ink/70 hover:text-copper transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Price & Savings */}
                  <div className="text-right leading-tight">
                    <div className="text-sm sm:text-base font-black text-ink">
                      {formatINR(l.unitPrice * l.quantity)}
                    </div>
                    {l.compareAtPrice && l.compareAtPrice > l.unitPrice && (
                      <div className="flex items-center justify-end gap-1.5 mt-0.5 text-[10px] sm:text-xs">
                        <span className="text-ink/40 line-through">
                          {formatINR(l.compareAtPrice * l.quantity)}
                        </span>
                        <span className="font-bold text-forest">
                          {Math.round(((l.compareAtPrice - l.unitPrice) / l.compareAtPrice) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card p-4 sm:p-6 w-full max-w-full overflow-hidden">
            <h2 className="text-lg font-semibold">Order summary</h2>

            {/* Coupon */}
            <div className="mt-4 space-y-3">
              {/* Suggested / Best Coupon Banner */}
              {!coupon && suggestedCoupon && (
                <div
                  className={`p-3 rounded-2xl border transition-all w-full min-w-0 overflow-hidden ${suggestedCoupon.isEligible
                      ? "bg-gradient-to-r from-copper/10 via-sand/30 to-amber-500/5 border-copper/30 shadow-2xs"
                      : "bg-sand/20 border-ink/10"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-[11px] sm:text-xs font-black text-ink bg-white border border-dashed border-copper/50 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-2xs flex-shrink-0">
                        {suggestedCoupon.code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] sm:text-xs font-bold text-ink truncate">
                          {suggestedCoupon.isEligible
                            ? `Save ${formatINR(suggestedCoupon.savings)}`
                            : `Add ${formatINR(suggestedCoupon.gap)} to unlock`}
                        </p>
                        <p className="text-[10px] text-ink/50 truncate">
                          {suggestedCoupon.isEligible ? "Best deal" : "Special discount"}
                        </p>
                      </div>
                    </div>

                    {suggestedCoupon.isEligible ? (
                      <button
                        type="button"
                        onClick={() => {
                          setApplying(true);
                          applyCoupon(suggestedCoupon.code).finally(() => setApplying(false));
                        }}
                        disabled={applying}
                        className="text-[11px] sm:text-xs font-black uppercase text-white bg-copper hover:bg-copper-dark px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs transition-all flex-shrink-0 active:scale-95"
                      >
                        {applying ? "…" : "Apply"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAllCoupons(true)}
                        className="text-xs font-bold text-copper hover:underline flex-shrink-0"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Input or Applied Badge */}
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-forest/10 border border-forest/20 px-3.5 py-2.5 text-xs text-forest">
                  <span className="flex items-center gap-1.5 font-bold"><Tag size={13} /> {coupon.code} Applied</span>
                  <button onClick={removeCoupon} aria-label="Remove coupon" className="hover:opacity-75"><X size={15} /></button>
                </div>
              ) : (
                <form onSubmit={onApply} className="flex gap-2 w-full min-w-0">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input font-mono text-xs uppercase min-w-0 flex-1"
                  />
                  <button type="submit" disabled={applying} className="btn-outline whitespace-nowrap text-xs font-bold flex-shrink-0 px-3">
                    {applying ? "…" : "Apply"}
                  </button>
                </form>
              )}
              {couponMessage && (
                <p className={`text-xs ${coupon ? "text-forest" : "text-red-600"}`}>{couponMessage}</p>
              )}

              {/* Available Coupons trigger */}
              {publicCoupons && publicCoupons.length > 0 && !coupon && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowAllCoupons(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-copper hover:underline w-full justify-center transition-colors"
                  >
                    <Tag size={12} className="text-copper" />
                    <span>View all available coupons ({publicCoupons.length}) →</span>
                  </button>
                </div>
              )}

            </div>

            <dl className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm">
              {itemDiscount > 0 ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-ink/60">Total MRP</dt>
                    <dd className="text-ink/70 line-through">{formatINR(mrpTotal)}</dd>
                  </div>
                  <div className="flex justify-between text-forest">
                    <dt>Discount on MRP</dt>
                    <dd>−{formatINR(itemDiscount)}</dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-ink/60">Subtotal</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-forest"><dt>Coupon Discount</dt><dd>−{formatINR(discount)}</dd></div>
              )}
              {campaignDiscount > 0 && (
                <div className="flex justify-between text-forest"><dt>Promo ({activeCampaign?.name})</dt><dd>−{formatINR(campaignDiscount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-ink/60">Shipping</dt><dd className="text-forest">Free</dd></div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-semibold">
                <dt>Total</dt><dd>{formatINR(total)}</dd>
              </div>
              {totalSavings > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-forest/[0.06] border border-forest/15 px-3.5 py-2.5 text-xs text-forest">
                  <div className="flex items-center gap-2 font-medium">
                    <div className="grid h-5 w-5 place-items-center rounded-full bg-forest/15 text-forest">
                      <Sparkles size={11} />
                    </div>
                    <span>You're saving on this order</span>
                  </div>
                  <span className="font-bold text-sm tracking-tight text-forest">{formatINR(totalSavings)}</span>
                </div>
              )}
            </dl>

            <button onClick={checkout} className="btn-primary mt-5 w-full py-3 text-sm font-semibold tracking-wide shadow-lift">
              {!user ? "Login to checkout" : `Proceed to Checkout · ${formatINR(total)}`}
            </button>
            <p className="mt-2.5 text-center text-[11px] text-ink/45">
              🔒 256-Bit Secure Checkout · Free Express Delivery
            </p>
          </div>
        </aside>
      </div>

      {/* You may also like */}
      {recommendations.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Luxury Coupons Modal */}
      <CouponsModal
        isOpen={showAllCoupons}
        onClose={() => setShowAllCoupons(false)}
        coupons={publicCoupons || []}
        appliedCouponCode={coupon?.code}
        subtotal={subtotal}
        onApplyCoupon={async (code) => {
          return await applyCoupon(code);
        }}
        onRemoveCoupon={removeCoupon}
      />
    </div>
  );
}
