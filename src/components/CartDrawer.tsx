import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function CartDrawer() {
  const { isOpen, setOpen, lines, subtotal, itemCount, setQty, remove, campaignDiscount, activeCampaign } = useCart();

  const mrpTotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const mrp = l.compareAtPrice && l.compareAtPrice > l.unitPrice ? l.compareAtPrice : l.unitPrice;
      return sum + mrp * l.quantity;
    }, 0);
  }, [lines]);

  const itemDiscount = useMemo(() => {
    return Math.max(0, mrpTotal - subtotal);
  }, [mrpTotal, subtotal]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    // Viewport-sized clipping layer: keeps the off-canvas panel from creating
    // horizontal page scroll on mobile (a fixed panel translated off-screen
    // isn't clipped by html{overflow-x:hidden}, but an absolute child of this
    // overflow-hidden layer IS).
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-lift transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag size={18} /> Your Cart
            <span className="text-sm font-normal text-ink/50">({itemCount})</span>
          </h2>
          <button onClick={() => setOpen(false)} aria-label="Close cart" className="btn-ghost p-2">
            <X size={20} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-sand">
              <ShoppingBag className="text-ink/40" />
            </div>
            <p className="text-ink/60">Your cart is empty.</p>
            <button className="btn-copper mt-2" onClick={() => setOpen(false)}>
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {lines.map((l) => (
                  <li key={`${l.productId}-${l.variantId ?? ""}`} className="flex gap-3">
                    <img
                      src={l.image}
                      alt={l.name}
                      className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <Link
                        to={`/product/${l.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-2 text-sm font-medium leading-snug hover:text-copper"
                      >
                        {l.name}
                      </Link>
                      {l.shortDescription && (
                        <p className="mt-1 line-clamp-1 text-xs text-ink/60">{l.shortDescription}</p>
                      )}
                      {l.variantName && (
                        <span className="mt-0.5 text-xs text-ink/50">{l.variantName}</span>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-ink/15">
                          <button
                            onClick={() => setQty(l.productId, l.quantity - 1, l.variantId)}
                            disabled={l.quantity <= 1}
                            className="grid h-7 w-7 place-items-center text-ink/70 disabled:opacity-30 disabled:hover:text-ink/70 hover:text-copper"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-sm">{l.quantity}</span>
                          <button
                            onClick={() => setQty(l.productId, l.quantity + 1, l.variantId)}
                            className="grid h-7 w-7 place-items-center text-ink/70 hover:text-copper"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="text-sm font-semibold">
                            {formatINR(l.unitPrice * l.quantity)}
                          </span>
                          {l.compareAtPrice && l.compareAtPrice > l.unitPrice && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                              <span className="text-ink/40 line-through">
                                {formatINR(l.compareAtPrice * l.quantity)}
                              </span>
                              <span className="font-medium text-green-600">
                                {Math.round(((l.compareAtPrice - l.unitPrice) / l.compareAtPrice) * 100)}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(l.productId, l.variantId)}
                      className="self-start p-1 text-ink/40 hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-ink/10 px-5 py-4">
              <div className="space-y-1.5 mb-3 text-sm">
                {itemDiscount > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs text-ink/60">
                      <span>Total MRP</span>
                      <span className="line-through">{formatINR(mrpTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-forest">
                      <span>Discount on MRP ({mrpTotal > 0 ? Math.round((itemDiscount / mrpTotal) * 100) : 0}% Off)</span>
                      <span>−{formatINR(itemDiscount)}</span>
                    </div>
                  </>
                )}
                {campaignDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs text-forest">
                    <span>Promo ({activeCampaign?.name} - {activeCampaign?.discountPercentage}%)</span>
                    <span>−{formatINR(campaignDiscount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-semibold pt-1">
                  <span className="text-ink/80">Subtotal</span>
                  <span className="text-lg text-ink">{formatINR(Math.max(0, subtotal - campaignDiscount))}</span>
                </div>
              </div>
              <p className="mb-3 text-center text-xs text-ink/50">
                Free shipping · Taxes calculated at checkout
              </p>
              <Link to="/cart" onClick={() => setOpen(false)} className="btn-primary w-full">
                View cart & checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
