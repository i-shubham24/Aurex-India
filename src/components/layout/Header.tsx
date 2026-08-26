import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User as UserIcon, Search, Menu, X, Truck, Heart } from "lucide-react";
import Logo from "@/components/Logo";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

const MARQUEE = [
  "Free shipping across India on all orders",
  "5 decades of cookware craftsmanship",
  "Lifetime warranty on cast iron",
  "Toxin-free · induction ready",
  "Use code WELCOME15 for 15% off your first order",
];

const NAV = [
  { label: "Shop All", to: "/shop" },
  { label: "Triply", to: "/shop/triply" },
  { label: "Cast Iron", to: "/shop/cast-iron" },
  { label: "Kadhai", to: "/shop/kadhai" },
  { label: "Honeycomb", to: "/shop/honeycomb" },
];

export default function Header() {
  const { itemCount, setOpen } = useCart();
  const { user } = useAuth();
  const { count: wishCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
      setMobileOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-cream/95 backdrop-blur-md supports-[backdrop-filter]:bg-cream/80">
      {/* Announcement marquee */}
      <div className="marquee overflow-hidden bg-ink py-2 text-cream">
        <div className="marquee-track text-xs font-medium">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {MARQUEE.map((m, i) => (
                <span key={i} className="mx-6 inline-flex items-center gap-1.5">
                  <Truck size={13} className="text-gold" /> {m}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Main bar */}
      <div className="container-x flex items-center gap-4 py-4">
        <button
          className="lg:hidden -ml-1 p-1 text-ink"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Logo />

        {/* Search — right aligned */}
        <form
          onSubmit={submitSearch}
          className="ml-auto hidden w-64 items-center md:flex lg:w-80"
        >
          <div className="relative w-full">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search kadais, tawas, triply…"
              className="input pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-2">
          <Link
            to={user ? "/account" : "/login"}
            className="btn-ghost hidden px-3 sm:inline-flex"
          >
            <UserIcon size={18} />
            <span className="hidden text-sm lg:inline">
              {user ? user.fullName?.split(" ")[0] ?? "Account" : "Login"}
            </span>
          </Link>
          <Link to="/wishlist" className="relative btn-ghost px-3" aria-label="Wishlist">
            <Heart size={18} />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 text-[0.65rem] font-bold text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="relative btn-ghost px-3"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 text-[0.65rem] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden border-t border-ink/[0.06] lg:block">
        <div className="container-x flex items-center gap-6 py-3 text-sm">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-medium transition-colors hover:text-copper ${
                  isActive ? "text-copper" : "text-ink/75"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/blog" className="font-medium text-ink/75 hover:text-copper">
            Blogs
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-ink/[0.06] bg-cream lg:hidden">
          <div className="container-x space-y-1 py-4">
            <form onSubmit={submitSearch} className="mb-3 md:hidden">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products…"
                  className="input pl-9"
                />
              </div>
            </form>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-ink/80 hover:bg-ink/[0.05]"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
