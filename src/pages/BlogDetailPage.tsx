import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, Calendar, User, ArrowLeft, ArrowRight, Share2, BookOpen } from "lucide-react";
import { getBlogBySlug } from "@/api/blogApi";
import Seo from "@/components/Seo";
import { organizationJsonLd } from "@/lib/seo";
import { useToast } from "@/context/ToastContext";

function BlogDetailSkeleton() {
  return (
    <div className="container-x py-14 max-w-4xl mx-auto min-h-screen space-y-6">
      <div className="h-4 w-36 skeleton-shimmer rounded" />
      <div className="h-4 w-24 skeleton-shimmer rounded-full" />
      <div className="h-10 w-4/5 skeleton-shimmer rounded-lg" />
      <div className="flex gap-4 h-4 w-48 skeleton-shimmer rounded" />
      <div className="aspect-[16/9] w-full skeleton-shimmer rounded-xl2" />
      <div className="space-y-3 pt-6">
        <div className="h-4 w-full skeleton-shimmer rounded" />
        <div className="h-4 w-11/12 skeleton-shimmer rounded" />
        <div className="h-4 w-4/5 skeleton-shimmer rounded" />
        <div className="h-4 w-full skeleton-shimmer rounded" />
      </div>
    </div>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const toast = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => getBlogBySlug(slug!),
    enabled: !!slug,
  });

  const blog = data?.blog;
  const related = data?.related || [];

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (isError || !blog) {
    return (
      <div className="container-x py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <BookOpen className="w-12 h-12 text-ink/20 mb-3" />
        <h1 className="text-2xl font-bold text-ink">Article Not Found</h1>
        <p className="text-sm text-ink/60 mt-1 max-w-sm">
          The article you are looking for may have been removed or moved to a different URL.
        </p>
        <Link to="/blog" className="btn-copper mt-6 text-xs">
          Back to Aurex Journal
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  };

  return (
    <article className="container-x py-14 max-w-4xl mx-auto min-h-screen">
      <Seo
        title={`${blog.title} — Aurex Journal`}
        description={blog.excerpt}
        image={blog.coverImage}
        canonicalPath={`/blog/${blog.slug}`}
        jsonLd={[organizationJsonLd()]}
      />

      {/* Back Link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-xs font-bold text-copper hover:text-gold transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to Aurex Journal
      </Link>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="chip bg-copper/15 text-copper font-bold text-xs">{blog.category}</span>
          <span className="flex items-center gap-1.5 text-xs text-ink/50 font-medium">
            <Clock size={13} /> {blog.readTime || '4 min read'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-ink/10 pb-6 text-xs text-ink/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-ink/80">
              <User size={14} className="text-copper" /> {blog.author || 'Aurex Team'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand/60 hover:bg-sand text-copper font-bold transition-colors"
          >
            <Share2 size={13} /> Share Article
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl2 bg-sand shadow-card border border-ink/10">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Article Lead Excerpt */}
      <div className="mt-8 text-lg font-medium text-ink/80 leading-relaxed border-l-4 border-copper pl-4 bg-sand/30 py-3 rounded-r-xl">
        {blog.excerpt}
      </div>

      {/* Main Content HTML Render */}
      <div
        className="mt-8 prose prose-slate max-w-none text-ink/85 leading-relaxed text-sm sm:text-base space-y-6 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Author Bio Banner */}
      <div className="mt-14 p-6 rounded-2xl bg-white border border-ink/10 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-copper text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
          A
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-ink">{blog.author || 'Aurex Team'}</h4>
          <p className="text-xs text-ink/60 mt-0.5">
            Crafting durable triply & toxin-free cast iron cookware since 1974. Made in India.
          </p>
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-ink/10 space-y-6">
          <h3 className="text-xl font-black text-ink">More Articles from Aurex Journal</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item._id}
                to={`/blog/${item.slug}`}
                className="group flex flex-col bg-white rounded-xl overflow-hidden border border-ink/10 shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden bg-sand">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase text-copper">{item.category}</span>
                  <h4 className="text-xs font-bold text-ink mt-1 group-hover:text-copper transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="mt-3 pt-2 border-t border-ink/5 flex items-center text-[10px] text-copper font-bold gap-1">
                    Read Article <ArrowRight size={11} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
