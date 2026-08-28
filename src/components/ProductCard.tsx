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
    <div className="group card relative flex flex-col overflow-hidden hover-lift cursor-fork w-full bg-white rounded-xl sm:rounded-xl2 border border-ink/[0.04] shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Product Image Section */}
      <Link to={`/product/${product.slug}`} onMouseEnter={handlePrefetch} className="block relative aspect-square overflow-hidden bg-sand/30">
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
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col gap-1 z-10">
          {off && (
            <span className="bg-gold text-ink text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Save {off}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-copper text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              New
            </span>
          )}
        </div>
      </Link>

      {/* Floating Favorite (Heart) Button */}
      <button
        onClick={() => toggle(product.id, product.name)}
        className={`absolute right-2 top-2 sm:right-3 sm:top-3 z-10 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full transition-all duration-300 shadow-sm border border-ink/[0.04] ${
          wished
            ? "bg-copper text-white hover:bg-copper-dark"
            : "bg-white/80 text-ink/50 hover:bg-white hover:text-copper hover:scale-105 backdrop-blur-[2px]"
        }`}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={13} className={wished ? "fill-current" : ""} />
      </button>

      {/* Details Container */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        {/* Material Tag */}
        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-copper/85 leading-none truncate">
          {cleanMaterial}
        </span>

        {/* Product Title */}
        <Link to={`/product/${product.slug}`} className="mt-1 block">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-bold leading-snug sm:leading-tight text-ink group-hover:text-copper transition-colors min-h-[2rem] sm:min-h-[2.4rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating and Size Count */}
        <div className="mt-1.5 sm:mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-ink/80">
            <Star size={10} className="fill-gold text-gold sm:w-[11px] sm:h-[11px]" />
            <span>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
            {product.reviewCount !== undefined && (
              <span className="text-ink/40 font-normal text-[9px] sm:text-[10px]">({product.reviewCount})</span>
            )}
          </div>
          {hasSizes && (
            <span className="text-[9px] sm:text-[10px] font-medium text-ink/50">
              {product.variants.length} sizes
            </span>
          )}
        </div>

        <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm sm:text-base lg:text-lg font-black text-ink">
            {formatINR(finalPrice)}
          </span>
          {comparePrice && comparePrice > finalPrice && (
            <span className="text-[10px] sm:text-xs text-ink/35 line-through">
              {formatINR(comparePrice)}
            </span>
          )}
          {qualifies && (
            <span className="bg-forest/10 text-forest text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
              {activeCampaign.name} - {activeCampaign.discountPercentage}%
            </span>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="relative mt-2.5 sm:mt-3 pt-2 sm:pt-3 border-t border-ink/5">
          {!hasSizes && cartQty > 0 ? (
            /* Item already in cart → show inline qty stepper */
            <div className="flex items-center justify-between w-full rounded-lg sm:rounded-xl border border-copper bg-copper/5 px-1 py-0.5">
              <button
                onClick={() => setQty(product.id, cartQty - 1)}
                className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center text-copper hover:bg-copper/10 rounded transition-colors active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-bold text-copper">{cartQty} in cart</span>
              <button
                disabled={cartQty >= product.stock}
                onClick={() => setQty(product.id, cartQty + 1)}
                className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center text-copper hover:bg-copper/10 rounded transition-colors active:scale-95 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            /* Not in cart → normal Add to Cart button */
            <button
              onClick={onAddDirect}
              className="w-full py-1.5 sm:py-2.5 bg-ink text-white hover:bg-copper hover:text-white text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm cursor-fork active:scale-95"
              aria-label={hasSizes ? "Select Size" : "Add to Cart"}
            >
              <ShoppingBag size={12} />
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
              <div className="absolute bottom-10 sm:bottom-12 left-0 right-0 z-30 rounded-xl bg-white p-2.5 sm:p-3 shadow-lift border border-ink/10 animate-fade-up">
                <p className="px-0.5 pb-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-ink/40">
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
                      className="rounded-lg border border-ink/15 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-bold transition-all hover:border-copper hover:bg-copper hover:text-white disabled:opacity-40"
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
