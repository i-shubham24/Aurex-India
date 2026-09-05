import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User as UserIcon, Search, Menu, X, Truck, Heart, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/components/Logo";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { getProductsPaginated } from "@/api/productApi";
import { useDebounce } from "@/lib/useDebounce";
import { formatINR } from "@/lib/format";

const MARQUEE = [
  "Free shipping across India on all orders",
  "5 decades of cookware craftsmanship",
  "Lifetime warranty on cast iron",
  "Toxin-free · induction ready",
];

const NAV = [
  { label: "Home", to: "/", end: true },
  { label: "Shop All", to: "/shop" },
  { label: "Triply", to: "/shop/triply" },
  { label: "Cast Iron", to: "/shop/cast-iron" },
  { label: "Kadhai", to: "/shop/kadhai" },
  { label: "Honeycomb", to: "/shop/honeycomb" },
];

export default function Header() {
  const { itemCount, setOpen, activeCampaign } = useCart();
  const { user, loading, openAuthModal } = useAuth();
  const { count: wishCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQ = useDebounce(q, 300);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ['products', 'search', debouncedQ],
    queryFn: () => getProductsPaginated({ search: debouncedQ, limit: 5 }),
    enabled: debouncedQ.trim().length > 1,
  });

  const searchResults = searchData?.products || [];

  const marqueeItems = activeCampaign?.bannerText
    ? [activeCampaign.bannerText, ...MARQUEE]
    : MARQUEE;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
      setMobileOpen(false);
      setIsFocused(false);
    }
  }

  return (
    <header className="fixed top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur-md supports-[backdrop-filter]:bg-cream/80 w-full shadow-sm">
      {/* Announcement marquee */}
      <div className="marquee bg-ink py-2 text-cream">
        <div className="marquee-track text-xs font-medium">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1 ? "true" : undefined}>
              {marqueeItems.map((m, i) => (
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
          <div className="hidden lg:flex flex-1 max-w-xl mx-auto relative" ref={searchContainerRef}>
            <form onSubmit={submitSearch} className="relative flex items-center w-full z-50">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="What are you looking for today?"
                className="w-full h-[44px] bg-white text-ink placeholder:text-ink/50 text-sm px-6 pr-12 rounded-full border border-ink/15 hover:border-copper/60 focus:border-copper focus:ring-4 focus:ring-copper/15 transition-all duration-300 outline-none shadow-sm focus:shadow-md font-medium"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-[32px] h-[32px] bg-copper rounded-full flex items-center justify-center text-white shadow-md hover:bg-copper-dark transition-all duration-200 border-none outline-none hover:scale-105 active:scale-95"
                aria-label="Search"
              >
                <Search size={15} />
              </button>
            </form>

            {/* Desktop Live Search Dropdown */}
            {isFocused && q.trim().length > 1 && (
              <div className="absolute top-[48px] left-0 w-full bg-white rounded-xl shadow-2xl border border-ink/[0.04] overflow-hidden z-50 flex flex-col">
                {isSearching ? (
                  <div className="p-6 text-center text-sm text-ink/60">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="flex flex-col max-h-[350px] overflow-y-auto p-2">
                      {searchResults.map((product: any) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug}`}
                          onClick={() => {
                            setIsFocused(false);
                            setQ("");
                          }}
                          className="flex items-center gap-4 p-3 hover:bg-sand/40 rounded-lg transition-colors"
                        >
                          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded bg-sand" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-ink truncate">{product.name}</span>
                            <span className="text-xs text-ink/60 font-medium">{formatINR(product.price)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      to={`/shop?search=${encodeURIComponent(q.trim())}`}
                      onClick={() => setIsFocused(false)}
                      className="p-3 bg-sand/30 text-center text-xs font-bold text-copper hover:bg-sand/60 transition-colors uppercase tracking-wider"
                    >
                      View all {searchData?.pagination?.total} results
                    </Link>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-ink/70">No products found for "{q}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Account Info */}
            <button
              onClick={() => {
                if (loading) return;
                user ? navigate("/account") : openAuthModal("login");
              }}
              className="hidden lg:flex items-center gap-3 text-right hover:opacity-85 transition-opacity group"
            >
              {loading ? (
                <div className="flex flex-col items-end gap-1.5 animate-pulse">
                  <div className="h-2.5 w-16 bg-ink/10 rounded" />
                  <div className="h-3.5 w-24 bg-ink/15 rounded" />
                </div>
              ) : (
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-[10px] text-ink/50 font-bold uppercase tracking-wider">
                    {user ? `Hello, ${user.fullName?.split(" ")[0]}` : "Hello, Guest"}
                  </span>
                  <span className="text-xs font-black text-ink group-hover:text-copper transition-colors">
                    {user ? "My Account" : "Sign In or Register"}
                  </span>
                </div>
              )}
              <div className="p-2.5 text-ink/50 group-hover:text-copper group-hover:bg-copper/5 rounded-full transition-all duration-300">
                <UserIcon size={20} />
              </div>
            </button>

            <div className="lg:hidden">
              <button
                onClick={() => user ? navigate("/account") : openAuthModal("login")}
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
        <div className="lg:hidden pb-3 relative">
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

          {/* Mobile Live Search Dropdown */}
          {q.trim().length > 1 && (
            <div className="absolute top-[44px] left-0 w-full bg-white rounded-xl shadow-2xl border border-ink/[0.04] overflow-hidden z-50 flex flex-col">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-ink/60">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="flex flex-col max-h-[250px] overflow-y-auto p-2">
                    {searchResults.map((product: any) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        onClick={() => {
                          setQ("");
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-sand/40 rounded-lg transition-colors"
                      >
                        <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded bg-sand" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-ink truncate">{product.name}</span>
                          <span className="text-[10px] text-ink/60 font-medium">{formatINR(product.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/shop?search=${encodeURIComponent(q.trim())}`}
                    onClick={() => setQ("")}
                    className="p-3 bg-sand/30 text-center text-[10px] font-bold text-copper hover:bg-sand/60 transition-colors uppercase tracking-wider"
                  >
                    View all {searchData?.pagination?.total} results
                  </Link>
                </>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-xs text-ink/70">No products found for "{q}"</p>
                </div>
              )}
            </div>
          )}
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

      {/* Mobile Menu Slideout with Portal to escape sticky header stacking context */}
      {mobileOpen && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] lg:hidden animate-fade-in" aria-modal="true" role="dialog">
            {/* Dark Backdrop */}
            <div
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />

            {/* Solid White Drawer */}
            <div className="fixed inset-y-0 left-0 w-[82%] max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between z-10 border-r border-ink/10 animate-fade-in overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-ink/10">
                  <Logo />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 hover:bg-sand/60 rounded-full text-ink"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  {NAV.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive
                          ? "bg-copper text-white shadow-sm"
                          : "text-ink/80 hover:bg-sand/50 hover:text-copper"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <NavLink
                    to="/blog"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive
                        ? "bg-copper text-white shadow-sm"
                        : "text-ink/80 hover:bg-sand/50 hover:text-copper"
                      }`
                    }
                  >
                    Blogs
                  </NavLink>
                </div>
              </div>

              <div className="pt-6 border-t border-ink/10 space-y-3">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    if (user) {
                      navigate("/account");
                    } else {
                      openAuthModal("login");
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-xl bg-copper text-white px-4 py-3 text-sm font-bold shadow-sm hover:opacity-90 transition-all text-center justify-center border-none"
                >
                  <UserIcon size={16} />
                  {user ? "My Account Dashboard" : "Sign In / Register"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
