import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import Seo from "@/components/Seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const POSTS = [
  {
    slug: "season-cast-iron",
    title: "How to season cast iron (and keep it non-stick for life)",
    excerpt:
      "A simple 4-step routine to build and maintain a naturally non-stick surface on your Aurex cast iron.",
    tag: "Care Guide",
    read: "4 min read",
    image: "/brand/cast-iron-range.webp",
  },
  {
    slug: "triply-vs-nonstick",
    title: "Triply vs non-stick: which cookware is right for you?",
    excerpt:
      "Even heat, durability and healthy cooking — how triply stainless steel compares to coated pans.",
    tag: "Buying Guide",
    read: "5 min read",
    image: "/brand/tri-ply-range.webp",
  },
  {
    slug: "perfect-dosa",
    title: "The secret to crisp, even dosas every time",
    excerpt:
      "Tawa choice, heat control and batter tips from five decades of cookware craftsmanship.",
    tag: "Recipes",
    read: "6 min read",
    image: "/brand/recipe-dosa.webp",
  },
  {
    slug: "cookware-care",
    title: "Everyday care that makes cookware last for years",
    excerpt:
      "Small habits — from cleaning to storage — that keep triply and cast iron looking new.",
    tag: "Care Guide",
    read: "3 min read",
    image: "/brand/full-range.webp",
  },
];

export default function BlogPage() {
  return (
    <div className="container-x py-14 bg-cream/40 min-h-screen">
      <Seo
        title="Aurex Journal — Cookware Guides & Recipes"
        description="Guides, recipes and cookware care tips from the Aurex workshop — how to season cast iron, choose triply cookware, and make it last."
        canonicalPath="/blog"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />
      
      {/* Header section */}
      <div className="max-w-2xl">
        <span className="chip bg-copper/15 text-copper font-bold">Aurex Journal</span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-black text-ink">
          Guides, recipes & cookware care
        </h1>
        <p className="mt-3 text-sm text-ink/65 leading-relaxed">
          Tips from our workshop to help you cook better and make your cookware last.
        </p>
      </div>

      {/* Featured Post Row */}
      {POSTS.slice(0, 1).map((post) => (
        <div key={post.slug} className="mt-10 group bg-white rounded-xl2 overflow-hidden border border-ink/[0.06] shadow-sm hover:shadow-md transition-all duration-300 grid md:grid-cols-2 gap-0">
          <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-sand relative min-h-[280px]">
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute top-4 left-4">
              <span className="chip bg-gold text-ink font-extrabold uppercase text-[10px] tracking-wider py-1 px-2.5 shadow-sm border border-gold-light/20">
                Featured Article
              </span>
            </div>
          </div>
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-xs">
              <span className="chip bg-copper/10 text-copper font-bold">{post.tag}</span>
              <span className="flex items-center gap-1.5 text-ink/50 font-medium">
                <Clock size={13} /> {post.read}
              </span>
            </div>
            <h2 className="mt-4 text-xl sm:text-2xl font-black leading-tight text-ink group-hover:text-copper transition-colors">
              {post.title}
            </h2>
            <p className="mt-3 text-sm text-ink/65 leading-relaxed">{post.excerpt}</p>
            <div className="mt-6 pt-6 border-t border-ink/[0.06]">
              <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 font-bold text-sm text-copper group-hover:text-gold transition-colors">
                Read Article <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Grid of Other Articles */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.slice(1).map((post) => (
          <article key={post.slug} className="group flex flex-col bg-white rounded-xl2 overflow-hidden border border-ink/[0.06] shadow-sm hover:shadow-md transition-all duration-300">
            <div className="aspect-[16/10] overflow-hidden bg-sand relative">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-3 text-xs">
                <span className="chip bg-copper/10 text-copper font-bold">{post.tag}</span>
                <span className="flex items-center gap-1.5 text-ink/50 font-medium">
                  <Clock size={13} /> {post.read}
                </span>
              </div>
              <h3 className="mt-3 text-base font-black leading-snug text-ink group-hover:text-copper transition-colors flex-1">
                {post.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/60 line-clamp-2">{post.excerpt}</p>
              
              <div className="mt-5 pt-4 border-t border-ink/[0.06]">
                <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 font-bold text-xs text-copper group-hover:text-gold transition-colors">
                  Read Article <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
