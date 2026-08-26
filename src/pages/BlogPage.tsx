import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { stockImg } from "@/lib/images";
import Seo from "@/components/Seo";

/**
 * Blog index. Placeholder articles until the client supplies real posts (or a
 * CMS feed). Card shape is ready to map over real blog data later.
 */
const POSTS = [
  {
    slug: "season-cast-iron",
    title: "How to season cast iron (and keep it non-stick for life)",
    excerpt:
      "A simple 4-step routine to build and maintain a naturally non-stick surface on your Aurex cast iron.",
    tag: "Care Guide",
    read: "4 min read",
    image: stockImg("cast-iron-skillet", 4001, 800, 560),
  },
  {
    slug: "triply-vs-nonstick",
    title: "Triply vs non-stick: which cookware is right for you?",
    excerpt:
      "Even heat, durability and healthy cooking — how triply stainless steel compares to coated pans.",
    tag: "Buying Guide",
    read: "5 min read",
    image: stockImg("stainless-steel-cookware", 4002, 800, 560),
  },
  {
    slug: "perfect-dosa",
    title: "The secret to crisp, even dosas every time",
    excerpt:
      "Tawa choice, heat control and batter tips from five decades of cookware craftsmanship.",
    tag: "Recipes",
    read: "6 min read",
    image: stockImg("griddle-pan", 4003, 800, 560),
  },
  {
    slug: "cookware-care",
    title: "Everyday care that makes cookware last for years",
    excerpt:
      "Small habits — from cleaning to storage — that keep triply and cast iron looking new.",
    tag: "Care Guide",
    read: "3 min read",
    image: stockImg("kitchen-cookware", 4004, 800, 560),
  },
];

export default function BlogPage() {
  return (
    <div className="container-x py-12">
      <Seo
        title="Aurex Journal — Cookware Guides & Recipes"
        description="Guides, recipes and cookware care tips from the Aurex workshop — how to season cast iron, choose triply cookware, and make it last."
        canonicalPath="/blog"
      />
      <div className="max-w-2xl">
        <span className="chip bg-copper/15 text-copper">Aurex Journal</span>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Guides, recipes & cookware care
        </h1>
        <p className="mt-3 text-ink/60">
          Tips from our workshop to help you cook better and make your cookware last.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {POSTS.map((post) => (
          <article key={post.slug} className="group card overflow-hidden">
            <div className="aspect-[3/2] overflow-hidden bg-sand">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 text-xs">
                <span className="chip bg-forest/10 text-forest">{post.tag}</span>
                <span className="flex items-center gap-1 text-ink/50">
                  <Clock size={13} /> {post.read}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug group-hover:text-copper">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-ink/60">{post.excerpt}</p>
              <button className="btn-ghost mt-4 px-0 text-sm text-copper">
                Read article <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-xl2 bg-charcoal p-8 text-center text-cream">
        <h3 className="text-xl font-semibold">More recipes & guides coming soon</h3>
        <p className="mx-auto mt-2 max-w-md text-cream/70">
          Follow us for the latest from the Aurex kitchen.
        </p>
        <Link to="/shop" className="btn-copper mt-5">Shop the collection</Link>
      </div>
    </div>
  );
}
