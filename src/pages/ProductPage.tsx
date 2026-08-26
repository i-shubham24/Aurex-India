import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShieldCheck, Truck, Recycle, Check, Minus, Plus } from "lucide-react";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import { formatINR, discountPct } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import Rating from "@/components/Rating";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import type { ProductVariant } from "@/services/types";

export default function ProductPage() {
  const { slug } = useParams();
  const { add } = useCart();
  const { data: product, loading } = useAsync(() => data.getProduct(slug!), [slug]);
  const { data: reviews } = useAsync(
    () => (product ? data.getReviews(product.id) : Promise.resolve([])),
    [product?.id]
  );
  const { data: related } = useAsync(
    () =>
      product
        ? data.getProducts({ categorySlug: product.categorySlug })
        : Promise.resolve([]),
    [product?.categorySlug]
  );

  const [activeImg, setActiveImg] = useState(0);
  const [variant, setVariant] = useState<ProductVariant | undefined>(undefined);
  const [qty, setQty] = useState(1);

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

  // Default to the base variant (priceDelta 0/undefined) so the detail page
  // opens at the same price the product card shows — not whichever variant
  // happens to be first in the array.
  const chosen = variant ?? product.variants.find((v) => !v.priceDelta) ?? product.variants[0];
  const unitPrice = product.price + (chosen?.priceDelta ?? 0);
  const off = discountPct(product.price, product.compareAtPrice);
  const inStock = (chosen?.stock ?? product.stock) > 0;

  return (
    <div className="container-x py-10">
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
      <nav className="mb-6 text-sm text-ink/50">
        <Link to="/" className="hover:text-copper">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/shop/${product.categorySlug}`} className="hover:text-copper capitalize">
          {product.categorySlug.replace(/-/g, " ")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-xl2 bg-sand">
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg ring-2 ${
                    activeImg === i ? "ring-copper" : "ring-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-copper">
            {product.material}
          </p>
          <h1 className="mt-1 text-3xl font-semibold leading-tight">{product.name}</h1>
          <div className="mt-3">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-semibold">{formatINR(unitPrice)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-ink/40 line-through">
                  {formatINR(product.compareAtPrice + (chosen?.priceDelta ?? 0))}
                </span>
                {off && <span className="chip bg-copper text-white">{off}% off</span>}
              </>
            )}
          </div>

          <p className="mt-4 text-ink/70">{product.shortDescription}</p>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mt-6">
              <p className="label">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariant(v)}
                    disabled={v.stock === 0}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                      chosen?.id === v.id
                        ? "border-copper bg-copper text-white"
                        : "border-ink/15 hover:border-ink/40"
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
            <div className="flex items-center rounded-full border border-ink/15">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-ink/70 hover:text-copper"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-11 w-11 place-items-center text-ink/70 hover:text-copper"
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <button
              disabled={!inStock}
              onClick={() => add(product, chosen, qty)}
              className="btn-primary flex-1 py-3"
            >
              {inStock ? `Add to cart · ${formatINR(unitPrice * qty)}` : "Out of stock"}
            </button>
          </div>

          {/* Assurances */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-ink/10 pt-6 text-center text-xs text-ink/60">
            <div className="flex flex-col items-center gap-1"><Truck size={18} className="text-copper" /> Free shipping</div>
            <div className="flex flex-col items-center gap-1"><ShieldCheck size={18} className="text-copper" /> Warranty</div>
            <div className="flex flex-col items-center gap-1"><Recycle size={18} className="text-copper" /> Toxin-free</div>
          </div>
        </div>
      </div>

      {/* Description + features */}
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="mt-3 leading-relaxed text-ink/75">{product.description}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="mt-3 space-y-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-ink/75">
                <Check size={18} className="mt-0.5 flex-shrink-0 text-copper" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold">Customer reviews</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <Rating value={r.rating} />
                  {r.verified && (
                    <span className="chip bg-forest/10 text-forest">Verified</span>
                  )}
                </div>
                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                <p className="mt-1 text-sm text-ink/70">{r.body}</p>
                <p className="mt-3 text-xs text-ink/45">— {r.author}, {r.createdAt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related && related.filter((p) => p.id !== product.id).length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
