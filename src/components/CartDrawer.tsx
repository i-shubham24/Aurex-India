import { Link } from "react-router-dom";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function CartDrawer() {
  const { isOpen, setOpen, lines, subtotal, itemCount, setQty, remove } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-lift transition-transform duration-300 ${
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
                      {l.variantName && (
                        <span className="mt-0.5 text-xs text-ink/50">{l.variantName}</span>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-ink/15">
                          <button
                            onClick={() => setQty(l.productId, l.quantity - 1, l.variantId)}
                            className="grid h-7 w-7 place-items-center text-ink/70 hover:text-copper"
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
                        <span className="text-sm font-semibold">
                          {formatINR(l.unitPrice * l.quantity)}
                        </span>
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
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-ink/60">Subtotal</span>
                <span className="text-lg font-semibold">{formatINR(subtotal)}</span>
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
    </>
  );
}
