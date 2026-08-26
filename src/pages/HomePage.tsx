import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Flame, Recycle, Check, X, Tag } from "lucide-react";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import { discountPct } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import Rating from "@/components/Rating";
import Reveal from "@/components/Reveal";
import Typewriter from "@/components/Typewriter";
import Carousel from "@/components/Carousel";
import Seo from "@/components/Seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const HERO_SLIDES = [
  {
    chip: "5 decades of craftsmanship",
    lead: "Cookware built to",
    typewriter: ["last a lifetime", "cook evenly", "be passed down"],
    subtitle:
      "Premium triply stainless steel and toxin-free cast iron, engineered for even heat and everyday Indian cooking.",
    cta: "Shop all cookware",
    to: "/shop",
    image: "/brand/full-range.webp",
    alt: "The full Aurex cookware range",
  },
  {
    chip: "Triply Collection",
    lead: "Triply steel,",
    accent: "engineered to last",
    subtitle:
      "Three bonded layers — food-grade steel and an aluminium core — for fast, even, induction-ready heat.",
    cta: "Shop Triply",
    to: "/shop/triply",
    image: "/brand/tri-ply-range.webp",
    alt: "Aurex triply stainless steel range",
  },
  {
    chip: "Cast Iron",
    lead: "Cast iron,",
    accent: "reimagined",
    subtitle:
      "Pre-seasoned, naturally non-stick and toxin-free — built to be passed down for generations.",
    cta: "Shop Cast Iron",
    to: "/shop/cast-iron",
    image: "/brand/cast-iron-range.webp",
    alt: "Aurex cast iron range",
  },
];

const testimonials = [
  { name: "Priya Nair", place: "Kochi", rating: 5, text: "The triply kadai heats so evenly — no more burnt centres. Feels like a lifetime purchase." },
  { name: "Arjun Mehta", place: "Pune", rating: 5, text: "Switched our whole kitchen to Aurex cast iron. Dosas have never been crispier." },
  { name: "Sneha Reddy", place: "Hyderabad", rating: 4, text: "Premium build, fast delivery, and it looks gorgeous on the stove. Highly recommend." },
  { name: "Rahul Sharma", place: "Delhi", rating: 5, text: "The frypan is properly heavy and balanced. Sears vegetables beautifully with barely any oil." },
  { name: "Lakshmi Iyer", place: "Chennai", rating: 5, text: "My cast iron dosa tawa seasoned up perfectly. Restaurant-style crisp dosas at home now." },
  { name: "Neha Gupta", place: "Jaipur", rating: 4, text: "Bought the 4-piece triply set. Induction works flawlessly and clean-up is a breeze." },
];

const COMPARISON = [
  { feature: "100% toxin-free (no coatings)", aurex: true, ordinary: false },
  { feature: "Triply / cast-iron construction", aurex: true, ordinary: false },
  { feature: "Even heat, no hotspots", aurex: true, ordinary: false },
  { feature: "Induction + gas compatible", aurex: true, ordinary: true },
  { feature: "Built to last for years", aurex: true, ordinary: false },
  { feature: "Uses less oil — healthier cooking", aurex: true, ordinary: false },
];

const RECIPES = [
  { title: "Crispy Masala Dosa", tag: "Recipe", image: "/brand/recipe-dosa.webp" },
  { title: "Grilled Paneer Tikka", tag: "Recipe", image: "/brand/recipe-paneer.webp" },
  { title: "Soft, fluffy Rava Appe", tag: "Recipe", image: "/brand/recipe-appe.webp" },
];

// Collapse size-siblings ("Kadhai – 24 cm" / "– 26 cm") to one card so the
// home showcases stay varied instead of repeating the same product.
function distinctProducts<T extends { name: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const p of list) {
    const base = p.name
      .replace(/\s*[–-]\s*\d+(\.\d+)?\s*(cm|mm|ltr|l|pc|piece)s?\b.*$/i, "")
      .replace(/\b\d+(\.\d+)?\s*(cm|mm|ltr|l)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (seen.has(base)) continue;
    seen.add(base);
    out.push(p);
  }
  return out;
}

const faqs = [
  {
    q: "Is Aurex cookware induction compatible?",
    a: "Yes — all triply cookware and most cast iron pieces work on both induction and gas.",
  },
  {
    q: "What are Aurex products made of?",
    a: "Triply cookware bonds food-grade 304 and 430 stainless steel around an aluminium core; cast iron is pre-seasoned and 100% toxin-free — no chemical coatings anywhere.",
  },
  {
    q: "How do I care for cast iron?",
    a: "Rinse with warm water, dry on low heat, and rub a thin layer of oil before storing. It gets more non-stick with use.",
  },
  {
    q: "Do you ship across India?",
    a: "We offer free shipping across India, usually delivered within 3–7 business days.",
  },
];

export default function HomePage() {
  const { data: categories } = useAsync(() => data.getCategories(), []);
  const { data: newArrivals } = useAsync(() => data.getProducts({ isNew: true }), []);
  const { data: featured } = useAsync(() => data.getProducts({ isFeatured: true }), []);
  const { data: bestsellers } = useAsync(() => data.getProducts({ sort: "rating" }), []);
  const { data: allProducts } = useAsync(() => data.getProducts(), []);

  const deals = useMemo(() => {
    if (!allProducts) return [];
    return distinctProducts(
      [...allProducts]
        .filter((p) => p.compareAtPrice)
        .sort((a, b) => (discountPct(b.price, b.compareAtPrice) ?? 0) - (discountPct(a.price, a.compareAtPrice) ?? 0))
    ).slice(0, 6);
  }, [allProducts]);

  // Shop-by-category tiles: the 4 real material categories + product-type
  // collections (search-backed) so the grid stays full and browsable.
  const tiles = useMemo(() => {
    const cats = (categories ?? []).map((c) => ({ key: c.id, name: c.name, to: `/shop/${c.slug}`, image: c.image }));
    const used = new Set(cats.map((c) => c.image));
    // Prefer a matching product whose photo isn't already shown by a category tile.
    const img = (kw: string) => {
      const re = new RegExp(kw, "i");
      const fresh = allProducts?.find((p) => re.test(p.name) && p.images?.[0] && !used.has(p.images[0]));
      const any = allProducts?.find((p) => re.test(p.name));
      const src = (fresh ?? any)?.images?.[0] ?? "";
      if (src) used.add(src);
      return src;
    };
    const collections = [
      { key: "col-set", name: "Cookware Sets", to: "/shop?q=set", image: img("set") },
      { key: "col-tawa", name: "Tawas", to: "/shop?q=tawa", image: img("tawa") },
    ].filter((c) => c.image);
    return [...cats, ...collections].slice(0, 6);
  }, [categories, allProducts]);

  return (
    <div>
      <Seo
        title="Aurex India — Premium Triply & Cast Iron Cookware"
        description="Premium triply stainless steel and toxin-free cast iron cookware, built to last a lifetime. Free shipping across India, lifetime warranty on cast iron."
        canonicalPath="/"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />
      {/* Hero — manual carousel of the real AUREX collections */}
      <section className="relative overflow-hidden pt-6">
        <div className="orb -left-24 -top-16 h-72 w-72 bg-copper/15" />
        <div className="orb right-[-6rem] top-40 h-80 w-80 bg-gold/15" />
        <div className="orb bottom-[-4rem] left-1/3 h-64 w-64 bg-sky/10" />
        <div className="container-x overflow-hidden">
        <Carousel slideClassName="basis-full" gapClassName="gap-4" autoPlayMs={6500} showDots leftArrow={false} ariaLabel="Featured collections">
          {HERO_SLIDES.map((s, i) => (
            <div
              key={i}
              className="grid items-center gap-8 overflow-hidden rounded-xl2 bg-gradient-to-br from-sand via-cream to-white p-6 sm:p-10 lg:grid-cols-2 lg:gap-6 lg:p-14"
            >
              <div className="min-w-0">
                <span className="chip bg-copper/15 text-copper">{s.chip}</span>
                <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
                  <span className="block">{s.lead}</span>
                  {s.typewriter ? (
                    <span className="block min-h-[1.15em]">
                      <Typewriter className="text-copper" words={s.typewriter} />
                    </span>
                  ) : (
                    <span className="text-copper">{s.accent}</span>
                  )}
                </h1>
                <p className="mt-4 max-w-md text-base text-ink/70 sm:text-lg">{s.subtitle}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to={s.to} className="btn-copper">
                    {s.cta} <ArrowRight size={16} />
                  </Link>
                  <Link to="/shop" className="btn-outline cursor-fork">Shop all</Link>
                </div>
              </div>
              <div className="min-w-0">
                <img
                  src={s.image}
                  alt={s.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="aspect-[4/3] w-full rounded-xl2 object-cover shadow-lift"
                />
              </div>
            </div>
          ))}
        </Carousel>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-ink/[0.06] bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { Icon: Flame, t: "Even heat", s: "Aluminium-core triply base" },
            { Icon: ShieldCheck, t: "Induction-ready", s: "Gas & induction compatible" },
            { Icon: Recycle, t: "Toxin-free", s: "No harmful coatings" },
            { Icon: Truck, t: "Free shipping", s: "Across India" },
          ].map(({ Icon, t, s }) => (
            <div key={t} className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-copper/10 text-copper">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-xs text-ink/55">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Shop by category</h2>
            <p className="mt-1 text-ink/60">Find the right piece for every dish.</p>
          </div>
          <Link to="/shop" className="btn-ghost hidden sm:inline-flex">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {tiles.map((t, i) => (
            <Reveal key={t.key} delay={i * 60}>
              <Link
                to={t.to}
                className="group card block overflow-hidden text-center hover-lift cursor-fork"
              >
                <div className="aspect-square overflow-hidden bg-sand">
                  <img
                    src={t.image}
                    alt={t.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="px-2 py-3 text-sm font-medium transition-colors group-hover:text-copper">{t.name}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bestsellers rail */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Bestsellers</h2>
            <p className="mt-1 text-ink/60">Most-loved by Aurex home cooks.</p>
          </div>
          <Link to="/shop?sort=rating" className="btn-ghost hidden sm:inline-flex">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <Carousel slideClassName="basis-[78%] sm:basis-1/3 lg:basis-1/4" gapClassName="gap-4" ariaLabel="Bestsellers">
          {distinctProducts(bestsellers ?? []).slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Carousel>
      </section>

      {/* Best deals */}
      <section className="border-y border-ink/[0.06] bg-gradient-to-r from-copper/[0.06] via-white to-gold/[0.1]">
        <div className="container-x py-14">
          <div className="mb-6 max-w-xl">
            <span className="chip bg-gold/25 text-ink"><Tag size={13} className="mr-1" /> Best deals</span>
            <h2 className="mt-3 text-3xl font-semibold">Save more this week</h2>
            <p className="mt-1 text-ink/65">
              Use code <b className="text-copper">WELCOME15</b> for an extra 15% off your first order.
            </p>
          </div>
          <Carousel slideClassName="basis-[78%] sm:basis-1/3 lg:basis-1/4" gapClassName="gap-4" ariaLabel="Best deals">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Carousel>
        </div>
      </section>

      {/* Featured collections — graphical banners */}
      <section className="container-x">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Triply Collection",
              sub: "Three bonded layers for fast, even, professional heat.",
              to: "/shop/triply",
              cta: "Shop Triply",
              image: "/brand/tri-ply-range.webp",
              tint: "from-ink/95 via-ink/60",
            },
            {
              title: "Cast Iron, Reimagined",
              sub: "Pre-seasoned, naturally non-stick and toxin-free.",
              to: "/shop/cast-iron",
              cta: "Shop Cast Iron",
              image: "/brand/cast-iron-range.webp",
              tint: "from-forest/95 via-forest/55",
            },
          ].map((b) => (
            <Reveal key={b.title}>
              <Link
                to={b.to}
                className="group relative isolate flex min-h-[280px] items-end overflow-hidden rounded-xl2 hover-lift sm:min-h-[340px]"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  loading="lazy"
                  className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 -z-10 bg-gradient-to-t ${b.tint} to-transparent`} />
                <div className="p-8 text-cream">
                  <h3 className="text-2xl font-semibold sm:text-3xl">{b.title}</h3>
                  <p className="mt-2 max-w-xs text-cream/85">{b.sub}</p>
                  <span className="btn-copper mt-5 inline-flex">
                    {b.cta} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Triply construction — the material/layers story */}
      <Reveal>
        <section className="border-y border-ink/[0.06] bg-gradient-to-b from-white to-sand/40">
          <div className="container-x py-16 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="chip bg-copper/15 text-copper">The Aurex Difference</span>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Engineered in three layers</h2>
              <p className="mt-3 text-ink/65">
                Food-grade 304 steel on the inside, a heat-spreading aluminium core, and
                induction-ready 430 steel outside — no coatings, no hotspots, built to last.
              </p>
            </div>

            <img
              src="/brand/construction.webp"
              alt="Aurex triply construction — 304 stainless steel inner layer, aluminium core for even heat, and induction-ready 430 stainless steel outer layer"
              loading="lazy"
              className="mx-auto mt-10 w-full max-w-4xl rounded-xl2"
            />

            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { badge: "304", title: "Inner Layer", desc: "Food-grade steel — corrosion-resistant & non-reactive." },
                { badge: "Al", title: "Aluminium Core", desc: "Superior heat distribution for even cooking." },
                { badge: "430", title: "Outer Layer", desc: "Food-grade & magnetic — fully induction ready." },
                { badge: "★", title: "No Hotspots", desc: "Uniform heating across the whole surface." },
              ].map((l) => (
                <div key={l.title} className="card p-5 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-copper/10 text-sm font-bold text-copper">
                    {l.badge}
                  </div>
                  <p className="mt-3 font-semibold">{l.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/60">{l.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Aurex vs ordinary — comparison */}
      <Reveal>
        <section className="container-x py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip bg-copper/15 text-copper">Why Aurex</span>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Aurex vs ordinary cookware</h2>
            <p className="mt-3 text-ink/65">Built to a higher standard — here's how we compare.</p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl overflow-x-auto rounded-xl2 ring-1 ring-ink/[0.08]">
            <div className="min-w-[400px]">
              <div className="grid grid-cols-[1fr_5rem_5rem] bg-ink text-sm font-semibold text-cream sm:grid-cols-[1fr_7rem_7rem]">
                <div className="px-4 py-3 sm:px-6">Feature</div>
                <div className="py-3 text-center">Aurex</div>
                <div className="py-3 text-center text-cream/55">Ordinary</div>
              </div>
              {COMPARISON.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-[1fr_5rem_5rem] items-center text-sm sm:grid-cols-[1fr_7rem_7rem] ${
                    i % 2 ? "bg-sand/40" : "bg-white"
                  }`}
                >
                  <div className="px-4 py-3.5 text-ink/80 sm:px-6">{row.feature}</div>
                  <div className="grid place-items-center py-3.5">
                    {row.aurex ? <Check size={18} className="text-forest" /> : <X size={18} className="text-ink/25" />}
                  </div>
                  <div className="grid place-items-center py-3.5">
                    {row.ordinary ? <Check size={18} className="text-forest" /> : <X size={18} className="text-ink/25" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* New arrivals */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-semibold">New arrivals</h2>
          <Link to="/shop?new=1" className="btn-ghost">
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {distinctProducts(newArrivals?.length ? newArrivals : bestsellers ?? featured ?? []).slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Story — full-bleed band, text over the foundry image */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/brand/foundry.webp"
          alt="Molten metal poured at the Aurex foundry"
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-105 object-cover motion-safe:animate-[kenburns_18s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30" />
        <div className="relative container-x flex min-h-[460px] flex-col justify-center py-20 sm:min-h-[520px]">
          <div className="max-w-xl">
            <Reveal>
              <span className="chip bg-gold/25 text-cream ring-1 ring-cream/20">The Art of Manufacturing</span>
              <h2 className="mt-4 text-4xl font-semibold text-cream sm:text-5xl">Five decades in the making</h2>
              <p className="mt-5 text-lg leading-relaxed text-cream/85">
                Aurex's manufacturing roots go back more than fifty years. Every piece is engineered
                in-house — from bonding the triply base to hand-finishing each cast iron pan — so
                what reaches your kitchen is built to be passed down, not replaced.
              </p>
              <Link to="/story" className="btn-copper mt-8">
                Read our story <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Reviews — auto carousel */}
      <section className="border-y border-ink/[0.06] bg-white">
        <div className="container-x py-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold">Loved by home cooks</h2>
            <p className="mt-1 text-ink/60">4.7★ average from 5,000+ Aurex kitchens.</p>
          </div>
          <Carousel
            slideClassName="basis-full sm:basis-1/2 lg:basis-1/3"
            gapClassName="gap-5"
            autoPlayMs={4500}
            ariaLabel="Customer reviews"
          >
            {testimonials.map((t) => (
              <figure key={t.name} className="card flex h-full flex-col p-6">
                <Rating value={t.rating} />
                <blockquote className="mt-3 flex-1 text-ink/80">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-ink">
                  — {t.name}
                  <span className="ml-1 font-normal text-ink/50">· {t.place}</span>
                  <span className="mt-0.5 block text-xs font-normal text-forest">Verified buyer</span>
                </figcaption>
              </figure>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Recipes teaser */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="chip bg-forest/10 text-forest">From the Aurex kitchen</span>
            <h2 className="mt-3 text-3xl font-semibold">Recipes & guides</h2>
          </div>
          <Link to="/blog" className="btn-ghost hidden sm:inline-flex">
            Read the journal <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {RECIPES.map((r) => (
            <Link key={r.title} to="/blog" className="group card overflow-hidden hover-lift">
              <div className="aspect-[4/3] overflow-hidden bg-sand">
                <img
                  src={r.image}
                  alt={r.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-copper">{r.tag}</span>
                <h3 className="mt-1 font-semibold transition-colors group-hover:text-copper">{r.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x pb-20">
        <h2 className="mb-8 text-center text-3xl font-semibold">Frequently asked</h2>
        <div className="mx-auto max-w-3xl divide-y divide-ink/10 rounded-xl2 bg-white shadow-card">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {f.q}
                <span className="text-copper transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
