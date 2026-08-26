import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Star } from "lucide-react";
import type { Product } from "@/services/types";
import { formatINR, discountPct } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const off = discountPct(product.price, product.compareAtPrice);
  const wished = has(product.id);
  const hasSizes = product.variants.length > 1;
  const [pickSize, setPickSize] = useState(false);

  function onAddDirect() {
    if (hasSizes) {
      setPickSize((v) => !v);
    } else {
      add(product);
    }
  }

  return (
    <div className="group card relative flex flex-col overflow-hidden hover-lift cursor-fork w-full bg-white rounded-xl2 border border-ink/[0.04] shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Product Image Section */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-sand/30">
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
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {off && (
            <span className="bg-gold text-ink text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
              Save {off}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-copper text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
              New
            </span>
          )}
        </div>
      </Link>

      {/* Floating Favorite (Heart) Button */}
      <button
        onClick={() => toggle(product.id, product.name)}
        className={`absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full transition-all duration-300 shadow-sm border border-ink/[0.04] ${
          wished
            ? "bg-copper text-white hover:bg-copper-dark"
            : "bg-white/80 text-ink/50 hover:bg-white hover:text-copper hover:scale-105 backdrop-blur-[2px]"
        }`}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={14} className={wished ? "fill-current" : ""} />
      </button>

      {/* Details Container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Material Tag */}
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-copper/85 leading-none">
          {product.material ?? "Cookware"}
        </span>

        {/* Product Title */}
        <Link to={`/product/${product.slug}`} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-[2.4rem] text-sm font-bold leading-tight text-ink group-hover:text-copper transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating and Size Count */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-bold text-ink/80">
            <Star size={11} className="fill-gold text-gold" />
            <span>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
            {product.reviewCount !== undefined && (
              <span className="text-ink/40 font-normal">({product.reviewCount})</span>
            )}
          </div>
          {hasSizes && (
            <span className="text-[10px] font-medium text-ink/50">
              {product.variants.length} sizes
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-black text-ink">
            {formatINR(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-ink/35 line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="relative mt-4 pt-3 border-t border-ink/5">
          <button
            onClick={onAddDirect}
            className="w-full py-2.5 bg-ink text-white hover:bg-copper hover:text-white text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-fork active:scale-95"
            aria-label={hasSizes ? "Select Size" : "Add to Cart"}
          >
            <ShoppingBag size={13} />
            <span>{hasSizes ? "Select Size" : "Add to Cart"}</span>
          </button>

          {/* Size chooser popover */}
          {hasSizes && pickSize && (
            <>
              <button
                aria-label="Close size chooser"
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setPickSize(false)}
              />
              <div className="absolute bottom-12 left-0 right-0 z-30 rounded-xl bg-white p-3 shadow-lift border border-ink/10 animate-fade-up">
                <p className="px-0.5 pb-2 text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      disabled={v.stock === 0}
                      onClick={() => {
                        add(product, v);
                        setPickSize(false);
                      }}
                      className="rounded-lg border border-ink/15 px-2.5 py-1 text-xs font-bold transition-all hover:border-copper hover:bg-copper hover:text-white disabled:opacity-40"
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
