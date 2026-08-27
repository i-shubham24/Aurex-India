import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getCategoryBySlug } from "@/api/categoryApi";
import { getProductsPaginated } from "@/api/productApi";
import ProductCard from "@/components/ProductCard";
import PriceFilter from "@/components/PriceFilter";
import Seo from "@/components/Seo";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { ProductQuery } from "@/services/types";

const SORTS: { value: NonNullable<ProductQuery["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
];

// Real AUREX "range" banners per category for the page heading.
const CAT_BANNER: Record<string, string> = {
  triply: "/brand/tri-ply-range.webp",
  "cast-iron": "/brand/cast-iron-range.webp",
  kadhai: "/brand/tri-ply-range.webp",
  honeycomb: "/brand/full-range.webp",
};

const PRICE_RANGES: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹200", max: 199 },
  { label: "₹200 – ₹500", min: 200, max: 500 },
  { label: "₹500 – ₹800", min: 500, max: 800 },
  { label: "₹800 – ₹1,200", min: 800, max: 1200 },
  { label: "Over ₹1,200", min: 1200 },
];

export default function ShopPage() {
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? undefined;
  const isNew = params.get("new") === "1";
  const sort = (params.get("sort") as ProductQuery["sort"]) ?? "newest";
  const priceMin = params.get("min") ? Number(params.get("min")) : undefined;
  const priceMax = params.get("max") ? Number(params.get("max")) : undefined;

  const page = params.get("page") ? Number(params.get("page")) : 1;
  const limit = 15;

  const query: ProductQuery = useMemo(
    () => ({ categorySlug: category, search, isNew: isNew || undefined, sort, priceMin, priceMax, page, limit }),
    [category, search, isNew, sort, priceMin, priceMax, page, limit]
  );

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const categories = categoriesResponse?.data?.categories || [];

  const { data: productsData, isLoading: loading } = useQuery({
    queryKey: ['products', query],
    queryFn: () => getProductsPaginated(query),
  });
  
  const products = productsData?.products;
  const pagination = productsData?.pagination;

  const { data: activeCatResponse } = useQuery({
    queryKey: ['category', category],
    queryFn: () => category ? getCategoryBySlug(category) : Promise.resolve(null),
    enabled: !!category,
  });
  const activeCat = activeCatResponse?.data?.category || null;

  const title = search
    ? `Results for “${search}”`
    : isNew
    ? "New Arrivals"
    : activeCat?.name ?? "Shop All";

  function setSort(value: string) {
    const next = new URLSearchParams(params);
    next.set("sort", value);
    setParams(next);
  }

  function setPrice(min?: number, max?: number) {
    const next = new URLSearchParams(params);
    if (min === undefined) next.delete("min");
    else next.set("min", String(min));
    if (max === undefined) next.delete("max");
    else next.set("max", String(max));
    next.set("page", "1"); // Reset to page 1 on filter
    setParams(next);
  }

  function setPage(newPage: number) {
    const next = new URLSearchParams(params);
    next.set("page", String(newPage));
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="container-x py-10">
      <Seo
        title={activeCat ? `${activeCat.name} — Shop` : "Shop All Cookware"}
        description={
          activeCat?.description ??
          "Shop premium triply stainless steel and cast iron cookware — kadais, tawas, fry pans, saucepans and sets. Free shipping across India."
        }
        noindex={Boolean(search)}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          ...(activeCat ? [{ name: activeCat.name, path: `/shop/${activeCat.slug}` }] : []),
        ])}
      />
      {/* Breadcrumb + heading */}
      <nav className="text-sm text-ink/50">
        <Link to="/" className="hover:text-copper">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-copper">Shop</Link>
        {activeCat && (
          <>
            <span className="mx-2">/</span>
            <span className="text-ink/70">{activeCat.name}</span>
          </>
        )}
      </nav>
      {(() => {
        const isShopAll = !category;
        const bannerImg = isShopAll ? "/brand/full-range.webp" : (category && CAT_BANNER[category] ? CAT_BANNER[category] : "/brand/full-range.webp");
        const bannerTitle = isShopAll ? "Shop All" : (activeCat?.name || title);
        const bannerDesc = isShopAll 
          ? "Explore our entire premium collection of triply stainless steel and cast iron cookware." 
          : (activeCat?.description || "");

        return (
          <div className="relative mt-3 overflow-hidden rounded-xl2">
            <img
              src={bannerImg}
              alt={`${bannerTitle} range`}
              className="h-44 w-full object-cover sm:h-60"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/80 via-ink/25 to-transparent p-6 sm:p-8">
              <h1 className="text-3xl font-semibold text-cream sm:text-4xl">{bannerTitle}</h1>
              {bannerDesc && (
                <p className="mt-1 max-w-lg text-sm text-cream/85">{bannerDesc}</p>
              )}
            </div>
          </div>
        );
      })()}

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Sidebar filters */}
        <aside className="hidden lg:block">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Categories
          </h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                to="/shop"
                className={`block rounded-lg px-3 py-2 hover:bg-ink/[0.04] ${
                  !category ? "bg-ink/[0.05] font-semibold text-copper" : "text-ink/75"
                }`}
              >
                All products
              </Link>
            </li>
            {(categories ?? []).map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop/${c.slug}`}
                  className={`block rounded-lg px-3 py-2 hover:bg-ink/[0.04] ${
                    category === c.slug ? "bg-ink/[0.05] font-semibold text-copper" : "text-ink/75"
                  }`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <PriceFilter
              ranges={PRICE_RANGES}
              priceMin={priceMin}
              priceMax={priceMax}
              onApply={setPrice}
            />
          </div>
        </aside>

        {/* Grid — min-w-0 lets this grid column shrink instead of overflowing */}
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-sm text-ink/55">
              {pagination ? `${pagination.total} product${pagination.total === 1 ? "" : "s"}` : " "}
            </p>
            <label className="flex min-w-0 items-center gap-2 text-sm">
              <span className="flex-shrink-0 text-ink/55">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="min-w-0 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm focus:border-copper focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Mobile category chips */}
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <Link
              to="/shop"
              className={`chip whitespace-nowrap ${!category ? "bg-copper text-white" : "bg-white ring-1 ring-ink/10 text-ink/70"}`}
            >
              All
            </Link>
            {(categories ?? []).map((c) => (
              <Link
                key={c.id}
                to={`/shop/${c.slug}`}
                className={`chip whitespace-nowrap ${category === c.slug ? "bg-copper text-white" : "bg-white ring-1 ring-ink/10 text-ink/70"}`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Mobile price filter */}
          <details className="mb-5 card p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-ink/70">
              Filter by price
              {(priceMin !== undefined || priceMax !== undefined) && (
                <span className="ml-2 chip bg-copper/15 text-copper">active</span>
              )}
            </summary>
            <div className="mt-4">
              <PriceFilter
                ranges={PRICE_RANGES}
                priceMin={priceMin}
                priceMax={priceMax}
                onApply={setPrice}
              />
            </div>
          </details>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2.5 p-3 sm:p-4 border border-ink/[0.04] rounded-xl sm:rounded-xl2 bg-white shadow-sm">
                  <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg" />
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mt-2" />
                  <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                  <div className="h-8 w-full bg-gray-200 animate-pulse rounded mt-4" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(pagination.page - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink/15 text-ink hover:border-copper hover:text-copper disabled:opacity-30 disabled:hover:border-ink/15 disabled:hover:text-ink transition-colors"
                  >
                    &lt;
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    // Simple logic to show fewer pages on mobile if many pages exist (omitted for brevity, just showing all)
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                          pagination.page === pageNum
                            ? "border-copper bg-copper text-white"
                            : "border-ink/15 text-ink hover:border-copper hover:text-copper"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage(pagination.page + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink/15 text-ink hover:border-copper hover:text-copper disabled:opacity-30 disabled:hover:border-ink/15 disabled:hover:text-ink transition-colors"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-ink/60">No products found.</p>
              <Link to="/shop" className="btn-copper mt-4">Browse all cookware</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
