import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Search, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBlogs } from "@/api/blogApi";
import Seo from "@/components/Seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

function BlogContentSkeleton() {
  return (
    <>
      {/* Featured Card Skeleton */}
      <div className="mt-10 rounded-xl2 bg-white overflow-hidden border border-ink/10 shadow-sm grid md:grid-cols-2">
        <div className="aspect-[16/10] md:aspect-auto min-h-[300px] skeleton-shimmer" />
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-4">
          <div className="h-4 w-32 skeleton-shimmer rounded" />
          <div className="h-8 w-5/6 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-4/5 skeleton-shimmer rounded" />
          <div className="pt-4 h-6 w-28 skeleton-shimmer rounded" />
        </div>
      </div>

      {/* Articles Grid Skeleton */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl2 overflow-hidden border border-ink/10 shadow-sm space-y-4 p-4">
            <div className="aspect-[16/10] w-full skeleton-shimmer rounded-xl" />
            <div className="h-4 w-28 skeleton-shimmer rounded" />
            <div className="h-6 w-4/5 skeleton-shimmer rounded" />
            <div className="h-4 w-full skeleton-shimmer rounded" />
            <div className="h-4 w-2/3 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </>
  );
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isPending, isFetching } = useQuery({
    queryKey: ['blogs', selectedCategory, searchQuery],
    queryFn: () => getBlogs({ category: selectedCategory, search: searchQuery }),
    placeholderData: (previousData) => previousData,
  });

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];
  const regularPosts = featuredPost ? posts.filter((p) => p._id !== featuredPost._id) : posts;

  const categories = ["ALL", "Care Guide", "Buying Guide", "Recipes", "Cookware Science"];

  return (
    <div className="container-x py-14 bg-cream/40 min-h-screen">
      <Seo
        title="Aurex Journal — Cookware Guides & Recipes"
        description="Guides, recipes and cookware care tips from the Aurex workshop — how to season cast iron, choose triply cookware, and make it last."
        canonicalPath="/blog"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />
      
      {/* Header section - Permanently Mounted */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="chip bg-copper/15 text-copper font-bold">Aurex Journal</span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black text-ink">
            Guides, recipes & cookware care
          </h1>
          <p className="mt-3 text-sm text-ink/65 leading-relaxed">
            Tips from our workshop to help you cook better and make your cookware last.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-ink/15 bg-white text-xs font-medium text-ink placeholder:text-ink/40 focus:border-copper focus:ring-4 focus:ring-copper/15 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Chips Filter - Permanently Mounted */}
      <div className="mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-copper text-white shadow-sm"
                : "bg-white text-ink/70 hover:bg-sand border border-ink/10"
            }`}
          >
            {cat === "ALL" ? "All Articles" : cat}
          </button>
        ))}
      </div>

      {/* Bottom Content Area - Updates smoothly without layout flicker */}
      {isPending ? (
        <BlogContentSkeleton />
      ) : posts.length === 0 ? (
        <div className="mt-16 text-center py-16 bg-white rounded-xl2 border border-ink/10 shadow-sm max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-ink/20 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-ink">No articles found</h3>
          <p className="text-xs text-ink/60 mt-1">Try clearing your search or category filter.</p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
            }}
            className="btn-copper mt-4 text-xs"
          >
            Show All Articles
          </button>
        </div>
      ) : (
        <div className={`transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
          {/* Featured Post Row */}
          {featuredPost && (
            <div key={featuredPost._id} className="mt-10 group bg-white rounded-xl2 overflow-hidden border border-ink/10 shadow-card hover:shadow-lift transition-all duration-300 grid md:grid-cols-2 gap-0">
              <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-sand relative min-h-[280px]">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="chip bg-gold text-ink font-extrabold uppercase text-[10px] tracking-wider py-1 px-2.5 shadow-sm border border-gold-light/20">
                    ⭐ Featured Article
                  </span>
                </div>
              </div>
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs">
                  <span className="chip bg-copper/10 text-copper font-bold">{featuredPost.category}</span>
                  <span className="flex items-center gap-1.5 text-ink/50 font-medium">
                    <Clock size={13} /> {featuredPost.readTime || '4 min read'}
                  </span>
                </div>
                <h2 className="mt-4 text-xl sm:text-2xl font-black leading-tight text-ink group-hover:text-copper transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="mt-3 text-sm text-ink/65 leading-relaxed">{featuredPost.excerpt}</p>
                <div className="mt-6 pt-6 border-t border-ink/[0.06]">
                  <Link to={`/blog/${featuredPost.slug}`} className="inline-flex items-center gap-2 font-bold text-sm text-copper group-hover:text-gold transition-colors">
                    Read Article <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Other Articles */}
          {regularPosts.length > 0 && (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {regularPosts.map((post) => (
                <article key={post._id} className="group flex flex-col bg-white rounded-xl2 overflow-hidden border border-ink/10 shadow-card hover:shadow-lift transition-all duration-300">
                  <div className="aspect-[16/10] overflow-hidden bg-sand relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="chip bg-copper/10 text-copper font-bold">{post.category}</span>
                      <span className="flex items-center gap-1.5 text-ink/50 font-medium">
                        <Clock size={13} /> {post.readTime || '4 min read'}
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
          )}
        </div>
      )}
    </div>
  );
}
