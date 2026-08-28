import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Star, Minus, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getProductBySlug } from "@/api/productApi";
import type { Product } from "@/services/types";
import { formatINR, discountPct } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const { add, lines, setQty, activeCampaign } = useCart();
  const { has, toggle } = useWishlist();

  const handlePrefetch = () => {
    if (product?.slug) {
      queryClient.prefetchQuery({
        queryKey: ['product', product.slug],
        queryFn: () => getProductBySlug(product.slug),
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  const hasCampaign = activeCampaign && activeCampaign.discountPercentage > 0;
  const qualifies = hasCampaign && (
    !activeCampaign.discountedProductIds ||
    activeCampaign.discountedProductIds.length === 0 ||
    activeCampaign.discountedProductIds.includes(product.id)
  );

  const finalPrice = qualifies ? Math.round(product.price * (1 - activeCampaign.discountPercentage / 100)) : product.price;
  const comparePrice = qualifies ? (product.compareAtPrice || product.price) : product.compareAtPrice;
  const off = discountPct(finalPrice, comparePrice);

  const wished = has(product.id);
  const hasSizes = product.variants.length > 1;
  const [pickSize, setPickSize] = useState(false);

  // For no-variant products, find the cart line by productId
  const cartLine = !hasSizes ? lines.find((l) => l.productId === product.id) : undefined;
  const cartQty = cartLine?.quantity ?? 0;

  function onAddDirect() {
    if (hasSizes) {
      setPickSize((v) => !v);
    } else {
      add(product);
    }
  }

  const cleanMaterial = (() => {
    if (!product.material || product.material.length > 25 || product.material.toLowerCase().includes(product.name.toLowerCase())) {
      if (product.name.toLowerCase().includes("triply")) return "Triply Steel";
      if (product.name.toLowerCase().includes("cast iron")) return "Cast Iron";
      if (product.name.toLowerCase().includes("honeycomb")) return "Honeycomb";
      return "Cookware";
    }
    return product.material;
  })();

  return (
    <div className="group card relative flex flex-col justify-between h-full overflow-hidden hover-lift cursor-fork w-full bg-white rounded-xl sm:rounded-2xl border border-ink/10 shadow-card hover:shadow-lift transition-all duration-300">
      
      {/* Product Image Section */}
      <Link to={`/product/${product.slug}`} onMouseEnter={handlePrefetch} className="block relative aspect-square overflow-hidden bg-sand/30 flex-shrink-0">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            product.images[1] ? "group-hover:opacity-0" : ""
          }`}
        />
        {product.images[1] && (
          <ProductImage
            src={product.images[1]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        )}

        {/* Floating Badges */}
        <div className="absolute left-1.5 top-1.5 sm:left-2.5 sm:top-2.5 flex flex-col gap-1 z-10">
          {off && (
            <span className="bg-gold/95 backdrop-blur-xs text-ink text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs">
              Save {off}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-copper text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs">
              New
            </span>
          )}
        </div>

        {/* Floating Favorite (Heart) Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id, product.name);
          }}
          className={`absolute right-1.5 top-1.5 sm:right-2.5 sm:top-2.5 z-10 grid h-6 w-6 sm:h-8 sm:w-8 place-items-center rounded-full transition-all duration-300 shadow-2xs border border-ink/[0.06] ${
            wished
              ? "bg-copper text-white hover:bg-copper-dark"
              : "bg-white/85 text-ink/50 hover:bg-white hover:text-copper hover:scale-105 backdrop-blur-xs"
          }`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={11} className={`sm:w-3.5 sm:h-3.5 ${wished ? "fill-current" : ""}`} />
        </button>
      </Link>

      {/* Details Container */}
      <div className="flex flex-1 flex-col justify-between p-2 sm:p-3.5">
        <div>
          {/* Material Tag */}
          <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-copper/85 leading-none truncate block">
            {cleanMaterial}
          </span>

          {/* Product Title (Consistent 2-line height so all cards align) */}
          <Link to={`/product/${product.slug}`} className="mt-0.5 sm:mt-1 block">
            <h3 className="line-clamp-2 text-[11px] sm:text-sm font-bold leading-snug sm:leading-tight text-ink group-hover:text-copper transition-colors h-[2.1rem] sm:h-[2.4rem] flex items-start">
              {product.name}
            </h3>
          </Link>

          {/* Rating and Size Count */}
          <div className="mt-1 sm:mt-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-ink/80">
              <Star size={9} className="fill-gold text-gold sm:w-2.5 sm:h-2.5" />
              <span>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
              {product.reviewCount !== undefined && (
                <span className="text-ink/40 font-normal text-[8px] sm:text-[10px]">({product.reviewCount})</span>
              )}
            </div>
            {hasSizes && (
              <span className="text-[8px] sm:text-[10px] font-semibold text-ink/45">
                {product.variants.length} sizes
              </span>
            )}
          </div>

          {/* Price and Offers */}
          <div className="mt-1.5 sm:mt-2 flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-black text-ink leading-none">
                {formatINR(finalPrice)}
              </span>
              {comparePrice && comparePrice > finalPrice && (
                <span className="text-[9px] sm:text-xs text-ink/35 line-through leading-none">
                  {formatINR(comparePrice)}
                </span>
              )}
            </div>
            {qualifies && (
              <div className="mt-0.5">
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded truncate max-w-full">
                  {activeCampaign.name} · {activeCampaign.discountPercentage}% OFF
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Footer — Pinned to bottom (mt-auto) */}
        <div className="relative mt-2 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-ink/5">
          {!hasSizes && cartQty > 0 ? (
            /* Item already in cart → inline qty stepper */
            <div className="flex items-center justify-between w-full h-7 sm:h-9 rounded-lg sm:rounded-xl border border-copper bg-copper/5 px-1">
              <button
                onClick={() => setQty(product.id, cartQty - 1)}
                className="grid h-5 w-5 sm:h-7 sm:w-7 place-items-center text-copper hover:bg-copper/10 rounded transition-colors active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus size={10} className="sm:w-3 sm:h-3" />
              </button>
              <span className="text-[10px] sm:text-xs font-bold text-copper">{cartQty} in cart</span>
              <button
                disabled={cartQty >= product.stock}
                onClick={() => setQty(product.id, cartQty + 1)}
                className="grid h-5 w-5 sm:h-7 sm:w-7 place-items-center text-copper hover:bg-copper/10 rounded transition-colors active:scale-95 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={10} className="sm:w-3 sm:h-3" />
              </button>
            </div>
          ) : (
            /* Not in cart → Add to Cart button */
            <button
              onClick={onAddDirect}
              className="w-full h-7 sm:h-9 bg-ink text-white hover:bg-copper hover:text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs cursor-fork active:scale-95"
              aria-label={hasSizes ? "Select Size" : "Add to Cart"}
            >
              <ShoppingBag size={11} className="sm:w-3 sm:h-3" />
              <span>{hasSizes ? "Select Size" : "Add to Cart"}</span>
            </button>
          )}

          {/* Size chooser popover */}
          {hasSizes && pickSize && (
            <>
              <button
                aria-label="Close size chooser"
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setPickSize(false)}
              />
              <div className="absolute bottom-9 sm:bottom-11 left-0 right-0 z-30 rounded-xl bg-white p-2 sm:p-3 shadow-lift border border-ink/10 animate-fade-up">
                <p className="px-0.5 pb-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      disabled={v.stock === 0}
                      onClick={() => {
                        add(product, v);
                        setPickSize(false);
                      }}
                      className="rounded-lg border border-ink/15 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold transition-all hover:border-copper hover:bg-copper hover:text-white disabled:opacity-40"
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
