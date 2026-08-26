import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { stockImg } from "@/lib/images";
import Seo from "@/components/Seo";



export default function AboutPage() {
  return (
    <div>
      <Seo
        title="Our Story"
        description="Aurex India — five decades of cookware manufacturing craftsmanship. Premium triply stainless steel and cast iron, engineered in-house to last."
        canonicalPath="/about"
      />
      <section className="bg-gradient-to-br from-sand via-cream to-sand">
        <div className="container-x py-16 text-center">
          <span className="chip bg-copper/15 text-copper">Our Story</span>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold sm:text-5xl">
            The art of manufacturing, perfected over five decades
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink/70">
            Aurex began as a family manufacturing business and grew into a
            cookware brand trusted in kitchens across India.
          </p>
        </div>
      </section>

      <section className="container-x grid items-center gap-10 py-16 lg:grid-cols-2">
        <img
          src={stockImg("cast-iron-foundry", 3003, 900, 675)}
          alt="Manufacturing"
          className="aspect-[4/3] w-full rounded-xl2 object-cover shadow-card"
        />
        <div className="space-y-4 text-ink/75">
          <h2 className="text-2xl font-semibold text-ink">Built in-house, built to last</h2>
          <p>
            From bonding the triply base to hand-finishing each cast iron pan,
            every step happens under one roof. That control is why our cookware
            heats evenly, lasts for years, and carries warranties we stand behind.
          </p>
          <p>
            We believe good cookware should be an heirloom — something you pass
            down, not throw away. Every Aurex piece is engineered with that
            promise in mind.
          </p>
          <Link to="/shop" className="btn-copper mt-2">
            Explore the collection <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-x grid gap-6 py-14 sm:grid-cols-3">
          {[
            { n: "50+", l: "Years of manufacturing" },
            { n: "5,000+", l: "Happy home cooks" },
            { n: "100%", l: "Toxin-free cookware" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-4xl font-semibold text-copper">{s.n}</p>
              <p className="mt-1 text-ink/60">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
