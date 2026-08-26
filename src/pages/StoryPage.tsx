import { Link } from "react-router-dom";
import { ArrowRight, Recycle, Flame, Zap, Factory, Leaf, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";
import Seo from "@/components/Seo";

const STATS = [
  { n: "50+", l: "Years of manufacturing" },
  { n: "100%", l: "Toxin-free cookware" },
  { n: "3", l: "Bonded layers of triply" },
  { n: "5,000+", l: "Happy home cooks" },
];

const TIMELINE = [
  { year: "1970s", title: "The foundry begins", text: "A family metal-craft workshop is born — the roots of Aurex manufacturing." },
  { year: "1990s", title: "Mastering cast iron", text: "Decades of casting expertise refine our pre-seasoned, toxin-free cast iron." },
  { year: "2010s", title: "The triply leap", text: "We bond food-grade steel around an aluminium core for even, induction-ready heat." },
  { year: "Today", title: "Aurex, in your kitchen", text: "Cookware engineered in-house and built to be passed down, not replaced." },
];

const VALUES = [
  { Icon: Recycle, t: "100% toxin-free", d: "No PFOA, no chemical coatings — ever." },
  { Icon: Flame, t: "Even, edge-to-edge heat", d: "Aluminium core spreads heat with no hotspots." },
  { Icon: Zap, t: "Induction ready", d: "Works beautifully on gas and induction." },
  { Icon: Factory, t: "Made in India", d: "Engineered and finished in-house, start to finish." },
];

const LAYERS = [
  { badge: "304", title: "Inner layer", desc: "Food-grade stainless steel — corrosion-resistant." },
  { badge: "Al", title: "Aluminium core", desc: "Superior, even heat distribution." },
  { badge: "430", title: "Outer layer", desc: "Food-grade & magnetic — induction ready." },
];

export default function StoryPage() {
  return (
    <div>
      <Seo
        title="Our Story"
        description="Five decades of cookware craftsmanship. How Aurex engineers toxin-free triply and cast iron cookware in-house — built to be passed down, not replaced."
        canonicalPath="/story"
      />

      {/* Hero — full-bleed foundry */}
      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
        <img
          src="/brand/foundry.webp"
          alt="Molten metal poured at the Aurex foundry"
          className="absolute inset-0 -z-10 h-full w-full scale-105 object-cover motion-safe:animate-[kenburns_20s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="container-x py-20">
          <Reveal>
            <span className="chip bg-gold/25 text-cream ring-1 ring-cream/20">Our Story</span>
            <h1 className="mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight text-cream sm:text-5xl lg:text-6xl">
              Cookware, crafted to be passed down
            </h1>
            <p className="mt-5 max-w-xl text-lg text-cream/85">
              Five decades of metal-craft, engineered into everyday Indian cooking — toxin-free,
              even-heating, and built to last a lifetime.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-ink/[0.06] bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-serif text-4xl font-semibold text-copper">{s.n}</p>
              <p className="mt-1 text-sm text-ink/60">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Intro — factory image + narrative */}
      <section className="container-x grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-20">
        <Reveal>
          <img
            src="/brand/factory.webp"
            alt="Grinding and finishing at the Aurex workshop"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl2 object-cover shadow-card"
          />
        </Reveal>
        <Reveal delay={100}>
          <div>
            <span className="chip bg-copper/15 text-copper">The Art of Manufacturing</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">Five decades in the making</h2>
            <p className="mt-4 text-ink/70">
              Aurex's roots go back more than fifty years — from a family metal-craft workshop to a
              cookware brand trusted in kitchens across India. Every piece is engineered in-house:
              bonding the triply base, hand-finishing each cast iron pan, and inspecting the details
              most brands outsource.
            </p>
            <p className="mt-3 text-ink/70">
              That control is why our cookware heats evenly, lasts for years, and feels like an
              heirloom — something you pass down, not throw away.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Triply science — construction infographic */}
      <section className="border-y border-ink/[0.06] bg-gradient-to-b from-white to-sand/40">
        <div className="container-x py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip bg-copper/15 text-copper">The Triply Science</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">Three layers, one perfect pan</h2>
            <p className="mt-3 text-ink/65">
              Food-grade steel inside and out, with an aluminium core that spreads heat evenly.
            </p>
          </div>
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <img
                src="/brand/construction.webp"
                alt="Aurex triply construction cross-section"
                loading="lazy"
                className="mx-auto w-full max-w-xl rounded-xl2"
              />
            </Reveal>
            <div className="space-y-4">
              {LAYERS.map((l, i) => (
                <Reveal key={l.title} delay={i * 90}>
                  <div className="card flex items-start gap-4 p-5">
                    <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-copper/10 text-sm font-bold text-copper">
                      {l.badge}
                    </div>
                    <div>
                      <p className="font-semibold">{l.title}</p>
                      <p className="mt-0.5 text-sm text-ink/60">{l.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container-x py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip bg-forest/10 text-forest">Our Journey</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">From foundry to your kitchen</h2>
        </div>
        <ol className="relative mx-auto mt-12 max-w-3xl border-l-2 border-copper/25 pl-8">
          {TIMELINE.map((m, i) => (
            <Reveal key={m.year} delay={i * 90}>
              <li className="relative pb-10 last:pb-0">
                <span className="absolute -left-[2.6rem] grid h-8 w-8 place-items-center rounded-full bg-copper text-xs font-bold text-white ring-4 ring-cream">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold uppercase tracking-wide text-copper">{m.year}</p>
                <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                <p className="mt-1 text-ink/65">{m.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Values */}
      <section className="border-y border-ink/[0.06] bg-white">
        <div className="container-x py-16">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">What we stand for</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ Icon, t, d }, i) => (
              <Reveal key={t} delay={i * 80}>
                <div className="card h-full p-6 text-center hover-lift">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-copper/10 text-copper">
                    <Icon size={22} />
                  </div>
                  <p className="mt-4 font-semibold">{t}</p>
                  <p className="mt-1 text-sm text-ink/60">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — full range */}
      <section className="relative isolate flex min-h-[360px] items-center overflow-hidden">
        <img
          src="/brand/full-range.webp"
          alt="The full Aurex cookware range"
          loading="lazy"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
        <div className="container-x py-16">
          <Reveal>
            <span className="chip bg-cream/15 text-cream ring-1 ring-cream/20">
              <Leaf size={13} className="mr-1" /> Toxin-free, built to last
            </span>
            <h2 className="mt-4 max-w-xl font-serif text-3xl font-semibold text-cream sm:text-4xl">
              Bring home cookware worth keeping
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-copper">
                Shop the range <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn-outline border-cream/40 text-cream hover:bg-cream/10 hover:text-cream">
                <Sparkles size={15} /> More about Aurex
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
