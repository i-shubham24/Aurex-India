import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Star, Eye } from "lucide-react";
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
            <span className="bg-gold text-ink text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Save {off}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-copper text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              New
            </span>
          )}
        </div>
      </Link>

      {/* Floating Favorite (Heart) Button */}
      <button
        onClick={() => toggle(product.id)}
        className={`absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full transition-all duration-300 shadow-sm ${
          wished ? "bg-copper text-white" : "bg-white/90 text-ink/50 hover:text-copper hover:scale-105"
        }`}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={15} className={wished ? "fill-current" : ""} />
      </button>

      {/* Details Container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Material Tag */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-copper leading-none">
          {product.material ?? "Cookware"}
        </span>

        {/* Product Title */}
        <Link to={`/product/${product.slug}`} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-[2.4rem] text-sm font-bold leading-tight text-ink group-hover:text-copper transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating and Size Count */}
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-forest/10 px-2 py-0.5 rounded-full text-forest text-[10px] font-bold">
            <Star size={10} className="fill-current" />
            <span>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
            {product.reviewCount !== undefined && (
              <span className="text-forest/60 font-normal">({product.reviewCount})</span>
            )}
          </div>
          {hasSizes && (
            <span className="text-[10px] font-bold text-ink/40">
              {product.variants.length} sizes available
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3.5 flex items-baseline gap-1.5">
          <span className="text-lg font-black text-ink">
            {formatINR(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-ink/35 line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Dual Actions Footer Buttons */}
        <div className="relative mt-4 flex items-center gap-2 pt-1 border-t border-ink/5">
          {/* Secondary Action */}
          {hasSizes ? (
            <button
              onClick={() => setPickSize((v) => !v)}
              className="w-1/2 py-2 bg-sand/60 text-ink/70 hover:bg-sand hover:text-copper text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1 border border-transparent hover:border-copper/10"
              aria-label="View sizes"
            >
              Sizes ({product.variants.length})
            </button>
          ) : (
            <Link
              to={`/product/${product.slug}`}
              className="w-1/2 py-2 bg-sand/60 text-ink/70 hover:bg-sand hover:text-copper text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1 border border-transparent hover:border-copper/10"
            >
              <Eye size={12} />
              Details
            </Link>
          )}

          {/* Primary Action */}
          <button
            onClick={onAddDirect}
            className="w-1/2 py-2 bg-copper text-white hover:bg-gold hover:text-ink text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-fork"
            aria-label={hasSizes ? "Add variant to cart" : "Add to cart"}
          >
            <ShoppingBag size={12} />
            Add to Cart
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
