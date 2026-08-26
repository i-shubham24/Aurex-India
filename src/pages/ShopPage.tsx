import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import ProductCard from "@/components/ProductCard";
import PriceFilter from "@/components/PriceFilter";
import Seo from "@/components/Seo";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { ProductQuery } from "@/services/types";

const SORTS: { value: NonNullable<ProductQuery["sort"]>; label: string }[] = [
  { value: "relevant", label: "Relevance" },
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
];

const PRICE_RANGES: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹1,500", max: 1499 },
  { label: "₹1,500 – ₹2,500", min: 1500, max: 2500 },
  { label: "₹2,500 – ₹4,000", min: 2500, max: 4000 },
  { label: "Over ₹4,000", min: 4000 },
];

export default function ShopPage() {
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? undefined;
  const isNew = params.get("new") === "1";
  const sort = (params.get("sort") as ProductQuery["sort"]) ?? "relevant";
  const priceMin = params.get("min") ? Number(params.get("min")) : undefined;
  const priceMax = params.get("max") ? Number(params.get("max")) : undefined;

  const query: ProductQuery = useMemo(
    () => ({ categorySlug: category, search, isNew: isNew || undefined, sort, priceMin, priceMax }),
    [category, search, isNew, sort, priceMin, priceMax]
  );

  const { data: categories } = useAsync(() => data.getCategories(), []);
  const { data: products, loading } = useAsync(
    () => data.getProducts(query),
    [category, search, isNew, sort, priceMin, priceMax]
  );
  const { data: activeCat } = useAsync(
    () => (category ? data.getCategory(category) : Promise.resolve(null)),
    [category]
  );

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
    setParams(next);
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
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      {activeCat?.description && (
        <p className="mt-2 max-w-2xl text-ink/60">{activeCat.description}</p>
      )}

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

        {/* Grid */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-ink/55">
              {products ? `${products.length} product${products.length === 1 ? "" : "s"}` : " "}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink/55">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm focus:border-copper focus:outline-none"
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card aspect-[3/4] animate-pulse bg-sand/60" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
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
