import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Flame, ShieldCheck, Recycle, Check, Minus, Plus, ShoppingBag, Truck, Heart, Star, Loader2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProductBySlug, getProducts } from "@/api/productApi";
import { orderApi } from "@/api/orderApi";
import { getProductReviews, createReview, type ReviewItem } from "@/api/reviewApi";
import { formatINR, discountPct } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import Rating from "@/components/Rating";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import type { Product, ProductVariant } from "@/services/types";

/** Pull a few reliable spec rows out of the (messy) source description. */
function parseSpecs(product: Product): [string, string][] {
  const d = typeof product.description === "string" ? product.description : "";
  const materialStr = typeof product.material === "string" ? product.material : (product.material ? String(product.material) : "—");
  const rows: [string, string][] = [["Material", materialStr]];
  if (Array.isArray(product.variants) && product.variants.length) {
    const sizeNames = product.variants.map((v) => (typeof v === 'string' ? v : v?.name || '')).filter(Boolean).join(", ");
    if (sizeNames) rows.push(["Sizes", sizeNames]);
  }
  const grab = (label: string, re: RegExp, cap = 120) => {
    const m = d.match(re);
    if (m && m[1]) {
      let v = m[1].trim().replace(/\s+/g, " ");
      if (v.length > cap) v = v.slice(0, cap).replace(/\s\S*$/, "") + "…";
      rows.push([label, v]);
    }
  };
  grab("Colour", /Colou?r\s*[–-]\s*([A-Za-z ]{3,20})/i, 24);
  grab("Weight", /Weight\s*\(kg\)\s*[–-]\s*([\d.]+)/i);
  const wr = rows.find((r) => r[0] === "Weight");
  if (wr) wr[1] += " kg";
  grab("Compatibility", /Compatibl[ey]\s*[–-]\s*([^–]+?)(?=\s+(?:Usage|Cleaning|Durability|Consumes|Warranty)\b|$)/i);
  return rows;
}

export default function ProductPage() {
  const { slug } = useParams();
  const { add, lines, setQty, activeCampaign } = useCart();
  const { has, toggle } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const toast = useToast();

  const { data: product, isLoading: loading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });
  
  const { data: liveReviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => getProductReviews(product!.id),
    enabled: !!product?.id,
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query user orders to verify delivery
  const { data: userOrders = [] } = useQuery({
    queryKey: ['user-orders-check', user?.id],
    queryFn: () => (user ? orderApi.getMyOrders() : Promise.resolve([])),
    enabled: !!user,
  });

  const hasPurchasedAndDelivered = useMemo(() => {
    if (!user || !product || !userOrders.length) return false;
    return userOrders.some(
      (o: any) =>
        o.orderStatus === 'DELIVERED' &&
        o.items.some(
          (item: any) =>
            (typeof item.product === 'object' && item.product !== null ? item.product._id : item.product) === product.id
        )
    );
  }, [user, product, userOrders]);

  const hasAlreadyReviewed = useMemo(() => {
    if (!user || !liveReviews || !liveReviews.length) return false;
    return liveReviews.some((r: any) => {
      const rUserId = typeof r.user === 'object' && r.user !== null ? (r.user._id || r.user.id) : r.user;
      return rUserId === user.id || rUserId === (user as any)._id;
    });
  }, [user, liveReviews]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (hasAlreadyReviewed) {
      toast.error("You have already submitted a rating for this product.");
      setShowReviewModal(false);
      return;
    }
    setIsSubmitting(true);
    try {
      await createReview({
        productId: product.id,
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim(),
      });
      toast.success("⭐ Rating submitted successfully! Thank you for your feedback.");
      setShowReviewModal(false);
      setNewTitle("");
      setNewComment("");
      setNewRating(5);
      refetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const { data: relatedResponse } = useQuery({
    queryKey: ['products', 'related', product?.categorySlug],
    queryFn: () => getProducts({ categorySlug: product?.categorySlug }),
    enabled: !!product?.categorySlug,
  });
  const related = relatedResponse || [];

  const [activeImg, setActiveImg] = useState(0);
  const [variant, setVariant] = useState<ProductVariant | undefined>(undefined);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  // Disable hover-zoom on touch devices — no mouseleave fires so the
  // magnified layer gets permanently stuck over the product image.
  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const specs = useMemo(() => (product ? parseSpecs(product) : []), [product]);

  if (loading) {
    return (
      <div className="container-x flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-copper" />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link to="/shop" className="btn-copper mt-4">Back to shop</Link>
      </div>
    );
  }

  const chosen = variant ?? product.variants.find((v) => !v.priceDelta) ?? product.variants[0];
  const gallery = chosen?.images?.length ? chosen.images : product.images;
  const unitPrice = product.price + (chosen?.priceDelta ?? 0);

  const hasCampaign = activeCampaign && activeCampaign.discountPercentage > 0;
  const qualifies = hasCampaign && (
    !activeCampaign.discountedProductIds ||
    activeCampaign.discountedProductIds.length === 0 ||
    activeCampaign.discountedProductIds.includes(product.id)
  );

  const finalUnitPrice = qualifies ? Math.round(unitPrice * (1 - activeCampaign.discountPercentage / 100)) : unitPrice;
  const comparePrice = qualifies ? (product.compareAtPrice ? (product.compareAtPrice + (chosen?.priceDelta ?? 0)) : unitPrice) : (product.compareAtPrice ? (product.compareAtPrice + (chosen?.priceDelta ?? 0)) : undefined);
  const off = discountPct(finalUnitPrice, comparePrice);
  const inStock = (chosen?.stock ?? product.stock) > 0;

  function selectVariant(v: ProductVariant) {
    setVariant(v);
    setActiveImg(0);
  }

  return (
    <div className="container-x py-10 pb-24 lg:pb-10">
      <Seo
        title={product.name}
        description={product.shortDescription}
        image={product.images[0]}
        type="product"
        canonicalPath={`/product/${product.slug}`}
        jsonLd={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: product.name, path: `/product/${product.slug}` },
          ]),
        ]}
      />
      <nav className="mb-6 flex items-center text-sm text-ink/50">
        <Link to="/" className="flex-shrink-0 hover:text-copper">Home</Link>
        <span className="mx-2 flex-shrink-0">/</span>
        <Link to={`/shop/${product.categorySlug}`} className="flex-shrink-0 capitalize hover:text-copper">
          {product.categorySlug.replace(/-/g, " ")}
        </Link>
        <span className="mx-2 flex-shrink-0">/</span>
        <span className="truncate text-ink/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery with corner hover-zoom (desktop) */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div
            className={`group relative aspect-square overflow-hidden rounded-xl2 bg-white ring-1 ring-ink/[0.06] ${canHover ? "cursor-zoom-in" : ""}`}
            {...(canHover ? {
              onMouseEnter: () => setZoom((z) => ({ ...z, active: true })),
              onMouseLeave: () => setZoom((z) => ({ ...z, active: false })),
              onMouseMove: (e: React.MouseEvent) => {
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({
                  active: true,
                  x: ((e.clientX - r.left) / r.width) * 100,
                  y: ((e.clientY - r.top) / r.height) * 100,
                });
              },
            } : {})}
          >
            <ProductImage
              src={gallery[activeImg]}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition-transform duration-200 ease-out"
            />
            {/* zoom layer follows the cursor */}
            <img
              src={gallery[activeImg]}
              alt=""
              aria-hidden
              className={`pointer-events-none absolute inset-0 h-full w-full object-contain p-2 transition-opacity duration-150 ${
                zoom.active ? "opacity-100" : "opacity-0"
              }`}
              style={{ transform: "scale(2.1)", transformOrigin: `${zoom.x}% ${zoom.y}%` }}
            />
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.65rem] font-medium text-cream opacity-0 transition-opacity group-hover:opacity-100">
              Hover to zoom
            </span>
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1.5 pt-1 px-1 -mx-1">
              {gallery.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white ring-2 sm:h-20 sm:w-20 ${
                    activeImg === i ? "ring-copper" : "ring-ink/10 hover:ring-ink/30"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-copper">{product.material}</p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">{product.name}</h1>
          <div className="mt-3">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>

          <div className="mt-5 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl font-semibold">{formatINR(finalUnitPrice)}</span>
              {comparePrice && comparePrice > finalUnitPrice && (
                <>
                  <span className="text-lg text-ink/40 line-through">
                    {formatINR(comparePrice)}
                  </span>
                  {off && <span className="chip bg-copper text-white">{off}% off</span>}
                </>
              )}
              <span className="text-xs text-ink/50">(incl. of all taxes)</span>
            </div>
            {qualifies && (
              <div className="mt-0.5">
                <span className="inline-block bg-forest/10 text-forest text-xs font-bold px-2.5 py-1 rounded-lg">
                  🎉 Auto-applied campaign discount: <strong>{activeCampaign.name}</strong> ({activeCampaign.discountPercentage}% Off)
                </span>
              </div>
            )}
          </div>

          <p className="mt-4 break-words text-ink/70">{product.shortDescription}</p>

          {/* Size selector — swaps gallery + price */}
          {product.variants.length > 1 && (
            <div className="mt-6">
              <p className="label">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVariant(v)}
                    disabled={v.stock === 0}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                      chosen?.id === v.id
                        ? "border-copper bg-copper text-white"
                        : "border-ink/15 hover:border-copper hover:text-copper"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + add */}
          <div className="mt-6 flex items-center gap-3">
            {lines.find((l) => l.productId === product.id && l.variantId === chosen?.id) ? (
              <div className="flex flex-1 items-center justify-between rounded-full border-2 border-copper bg-copper/5 px-2 py-0.5">
                <button
                  onClick={() => setQty(product.id, (lines.find((l) => l.productId === product.id && l.variantId === chosen?.id)?.quantity || 0) - 1, chosen?.id)}
                  className="grid h-11 w-11 place-items-center text-copper hover:bg-copper/10 rounded-full"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="w-16 text-center font-bold text-copper">
                  {lines.find((l) => l.productId === product.id && l.variantId === chosen?.id)?.quantity} in cart
                </span>
                <button
                  disabled={(lines.find((l) => l.productId === product.id && l.variantId === chosen?.id)?.quantity || 0) >= (chosen?.stock ?? product.stock)}
                  onClick={() => setQty(product.id, (lines.find((l) => l.productId === product.id && l.variantId === chosen?.id)?.quantity || 0) + 1, chosen?.id)}
                  className="grid h-11 w-11 place-items-center text-copper hover:bg-copper/10 rounded-full disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
            ) : (
              <button disabled={!inStock} onClick={() => add(product, chosen, 1)} className="btn-primary flex-1 py-3">
                {inStock ? "Add to cart" : "Out of stock"}
              </button>
            )}
            <button
              onClick={() => toggle(product.id, product.name)}
              className={`grid h-[46px] w-[46px] flex-shrink-0 place-items-center rounded-full border transition-all duration-300 shadow-sm ${
                has(product.id)
                  ? "border-copper bg-copper text-white"
                  : "border-ink/15 text-ink/70 hover:border-copper hover:text-copper hover:bg-white"
              }`}
              aria-label={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={20} className={has(product.id) ? "fill-current" : ""} />
            </button>
          </div>
          {inStock && chosen && (chosen.stock ?? product.stock) < 15 && (
            <p className="mt-2 text-sm font-medium text-copper">Only {chosen.stock ?? product.stock} left — order soon!</p>
          )}

          {/* Revamped Assurances Grid */}
          <div className="mt-8 border-y border-ink/[0.08] py-5 bg-sand/15 rounded-xl px-4 grid grid-cols-2 gap-4 text-xs">
            {[
              { Icon: Flame, t: "Even Heat", s: "Aluminium-core triply base" },
              { Icon: ShieldCheck, t: "Induction-Ready", s: "Gas & induction compatibility" },
              { Icon: Recycle, t: "Toxin-Free", s: "No harmful chemical coatings" },
              { Icon: Truck, t: "Free Shipping", s: "Free shipping across India" },
            ].map(({ Icon, t, s }) => (
              <div key={t} className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-copper/10 text-copper flex-shrink-0">
                  <Icon size={16} />
                </div>
                <div className="leading-tight">
                  <p className="font-bold text-ink">{t}</p>
                  <p className="text-[10px] text-ink/50 mt-0.5">{s}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Specifications */}
          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Specifications</h2>
              <dl className="mt-3 divide-y divide-ink/[0.06] overflow-hidden rounded-xl2 ring-1 ring-ink/[0.06]">
                {specs.map(([k, v], idx) => {
                  const keyText = typeof k === 'object' ? JSON.stringify(k) : String(k ?? '');
                  const valText = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
                  return (
                    <div key={keyText || idx} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-3 text-sm odd:bg-sand/40">
                      <dt className="font-medium text-ink/60">{keyText}</dt>
                      <dd className="min-w-0 break-words text-ink/80">{valText}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Description + features */}
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="mt-3 break-words leading-relaxed text-ink/75">
            {typeof product.description === 'string' ? product.description : String(product.description || '')}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="mt-3 space-y-2">
            {product.features?.map((f, idx) => {
              const featureText = typeof f === 'object' ? ((f as any)?.title || (f as any)?.value || (f as any)?.name || '') : String(f);
              if (!featureText) return null;
              return (
                <li key={idx} className="flex items-start gap-2 text-ink/75">
                  <Check size={18} className="mt-0.5 flex-shrink-0 text-copper" /> {featureText}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <div className="mt-14 border-t border-ink/10 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
              Customer Ratings & Reviews
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-ink/70">
              <div className="flex items-center gap-1 font-bold text-ink">
                <Star size={14} className="fill-gold text-gold" />
                <span>{product.rating ? product.rating.toFixed(1) : "5.0"} out of 5</span>
              </div>
              <span>·</span>
              <span>Based on {liveReviews.length > 0 ? liveReviews.length : (product.reviewCount || 1)} verified reviews</span>
            </div>
          </div>

          {hasPurchasedAndDelivered && (
            hasAlreadyReviewed ? (
              <div className="bg-sand/60 text-ink/70 border border-ink/10 text-xs py-2 px-3.5 font-bold rounded-xl flex items-center gap-1.5 w-fit">
                <Check size={14} className="text-forest" /> Rating Already Submitted
              </div>
            ) : (
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn-copper text-xs py-2.5 px-4 font-bold flex items-center gap-2 w-fit shadow-sm"
              >
                <Star size={13} className="fill-gold text-gold" /> Rate Your Purchase
              </button>
            )
          )}
        </div>

        {liveReviews && liveReviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {liveReviews.map((r: any) => {
              const authorName = r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || 'Verified Customer' : 'Verified Buyer';
              const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
              return (
                <div key={r._id || r.id} className="card p-5 bg-white rounded-xl2 border border-ink/5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <Rating value={r.rating} />
                    <span className="chip bg-forest/10 text-forest text-[10px] font-bold">
                      <Check size={11} className="inline mr-0.5" /> Verified Buyer
                    </span>
                  </div>
                  {r.title && <p className="font-bold text-sm text-ink">{r.title}</p>}
                  <p className="text-xs leading-relaxed text-ink/75">{r.comment}</p>
                  <p className="text-[11px] text-ink/40 pt-2 border-t border-ink/5">
                    — {authorName} {dateStr && `· ${dateStr}`}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-sand/20 rounded-2xl border border-ink/5 text-center max-w-md mx-auto space-y-2">
            <div className="flex justify-center gap-1 text-gold">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} className="fill-gold" />
              ))}
            </div>
            <p className="text-xs font-bold text-ink">Verified Reviews Only</p>
            <p className="text-[11px] text-ink/60 leading-relaxed">
              Customer reviews on Aurex are submitted exclusively by verified buyers after successful order delivery.
            </p>
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-ink/10 relative animate-scale-up">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-sand/60 text-ink/60 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-ink/10">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border border-ink/5 bg-sand/30"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-copper">
                  Leave a Review
                </span>
                <h3 className="text-sm font-bold text-ink truncate">{product.name}</h3>
              </div>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-2">Overall Rating</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (ratingHover || newRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setRatingHover(star)}
                          onMouseLeave={() => setRatingHover(0)}
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            size={26}
                            className={`${
                              isFilled
                                ? "fill-gold text-gold"
                                : "text-gray-200 fill-gray-100"
                            } transition-colors`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-ink/70 ml-2">
                    {newRating === 5 && "⭐ Excellent"}
                    {newRating === 4 && "⭐ Very Good"}
                    {newRating === 3 && "⭐ Good"}
                    {newRating === 2 && "⭐ Fair"}
                    {newRating === 1 && "⭐ Needs Improvement"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Headline <span className="text-ink/40 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Excellent heat retention and heavy build!"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-ink/15 focus:border-copper focus:ring-2 focus:ring-copper/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Your Detailed Experience <span className="text-ink/40 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Describe the cooking performance, build quality, and ease of cleaning..."
                  className="w-full text-xs p-3.5 rounded-xl border border-ink/15 focus:border-copper focus:ring-2 focus:ring-copper/10 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-ink/70 hover:bg-sand/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-copper text-xs py-2 px-5 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Related */}
      {related && related.filter((p) => p.id !== product.id).length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 backdrop-blur-md px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.85rem)] shadow-[0_-8px_25px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex items-center justify-between gap-3">
          {/* Price & Variant Information */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg font-black text-ink tracking-tight">{formatINR(unitPrice)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-xs text-ink/40 line-through">
                    {formatINR(product.compareAtPrice + (chosen?.priceDelta ?? 0))}
                  </span>
                  <span className="text-[10px] font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded">
                    {off}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="truncate text-[11px] text-ink/60 mt-0.5">
              {chosen?.name || product.name}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => toggle(product.id, product.name)}
              className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl border transition-all duration-200 shadow-2xs active:scale-95 ${
                has(product.id)
                  ? "border-copper bg-copper text-white shadow-copper/20"
                  : "border-ink/15 text-ink/70 bg-sand/20 hover:border-copper hover:text-copper"
              }`}
              aria-label={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={18} className={has(product.id) ? "fill-current" : ""} />
            </button>

            {lines.find((l) => l.productId === product.id && l.variantId === chosen?.id) ? (
              <div className="flex h-11 items-center justify-between rounded-2xl border-2 border-copper bg-copper/10 px-2 shadow-2xs">
                <button
                  onClick={() =>
                    setQty(
                      product.id,
                      (lines.find((l) => l.productId === product.id && l.variantId === chosen?.id)?.quantity || 0) - 1,
                      chosen?.id
                    )
                  }
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white text-copper shadow-2xs active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center text-sm font-black text-copper">
                  {lines.find((l) => l.productId === product.id && l.variantId === chosen?.id)?.quantity}
                </span>
                <button
                  disabled={
                    (lines.find((l) => l.productId === product.id && l.variantId === chosen?.id)?.quantity || 0) >=
                    (chosen?.stock ?? product.stock)
                  }
                  onClick={() =>
                    setQty(
                      product.id,
                      (lines.find((l) => l.productId === product.id && l.variantId === chosen?.id)?.quantity || 0) + 1,
                      chosen?.id
                    )
                  }
                  className="grid h-8 w-8 place-items-center rounded-xl bg-white text-copper shadow-2xs disabled:opacity-40 active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            ) : (
              <button
                disabled={!inStock}
                onClick={() => add(product, chosen, 1)}
                className="h-11 px-5 rounded-2xl bg-copper hover:bg-copper-dark text-white font-bold text-xs tracking-wide shadow-md shadow-copper/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              >
                <ShoppingBag size={16} />
                <span>{inStock ? "Add to Cart" : "Sold Out"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
