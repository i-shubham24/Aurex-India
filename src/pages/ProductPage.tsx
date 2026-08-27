import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Flame, ShieldCheck, Recycle, Check, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProductBySlug, getProducts } from "@/api/productApi";
import { formatINR, discountPct } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import Rating from "@/components/Rating";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import type { Product, ProductVariant } from "@/services/types";

/** Pull a few reliable spec rows out of the (messy) source description. */
function parseSpecs(product: Product): [string, string][] {
  const d = product.description ?? "";
  const rows: [string, string][] = [["Material", product.material ?? "—"]];
  if (product.variants.length) rows.push(["Sizes", product.variants.map((v) => v.name).join(", ")]);
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
  const { add } = useCart();
  const { data: product, isLoading: loading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });
  
  // Reviews aren't fully integrated in the backend yet, defaulting to empty
  const reviews: any[] = [];
  
  const { data: relatedResponse } = useQuery({
    queryKey: ['products', 'related', product?.categorySlug],
    queryFn: () => getProducts({ categorySlug: product?.categorySlug }),
    enabled: !!product?.categorySlug,
  });
  const related = relatedResponse || [];

  const [activeImg, setActiveImg] = useState(0);
  const [variant, setVariant] = useState<ProductVariant | undefined>(undefined);
  const [qty, setQty] = useState(1);
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
  const off = discountPct(product.price, product.compareAtPrice);
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
            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
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

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold">{formatINR(unitPrice)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-ink/40 line-through">
                  {formatINR(product.compareAtPrice + (chosen?.priceDelta ?? 0))}
                </span>
                {off && <span className="chip bg-copper text-white">{off}% off</span>}
              </>
            )}
            <span className="text-xs text-ink/50">(incl. of all taxes)</span>
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
            <div className="flex items-center rounded-full border border-ink/15">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-ink/70 hover:text-copper" aria-label="Decrease quantity"><Minus size={15} /></button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center text-ink/70 hover:text-copper" aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
            <button disabled={!inStock} onClick={() => add(product, chosen, qty)} className="btn-primary flex-1 py-3">
              {inStock ? `Add to cart · ${formatINR(unitPrice * qty)}` : "Out of stock"}
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
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-3 text-sm odd:bg-sand/40">
                    <dt className="font-medium text-ink/60">{k}</dt>
                    <dd className="min-w-0 break-words text-ink/80">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Description + features */}
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="mt-3 break-words leading-relaxed text-ink/75">{product.description}</p>
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
                  {r.verified && <span className="chip bg-forest/10 text-forest">Verified</span>}
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
            {related.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-cream/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-container items-center gap-3 pr-[4.5rem]">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink/60">{product.name}</p>
            <p className="text-base font-semibold">{formatINR(unitPrice)}</p>
          </div>
          <button
            disabled={!inStock}
            onClick={() => add(product, chosen, qty)}
            className="btn-copper flex-shrink-0 gap-1.5"
          >
            <ShoppingBag size={16} /> {inStock ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  );
}
