import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X, Tag } from "lucide-react";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import { discountPct } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import Rating from "@/components/Rating";
import Reveal from "@/components/Reveal";
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

const MOCK_CATEGORIES = [
  { key: "cat-triply", name: "Triply Steel", to: "/shop/triply", image: "/products/wc-653-0.webp" },
  { key: "cat-castiron", name: "Cast Iron", to: "/shop/cast-iron", image: "/products/663-0.png" },
  { key: "cat-kadhai", name: "Kadhais", to: "/shop/kadhai", image: "/products/wc-981-0.webp" },
  { key: "cat-honeycomb", name: "Honeycomb", to: "/shop/honeycomb", image: "/products/wc-655-0.webp" },
  { key: "cat-sets", name: "Cookware Sets", to: "/shop?q=set", image: "/products/wc-644-0.webp" },
  { key: "cat-tawas", name: "Tawas & Grids", to: "/shop?q=tawa", image: "/products/wc-649-0.webp" },
  { key: "cat-frypans", name: "Fry Pans", to: "/shop?q=pan", image: "/products/wc-646-s0-0.webp" },
  { key: "cat-saucepans", name: "Sauce Pots", to: "/shop?q=sauce", image: "/products/wc-661-0.webp" },
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
  const { data: bestsellers } = useAsync(() => data.getProducts({ sort: "rating" }), []);
  const { data: allProducts } = useAsync(() => data.getProducts(), []);

  const [heroSlides, setHeroSlides] = useState<any[]>(HERO_SLIDES);

  useEffect(() => {
    fetch("http://localhost:5002/api/v1/carousel")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.slides?.length > 0) {
          const formatted = res.data.slides.map((s: any) => ({
            chip: s.chip,
            lead: s.lead,
            accent: s.accent,
            typewriter: s.typewriter?.length > 0 ? s.typewriter : undefined,
            subtitle: s.subtitle,
            cta: s.cta,
            to: s.to,
            image: s.image?.url || s.image,
            alt: s.alt || s.lead,
          }));
          setHeroSlides(formatted);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch dynamic carousel slides, falling back to local slides.", err);
      });
  }, []);

  const deals = useMemo(() => {
    if (!allProducts) return [];
    return distinctProducts(
      [...allProducts]
        .filter((p) => p.compareAtPrice)
        .sort((a, b) => (discountPct(b.price, b.compareAtPrice) ?? 0) - (discountPct(a.price, a.compareAtPrice) ?? 0))
    ).slice(0, 6);
  }, [allProducts]);



  return (
    <div className="w-full bg-cream min-h-screen">
      <Seo
        title="Aurex India — Premium Triply & Cast Iron Cookware"
        description="Premium triply stainless steel and toxin-free cast iron cookware, built to last a lifetime. Free shipping across India, lifetime warranty on cast iron."
        canonicalPath="/"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />

      {/* Hero Carousel Banner Section */}
      <section className="relative pt-6 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <Carousel slideClassName="basis-full" gapClassName="gap-0" autoPlayMs={6500} showDots={true} showArrows={true} leftArrow={true} ariaLabel="Featured collections" className="rounded-lg overflow-hidden shadow-sm border border-ink/[0.04] bg-ink">
          {heroSlides.map((s, i) => (
            <div
              key={i}
              className="relative min-h-[420px] sm:min-h-[500px] lg:min-h-[580px] flex items-center overflow-hidden w-full group/slide"
            >
              {/* Background image */}
              <img
                src={s.image}
                alt={s.alt}
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[8000ms] ease-out scale-100 group-hover/slide:scale-[1.02]"
              />
              
              {/* Elegant Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent md:bg-gradient-to-r md:from-ink/85 md:via-ink/40 md:to-transparent" />
              
              {/* Content overlay */}
              <div className="relative z-10 px-6 sm:px-12 lg:px-20 py-12 max-w-xl sm:max-w-2xl text-cream">
                <span className="block text-gold/90 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                  {s.chip}
                </span>
                
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white tracking-tight leading-[1.1]">
                  {s.lead}{" "}
                  {s.typewriter ? (
                    <span className="text-cream/90 italic font-light">{s.typewriter[0]}</span>
                  ) : (
                    <span className="text-cream/90 italic font-light">{s.accent}</span>
                  )}
                </h1>
                
                <p className="mt-6 text-sm sm:text-base lg:text-lg text-cream/70 font-light leading-relaxed max-w-md">
                  {s.subtitle}
                </p>
                
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link to={s.to} className="inline-flex items-center justify-center gap-2 rounded-sm bg-white text-ink hover:bg-cream transition-colors text-sm font-semibold px-8 py-3.5">
                    {s.cta}
                  </Link>
                  <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/30 hover:border-white hover:bg-white/5 transition-colors text-sm font-medium text-cream px-8 py-3.5">
                    Explore collection
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>


      {/* Section 1: Browse by Categories (Circular slider layout) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8 flex items-center justify-between relative">
          <h2 className="text-2xl sm:text-3xl font-black text-ink">
            Browse by <span className="text-copper">Categories</span>
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-copper text-copper hover:bg-copper hover:text-white transition-all text-xs font-bold shadow-sm"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="marquee overflow-hidden py-4 w-full select-none">
          <div className="marquee-track flex gap-8 items-center" style={{ animationDuration: "50s" }}>
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 gap-8 items-center" aria-hidden={dup === 1}>
                {MOCK_CATEGORIES.map((t) => (
                  <Link key={t.key + (dup ? "-dup" : "")} to={t.to} className="group flex flex-col items-center text-center cursor-fork py-2">
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white border border-ink/[0.06] flex items-center justify-center overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105">
                      {/* Image fades and scales down on hover */}
                      <img
                        src={t.image}
                        alt={t.name}
                        loading="lazy"
                        className="w-[75%] h-[75%] object-contain transition-all duration-300 group-hover:scale-50 group-hover:opacity-0"
                      />
                      
                      {/* Translucent cover overlay fades in on hover */}
                      <div className="absolute inset-0 bg-copper/85 backdrop-blur-[2px] flex items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <span className="text-white text-[9px] sm:text-[11px] font-black tracking-wider uppercase text-center leading-tight">
                          {t.name}
                        </span>
                      </div>
                    </div>
                    <span className="mt-3 text-[10px] sm:text-[11px] font-extrabold text-ink group-hover:text-copper transition-colors uppercase tracking-wider max-w-[100px] sm:max-w-[120px] truncate">
                      {t.name}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Triply Collection",
              sub: "Three bonded layers for fast, even, professional heat distribution.",
              to: "/shop/triply",
              cta: "Shop Triply",
              image: "/brand/tri-ply-range.webp",
              tint: "from-ink/95 via-ink/60",
            },
            {
              title: "Cast Iron, Reimagined",
              sub: "Pre-seasoned, naturally non-stick, chemical-free and toxin-free.",
              to: "/shop/cast-iron",
              cta: "Shop Cast Iron",
              image: "/brand/cast-iron-range.webp",
              tint: "from-forest/95 via-forest/55",
            },
          ].map((b) => (
            <Reveal key={b.title}>
              <Link
                to={b.to}
                className="group relative isolate flex min-h-[260px] items-end overflow-hidden rounded-xl2 hover-lift sm:min-h-[320px] shadow-sm border border-ink/[0.04]"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  loading="lazy"
                  className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 -z-10 bg-gradient-to-t ${b.tint} to-transparent`} />
                <div className="p-6 sm:p-8 text-cream">
                  <h3 className="text-xl sm:text-2xl font-bold">{b.title}</h3>
                  <p className="mt-2 max-w-xs text-xs sm:text-sm text-cream/80">{b.sub}</p>
                  <span className="btn-copper mt-4 inline-flex text-xs py-2 px-4">
                    {b.cta} <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>


      {/* Bestsellers Products */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-ink/[0.05]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">Bestsellers</h2>
            <p className="mt-1 text-xs sm:text-sm text-ink/65">Most-loved items by home cooks across India.</p>
          </div>
          <Link to="/shop?sort=rating" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-copper text-copper hover:bg-copper hover:text-white transition-all text-xs font-bold shadow-sm">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <Carousel slideClassName="basis-[75%] sm:basis-1/4 lg:basis-1/5" gapClassName="gap-5" ariaLabel="Bestsellers">
          {distinctProducts(bestsellers ?? []).slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Carousel>
      </section>

      {/* Best Deals Banner & Carousel */}
      <section className="border-y border-ink/[0.06] bg-gradient-to-r from-copper/[0.06] via-white to-gold/[0.1] my-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="mb-8 max-w-xl">
            <span className="chip bg-gold text-ink text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"><Tag size={12} className="mr-1 inline" /> Best Deals</span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-ink">Weekly Special Offers</h2>
            <p className="mt-1.5 text-sm text-ink/65">
              Use coupon code <b className="text-copper">WELCOME15</b> for an extra 15% discount on your first purchase.
            </p>
          </div>
          <Carousel slideClassName="basis-[75%] sm:basis-1/4 lg:basis-1/5" gapClassName="gap-5" ariaLabel="Best deals">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Carousel>
        </div>
      </section>


      {/* Triply construction — the material/layers story */}
      <Reveal>
        <section className="border-t border-ink/[0.06] bg-gradient-to-b from-white to-sand/20 py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="chip bg-copper/15 text-copper font-bold">The Aurex Difference</span>
              <h2 className="mt-4 text-3xl font-black text-ink">Engineered in three layers</h2>
              <p className="mt-3 text-sm text-ink/65 leading-relaxed">
                Food-grade 304 steel on the inside, a heat-spreading aluminium core, and induction-ready 430 steel outside — no coatings, no hotspots, built to last.
              </p>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2 items-center max-w-5xl mx-auto">
              {/* Left Column: Contained Diagram Image */}
              <div className="flex items-center justify-center bg-white p-6 rounded-xl2 border border-ink/[0.04] shadow-sm max-h-[380px] overflow-hidden">
                <img
                  src="/brand/construction.webp"
                  alt="Aurex triply construction"
                  loading="lazy"
                  className="max-h-[320px] object-contain"
                />
              </div>

              {/* Right Column: Layer specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { badge: "304", title: "Inner Layer", desc: "Food-grade steel — corrosion-resistant & non-reactive." },
                  { badge: "Al", title: "Aluminium Core", desc: "Superior heat distribution for even cooking." },
                  { badge: "430", title: "Outer Layer", desc: "Food-grade & magnetic — fully induction ready." },
                  { badge: "★", title: "No Hotspots", desc: "Uniform heating across the whole surface." },
                ].map((l) => (
                  <div key={l.title} className="card p-5 bg-white shadow-sm border border-ink/[0.04] flex gap-4 items-start text-left">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-copper/10 text-xs font-black text-copper flex-shrink-0">
                      {l.badge}
                    </div>
                    <div>
                      <p className="font-bold text-ink text-sm leading-tight">{l.title}</p>
                      <p className="text-xs leading-normal text-ink/65 mt-1.5">{l.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Aurex vs ordinary — comparison */}
      <Reveal>
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <span className="chip bg-copper/15 text-copper font-bold">Why Aurex</span>
            <h2 className="mt-4 text-3xl font-black text-ink">Aurex vs ordinary cookware</h2>
            <p className="mt-3 text-sm text-ink/65">Built to a higher standard — here's how we compare.</p>
          </div>
          
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl2 border border-ink/[0.08] shadow-sm bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[480px]">
                <div className="grid grid-cols-[1fr_6rem_6rem] bg-ink text-xs font-bold uppercase tracking-wider text-cream py-3.5 px-6">
                  <div>Feature</div>
                  <div className="text-center">Aurex</div>
                  <div className="text-center text-cream/55">Ordinary</div>
                </div>
                {COMPARISON.map((row, i) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-[1fr_6rem_6rem] items-center text-sm px-6 py-4 border-b border-ink/5 last:border-0 ${
                      i % 2 === 0 ? "bg-sand/15" : "bg-white"
                    }`}
                  >
                    <div className="font-semibold text-ink/80">{row.feature}</div>
                    <div className="grid place-items-center">
                      {row.aurex ? <Check size={18} className="text-forest font-bold" /> : <X size={18} className="text-ink/25" />}
                    </div>
                    <div className="grid place-items-center">
                      {row.ordinary ? <Check size={18} className="text-forest font-bold" /> : <X size={18} className="text-ink/25" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Story section */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/brand/foundry.webp"
          alt="Molten metal poured at the Aurex foundry"
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-105 object-cover motion-safe:animate-[kenburns_18s_ease-in-out_infinite_alternate] -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/30 -z-10" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex min-h-[460px] flex-col justify-center py-20">
          <div className="max-w-xl">
            <Reveal>
              <span className="chip bg-gold/25 text-cream ring-1 ring-cream/20 font-bold">The Art of Manufacturing</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black text-cream">Five decades in the making</h2>
              <p className="mt-5 text-sm sm:text-base leading-relaxed text-cream/80">
                Aurex's manufacturing roots go back more than fifty years. Every piece is engineered in-house — from bonding the triply base to hand-finishing each cast iron pan — so what reaches your kitchen is built to be passed down.
              </p>
              <Link to="/story" className="btn-copper mt-8 text-xs px-5 py-2.5">
                Read our story <ArrowRight size={14} className="ml-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="border-b border-ink/[0.06] bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-ink">Loved by Home Cooks</h2>
            <p className="mt-2 text-xs sm:text-sm text-ink/65">4.7★ average rating from 5,000+ kitchen transformations.</p>
          </div>
          <Carousel
            slideClassName="basis-full sm:basis-1/2 lg:basis-1/3"
            gapClassName="gap-5"
            autoPlayMs={4500}
            ariaLabel="Customer reviews"
          >
            {testimonials.map((t) => (
              <figure key={t.name} className="card flex h-full flex-col p-6 border border-ink/5 shadow-sm bg-cream/10">
                <Rating value={t.rating} />
                <blockquote className="mt-3 flex-1 text-sm text-ink/75 italic">“{t.text}”</blockquote>
                <figcaption className="mt-4 pt-3 border-t border-ink/5 text-xs font-bold text-ink">
                  — {t.name}
                  <span className="ml-1 font-normal text-ink/50">· {t.place}</span>
                  <span className="mt-0.5 block text-[10px] font-black text-forest">Verified Buyer</span>
                </figcaption>
              </figure>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="mb-10 text-center text-3xl font-black text-ink">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-3xl divide-y divide-ink/10 rounded-xl2 bg-white shadow-sm border border-ink/[0.04]">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-sm sm:text-base text-ink select-none outline-none">
                {f.q}
                <span className="text-copper group-open:rotate-45 transition-transform duration-200 text-lg font-bold">+</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-ink/65 leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
