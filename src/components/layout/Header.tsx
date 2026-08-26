import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User as UserIcon, Search, Menu, X, Truck, Heart, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

const MARQUEE = [
  "Free shipping across India on all orders",
  "5 decades of cookware craftsmanship",
  "Lifetime warranty on cast iron",
  "Toxin-free · induction ready",
];

const NAV = [
  { label: "Home", to: "/" },
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
    <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-cream/95 backdrop-blur-md supports-[backdrop-filter]:bg-cream/80 w-full">
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-4 w-full">
          <button
            className="lg:hidden -ml-1 p-2 text-ink hover:bg-copper/5 rounded-full transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Centered Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-auto">
            <form onSubmit={submitSearch} className="relative flex items-center w-full">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What are you looking for today?"
                className="w-full h-[42px] bg-sand/50 hover:bg-sand/80 focus:bg-white text-ink placeholder:text-ink/40 text-sm px-6 pr-12 rounded-full border border-transparent focus:border-copper focus:ring-4 focus:ring-copper/10 transition-all duration-300 outline-none shadow-sm focus:shadow-md"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-[30px] h-[30px] bg-copper rounded-full flex items-center justify-center text-white shadow-sm hover:bg-gold hover:text-ink transition-colors border-none outline-none"
                aria-label="Search"
              >
                <Search size={14} />
              </button>
            </form>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Account Info */}
            <button
              onClick={() => navigate(user ? "/account" : "/login")}
              className="hidden lg:flex items-center gap-3 text-right hover:opacity-85 transition-opacity group"
            >
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] text-ink/50 font-bold uppercase tracking-wider">
                  {user ? `Hello, ${user.fullName?.split(" ")[0]}` : "Hello, Guest"}
                </span>
                <span className="text-xs font-black text-ink group-hover:text-copper transition-colors">
                  {user ? "My Account" : "Sign In or Register"}
                </span>
              </div>
              <div className="p-2.5 text-ink/50 group-hover:text-copper group-hover:bg-copper/5 rounded-full transition-all duration-300">
                <UserIcon size={20} />
              </div>
            </button>

            <div className="lg:hidden">
              <button
                onClick={() => navigate(user ? "/account" : "/login")}
                className="p-2 text-ink/70 hover:text-copper hover:bg-copper/5 rounded-full transition-colors"
                aria-label="Account"
              >
                <UserIcon size={20} />
              </button>
            </div>

            <div className="h-6 w-px bg-ink/10 hidden lg:block" />

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-ink/50 hover:text-copper hover:bg-copper/5 rounded-full transition-all duration-300 group"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 text-[0.65rem] font-bold text-white shadow-sm">
                  {wishCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setOpen(true)}
              className="relative p-2.5 text-ink/50 hover:text-copper hover:bg-copper/5 rounded-full transition-all duration-300 group"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 text-[0.65rem] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="lg:hidden pb-3">
          <form onSubmit={submitSearch} className="relative flex items-center w-full">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full h-10 bg-sand/50 text-ink placeholder:text-ink/40 text-xs px-4 pr-10 rounded-full border border-transparent focus:border-copper outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 w-[28px] h-[28px] bg-copper rounded-full flex items-center justify-center text-white"
              aria-label="Search"
            >
              <Search size={12} />
            </button>
          </form>
        </div>
      </div>

      {/* Desktop sub-navigation */}
      <nav className="hidden border-t border-ink/[0.06] bg-white lg:block">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-center gap-10 h-11 text-xs font-bold tracking-wider uppercase">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative py-3 transition-colors hover:text-copper flex items-center gap-1 ${isActive ? "text-copper" : "text-ink/65"
                }`
              }
            >
              {item.label}
              {item.label === "Shop All" && <ChevronDown size={12} className="opacity-60" />}
            </NavLink>
          ))}
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              `relative py-3 transition-colors hover:text-copper ${isActive ? "text-copper" : "text-ink/65"
              }`
            }
          >
            Blogs
          </NavLink>
        </div>
      </nav>

      {/* Mobile Menu Slideout */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-cream shadow-2xl p-6 flex flex-col justify-between animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-ink/10">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 hover:bg-copper/10 rounded-full text-ink"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-ink/80 hover:bg-copper/10 hover:text-copper transition-colors"
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/blog"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-ink/80 hover:bg-copper/10 hover:text-copper transition-colors"
                >
                  Blogs
                </NavLink>
              </div>
            </div>

            <div className="pt-6 border-t border-ink/10 space-y-3">
              <NavLink
                to={user ? "/account" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-copper/10 px-4 py-3 text-sm font-bold text-copper hover:bg-copper/20 transition-all text-center justify-center"
              >
                <UserIcon size={16} />
                {user ? user.fullName?.split(" ")[0] ?? "Account" : "Sign In / Register"}
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
