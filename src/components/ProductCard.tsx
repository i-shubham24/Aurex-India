import { Link } from "react-router-dom";
import { ShoppingBag, Heart } from "lucide-react";
import type { Product } from "@/services/types";
import { formatINR, discountPct } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductImage from "./ProductImage";
import Rating from "./Rating";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const off = discountPct(product.price, product.compareAtPrice);
  const wished = has(product.id);

  return (
    <div className="group card relative flex flex-col overflow-hidden hover-lift cursor-fork">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-sand">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {product.isNew && <span className="chip bg-forest text-white">New</span>}
            {off && <span className="chip bg-copper text-white">{off}% off</span>}
            {product.badges?.map((b) => (
              <span key={b} className="chip bg-ink/90 text-cream">{b}</span>
            ))}
          </div>
        </div>
      </Link>

      <button
        onClick={() => toggle(product.id)}
        className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full backdrop-blur transition-colors sm:h-9 sm:w-9 ${
          wished ? "bg-copper text-white" : "bg-white/85 text-ink/60 hover:text-copper"
        }`}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
      >
        <Heart size={15} className={wished ? "fill-current" : ""} />
      </button>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="truncate text-[0.62rem] font-semibold uppercase tracking-wider text-copper sm:text-[0.7rem]">
          {product.material ?? "Cookware"}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[2.4rem] text-[0.82rem] font-medium leading-snug text-ink transition-colors group-hover:text-copper sm:min-h-[2.75rem] sm:text-[0.95rem]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>

        {/* Price + add — resilient on narrow cards */}
        <div className="mt-3 flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-base font-semibold text-ink sm:text-lg">
              {formatINR(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-ink/40 line-through sm:text-sm">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>
          <button
            onClick={() => add(product)}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-ink text-cream transition-all hover:bg-gold hover:text-ink active:scale-90 cursor-fork"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
