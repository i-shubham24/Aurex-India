import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Flame, Recycle } from "lucide-react";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import ProductCard from "@/components/ProductCard";
import Rating from "@/components/Rating";
import Reveal from "@/components/Reveal";
import Typewriter from "@/components/Typewriter";
import Seo from "@/components/Seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const testimonials = [
  {
    name: "Priya Nair",
    text: "The triply kadai heats so evenly — no more burnt centres. Feels like a lifetime purchase.",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    text: "Switched our whole kitchen to Aurex cast iron. Dosas have never been crispier.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    text: "Premium build, fast delivery, and it looks gorgeous on the stove. Highly recommend.",
    rating: 4,
  },
];

const faqs = [
  {
    q: "Is Aurex cookware induction compatible?",
    a: "Yes — all triply cookware and most cast iron pieces work on both induction and gas.",
  },
  {
    q: "What warranty do I get?",
    a: "Cast iron carries a lifetime warranty; triply stainless steel is covered for 10 years against manufacturing defects.",
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

  return (
    <div>
      <Seo
        title="Aurex India — Premium Triply & Cast Iron Cookware"
        description="Premium triply stainless steel and toxin-free cast iron cookware, built to last a lifetime. Free shipping across India, lifetime warranty on cast iron."
        canonicalPath="/"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sand via-cream to-sand">
        <div className="container-x grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="chip bg-copper/15 text-copper animate-fade-up" style={{ animationDelay: "0ms" }}>
              5 decades of craftsmanship
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink animate-fade-up sm:text-5xl lg:text-6xl" style={{ animationDelay: "80ms" }}>
              <span className="block">Cookware built to</span>
              {/* Own line + reserved height so typing/erasing never reflows the page */}
              <span className="block min-h-[1.15em]">
                <Typewriter
                  className="text-copper"
                  words={["last a lifetime", "cook evenly", "be passed down", "last for years"]}
                />
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink/70 animate-fade-up" style={{ animationDelay: "180ms" }}>
              Premium triply stainless steel and toxin-free cast iron, engineered
              for even heat and everyday Indian cooking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "280ms" }}>
              <Link to="/shop" className="btn-primary">
                Shop all cookware <ArrowRight size={16} />
              </Link>
              <Link to="/shop/cast-iron" className="btn-outline cursor-fork">
                Explore cast iron
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/60">
              <span className="flex items-center gap-1.5"><Truck size={15} /> Free shipping</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={15} /> Lifetime warranty</span>
              <span className="flex items-center gap-1.5"><Recycle size={15} /> Toxin-free</span>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
            <img
              src="https://images.unsplash.com/photo-1584990347193-6bebebfeaeee?w=1400&q=80&auto=format&fit=crop"
              alt="Premium stainless steel cookware"
              onError={(e) => {
                e.currentTarget.src = "/products/649-0.jpg";
              }}
              className="aspect-[4/3] w-full rounded-xl2 object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl2 bg-white p-4 shadow-card animate-float sm:block">
              <p className="text-2xl font-semibold text-ink">4.7★</p>
              <p className="text-xs text-ink/60">Rated by 5,000+ home cooks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-ink/[0.06] bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { Icon: Flame, t: "Even heat", s: "Aluminium-core triply base" },
            { Icon: ShieldCheck, t: "Warranty", s: "Lifetime on cast iron" },
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
          {(categories ?? []).map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <Link
                to={`/shop/${c.slug}`}
                className="group card overflow-hidden text-center hover-lift cursor-fork block"
              >
                <div className="aspect-square overflow-hidden bg-sand">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="px-2 py-3 text-sm font-medium transition-colors group-hover:text-copper">{c.name}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured banner */}
      <section className="container-x">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl2 bg-ink p-8 text-cream">
            <h3 className="text-2xl font-semibold">Triply Collection</h3>
            <p className="mt-2 max-w-xs text-cream/70">
              Three bonded layers for fast, even, professional heat.
            </p>
            <Link to="/shop/triply" className="btn-copper mt-5">
              Shop triply <ArrowRight size={15} />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-xl2 bg-forest p-8 text-cream">
            <h3 className="text-2xl font-semibold">Cast Iron, Reimagined</h3>
            <p className="mt-2 max-w-xs text-cream/70">
              Pre-seasoned, naturally non-stick, lifetime warranty.
            </p>
            <Link to="/shop/cast-iron" className="btn-copper mt-5">
              Shop cast iron <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-semibold">New arrivals</h2>
          <Link to="/shop?new=1" className="btn-ghost">
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {(newArrivals ?? featured ?? []).slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-white">
        <div className="container-x grid items-center gap-10 py-16 lg:grid-cols-2">
          <img
            src="/products/661-0.png"
            alt="Aurex cast iron cookware"
            className="aspect-[4/3] w-full rounded-xl2 object-cover shadow-card"
          />
          <div>
            <span className="chip bg-copper/15 text-copper">The Art of Manufacturing</span>
            <h2 className="mt-4 text-3xl font-semibold">Five decades in the making</h2>
            <p className="mt-4 text-ink/70">
              Aurex's manufacturing roots go back more than fifty years. Every
              piece is engineered in-house — from bonding the triply base to
              hand-finishing each cast iron pan — so what reaches your kitchen is
              built to be passed down, not replaced.
            </p>
            <Link to="/about" className="btn-outline mt-6">
              Read our story <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-x py-16">
        <h2 className="text-center text-3xl font-semibold">Loved by home cooks</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="card h-full p-6 hover-lift">
                <Rating value={t.rating} />
                <blockquote className="mt-3 text-ink/80">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-ink">
                  — {t.name}
                  <span className="ml-2 font-normal text-copper">Verified buyer</span>
                </figcaption>
              </figure>
            </Reveal>
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
