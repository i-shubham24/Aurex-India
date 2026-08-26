import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, Tag, X, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { data } from "@/services";
import { useAsync } from "@/lib/useAsync";
import { payments, isPaymentConfigured } from "@/services/payments";
import { openRazorpay } from "@/lib/razorpay";
import { formatINR } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";

const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917814477667";

export default function CartPage() {
  const {
    lines, subtotal, discount, total, itemCount,
    coupon, couponMessage, applyCoupon, removeCoupon,
    setQty, remove, clear,
  } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);

  // "You may also like" — products not in the cart, same categories first.
  const { data: allProducts } = useAsync(() => data.getProducts(), []);
  const recommendations = useMemo(() => {
    if (!allProducts) return [];
    const cartIds = new Set(lines.map((l) => l.productId));
    const cartCats = new Set(
      allProducts.filter((p) => cartIds.has(p.id)).map((p) => p.categorySlug)
    );
    const candidates = allProducts.filter((p) => !cartIds.has(p.id));
    const sameCat = candidates.filter((p) => cartCats.has(p.categorySlug));
    const rest = candidates.filter((p) => !cartCats.has(p.categorySlug));
    return [...sameCat, ...rest].slice(0, 4);
  }, [allProducts, lines]);

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    await applyCoupon(code);
    setApplying(false);
  }

  const [payError, setPayError] = useState("");

  async function placeOrder() {
    const order = await data.createOrder(user!.id, lines);
    setPlacedId(order.id);
    clear();
  }

  async function checkout() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setPayError("");
    setPlacing(true);
    try {
      // No Razorpay key configured → fall back to the WhatsApp-confirm stub.
      if (!isPaymentConfigured()) {
        await placeOrder();
        return;
      }

      // Razorpay flow (test mode with public key, or server-backed if
      // VITE_PAYMENTS_API_URL is set).
      const receipt = `AX-${Date.now()}`;
      const created = await payments.createOrder(total * 100, receipt);
      await openRazorpay({
        key: created.keyId,
        amount: created.amount,
        currency: created.currency,
        order_id: created.orderId,
        name: "Aurex India",
        description: `${itemCount} item(s)`,
        prefill: { name: user.fullName, email: user.email, contact: user.phone },
        theme: { color: "#B06E3F" },
        handler: async (resp) => {
          const { verified } = await payments.verify(resp);
          if (verified) {
            await placeOrder();
          } else {
            setPayError("Payment could not be verified. If you were charged, contact us on WhatsApp.");
          }
          setPlacing(false);
        },
        modal: { ondismiss: () => setPlacing(false) },
      });
    } catch (err) {
      setPayError((err as Error).message);
      setPlacing(false);
    }
  }

  if (placedId) {
    return (
      <div className="container-x py-20">
        <Seo title="Order Confirmed" noindex />
        <div className="mx-auto max-w-lg card p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest/10 text-forest">
            <Check size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Order placed!</h1>
          <p className="mt-2 text-ink/60">
            Your order <span className="font-semibold text-ink">{placedId}</span> is confirmed.
            Payment is being set up — our team will reach out on WhatsApp to finalise delivery.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/account" className="btn-primary">View my orders</Link>
            <Link to="/shop" className="btn-outline">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <Seo title="Your Cart" noindex />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sand">
          <ShoppingBag className="text-ink/40" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Discover cookware built to last a lifetime.</p>
        <Link to="/shop" className="btn-copper mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <Seo title="Your Cart" noindex />
      <h1 className="text-3xl font-semibold">Your cart <span className="text-lg font-normal text-ink/50">({itemCount} items)</span></h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lines */}
        <div className="space-y-4">
          {lines.map((l) => (
            <div key={`${l.productId}-${l.variantId ?? ""}`} className="card flex gap-4 p-4">
              <img src={l.image} alt={l.name} className="h-24 w-24 flex-shrink-0 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/product/${l.slug}`} className="font-medium leading-snug hover:text-copper">
                    {l.name}
                  </Link>
                  <button onClick={() => remove(l.productId, l.variantId)} className="p-1 text-ink/40 hover:text-red-600" aria-label="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
                {l.variantName && <span className="mt-0.5 text-xs text-ink/50">{l.variantName}</span>}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-ink/15">
                    <button onClick={() => setQty(l.productId, l.quantity - 1, l.variantId)} disabled={l.quantity <= 1} className="grid h-8 w-8 place-items-center text-ink/70 disabled:opacity-30 disabled:hover:text-ink/70 hover:text-copper" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm">{l.quantity}</span>
                    <button onClick={() => setQty(l.productId, l.quantity + 1, l.variantId)} className="grid h-8 w-8 place-items-center text-ink/70 hover:text-copper" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <span className="font-semibold">{formatINR(l.unitPrice * l.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clear} className="btn-ghost text-sm">Clear cart</button>
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-28">
          <div className="card p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>

            {/* Coupon */}
            <div className="mt-4">
              {coupon ? (
                <div className="flex items-center justify-between rounded-lg bg-forest/10 px-3 py-2 text-sm text-forest">
                  <span className="flex items-center gap-1.5 font-medium"><Tag size={14} /> {coupon.code}</span>
                  <button onClick={removeCoupon} aria-label="Remove coupon"><X size={15} /></button>
                </div>
              ) : (
                <form onSubmit={onApply} className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="input"
                  />
                  <button type="submit" disabled={applying} className="btn-outline whitespace-nowrap">
                    {applying ? "…" : "Apply"}
                  </button>
                </form>
              )}
              {couponMessage && (
                <p className={`mt-2 text-xs ${coupon ? "text-forest" : "text-red-600"}`}>{couponMessage}</p>
              )}
              <p className="mt-2 text-xs text-ink/45">Try <b>WELCOME15</b>, <b>AUREX10</b> or <b>FLAT200</b></p>
            </div>

            <dl className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
              {discount > 0 && (
                <div className="flex justify-between text-forest"><dt>Discount</dt><dd>−{formatINR(discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-ink/60">Shipping</dt><dd className="text-forest">Free</dd></div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-semibold">
                <dt>Total</dt><dd>{formatINR(total)}</dd>
              </div>
            </dl>

            <button onClick={checkout} disabled={placing} className="btn-primary mt-5 w-full py-3">
              {placing
                ? "Processing…"
                : !user
                ? "Login to checkout"
                : isPaymentConfigured()
                ? `Pay ${formatINR(total)} with Razorpay`
                : "Place order"}
            </button>
            {payError && <p className="mt-2 text-center text-xs text-red-600">{payError}</p>}
            <p className="mt-3 text-center text-xs text-ink/45">
              {isPaymentConfigured() ? (
                <>🔒 Secure payments by Razorpay · UPI, cards, netbanking</>
              ) : (
                <>
                  💳 Online payment (Razorpay) activates once keys are added. For now we confirm your
                  order over{" "}
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="text-copper underline">WhatsApp</a>.
                </>
              )}
            </p>
          </div>
        </aside>
      </div>

      {/* You may also like */}
      {recommendations.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
