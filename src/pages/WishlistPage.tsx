import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";

export default function WishlistPage() {
  const { ids, count, clear } = useWishlist();
  const { data: products, loading } = useAsync(() => data.getProducts(), []);

  const wished = (products ?? []).filter((p) => ids.includes(p.id));

  return (
    <div className="container-x py-10">
      <Seo title="My Wishlist" noindex />
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-semibold">
          <Heart className="text-copper" /> My Wishlist
          <span className="text-lg font-normal text-ink/50">({count})</span>
        </h1>
        {count > 0 && (
          <button onClick={clear} className="btn-ghost text-sm">Clear all</button>
        )}
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card aspect-[3/4] animate-pulse bg-sand/60" />
          ))}
        </div>
      ) : wished.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {wished.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-10 card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sand">
            <Heart className="text-ink/40" />
          </div>
          <p className="mt-4 text-ink/60">Your wishlist is empty.</p>
          <p className="text-sm text-ink/50">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn-copper mt-6">Explore cookware</Link>
        </div>
      )}
    </div>
  );
}
