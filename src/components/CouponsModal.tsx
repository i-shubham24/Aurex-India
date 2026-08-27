import { useState } from "react";
import { Tag, X, Check, Sparkles, Copy, CheckCircle2, Lock, ArrowRight, Percent } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

export interface CouponItem {
  _id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  validUntil?: string;
}

interface CouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupons: CouponItem[];
  appliedCouponCode?: string;
  subtotal: number;
  onApplyCoupon: (code: string) => Promise<boolean | void>;
  onRemoveCoupon?: () => void;
}

export default function CouponsModal({
  isOpen,
  onClose,
  coupons,
  appliedCouponCode,
  subtotal,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponsModalProps) {
  const toast = useToast();
  const [manualCode, setManualCode] = useState("");
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = async (code: string) => {
    setApplyingCode(code);
    try {
      const res = await onApplyCoupon(code);
      if (res !== false) {
        onClose();
      }
    } finally {
      setApplyingCode(null);
    }
  };

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code "${code}"`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Calculate potential savings for a coupon given current subtotal
  const calculateSavings = (c: CouponItem) => {
    if (c.discountType === "PERCENTAGE") {
      const raw = Math.round((subtotal * c.discountValue) / 100);
      return c.maximumDiscount ? Math.min(raw, c.maximumDiscount) : raw;
    }
    return Math.min(c.discountValue, subtotal);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-lg bg-[#faf8f5] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-ink/10 overflow-hidden animate-scale-up max-h-[90vh] sm:max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-white border-b border-ink/5 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Apply Coupon</h3>
            <p className="text-xs text-ink/50 mt-0.5 font-medium">
              Cart Total: <span className="text-ink font-bold">{formatINR(subtotal)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-sand/60 text-ink/50 hover:text-ink transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Coupon Search Bar */}
        <div className="bg-white px-6 py-3.5 border-b border-ink/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) handleApply(manualCode.trim());
            }}
            className="flex items-center gap-2 border border-ink/15 rounded-xl bg-sand/20 px-3 py-1.5 focus-within:border-copper focus-within:bg-white focus-within:ring-2 focus-within:ring-copper/10 transition-all"
          >
            <Tag size={15} className="text-ink/40 flex-shrink-0" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="w-full bg-transparent text-xs sm:text-sm font-mono uppercase text-ink outline-none placeholder:text-ink/40 placeholder:font-sans font-bold"
            />
            <button
              type="submit"
              disabled={!manualCode.trim() || applyingCode === manualCode}
              className="text-xs font-black uppercase text-copper hover:text-copper-dark disabled:opacity-30 px-2 py-1 transition-opacity tracking-wider cursor-pointer"
            >
              {applyingCode === manualCode ? "…" : "Apply"}
            </button>
          </form>
        </div>

        {/* Available Coupons List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3.5 flex-1">
          <div className="flex items-center justify-between pb-1 px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink/45">
              Available Offers ({coupons.length})
            </span>
            <span className="text-[11px] text-ink/40">1 coupon per order</span>
          </div>

          {coupons.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-ink/5 space-y-2">
              <div className="w-12 h-12 rounded-full bg-sand/50 text-ink/30 mx-auto flex items-center justify-center">
                <Tag size={20} />
              </div>
              <p className="text-sm font-bold text-ink">No coupons available right now</p>
              <p className="text-xs text-ink/50 max-w-xs mx-auto">
                Keep an eye out for our upcoming festive sales and promotional events.
              </p>
            </div>
          ) : (
            coupons.map((c) => {
              const isApplied = appliedCouponCode?.toUpperCase() === c.code.toUpperCase();
              const minSpend = c.minimumOrderValue || 0;
              const isEligible = subtotal >= minSpend;
              const diff = minSpend - subtotal;
              const savings = calculateSavings(c);

              const offerTitle =
                c.discountType === "PERCENTAGE"
                  ? `Save ${c.discountValue}% ${c.maximumDiscount ? `(up to ${formatINR(c.maximumDiscount)})` : ""}`
                  : `Save ${formatINR(c.discountValue)}`;

              return (
                <div
                  key={c._id || c.code}
                  className={`relative rounded-2xl bg-white border transition-all duration-200 shadow-2xs overflow-hidden ${
                    isApplied
                      ? "border-emerald-500 ring-2 ring-emerald-500/15"
                      : isEligible
                      ? "border-ink/10 hover:border-copper/40 hover:shadow-sm"
                      : "border-ink/5 opacity-70 bg-white/60"
                  }`}
                >
                  {/* Voucher Card Header */}
                  <div className="p-4 sm:p-4.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      {/* Code Badge */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-ink bg-sand/60 border border-dashed border-ink/25 px-2.5 py-1 rounded-md tracking-wider">
                          {c.code}
                        </span>
                        <button
                          onClick={(e) => handleCopy(c.code, e)}
                          className="text-ink/40 hover:text-copper transition-colors p-1"
                          title="Copy Code"
                        >
                          {copiedCode === c.code ? (
                            <CheckCircle2 size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>

                      {/* Apply / Remove Button */}
                      <div>
                        {isApplied ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Applied
                            </span>
                            <button
                              onClick={() => {
                                if (onRemoveCoupon) onRemoveCoupon();
                              }}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(c.code)}
                            disabled={!isEligible || applyingCode === c.code}
                            className={`text-xs font-black uppercase tracking-wider transition-colors ${
                              isEligible
                                ? "text-copper hover:text-copper-dark hover:underline cursor-pointer"
                                : "text-ink/30 cursor-not-allowed"
                            }`}
                          >
                            {applyingCode === c.code ? "Applying…" : "Apply"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Headline */}
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-ink">{offerTitle}</h4>
                      <p className="text-xs text-ink/60 leading-relaxed">
                        {c.description ||
                          (minSpend > 0
                            ? `Use code ${c.code} on orders above ${formatINR(minSpend)}`
                            : `Use code ${c.code} for instant checkout discount`)}
                      </p>
                    </div>
                  </div>

                  {/* Perforated Divider / Bottom Status Bar */}
                  <div
                    className={`px-4 py-2 border-t text-[11px] flex items-center justify-between ${
                      isApplied
                        ? "bg-emerald-50/60 border-emerald-100 text-emerald-800 font-bold"
                        : isEligible
                        ? "bg-sand/20 border-ink/5 text-forest font-bold"
                        : "bg-sand/10 border-ink/5 text-ink/50"
                    }`}
                  >
                    {isApplied ? (
                      <span className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-700" />
                        <span>You are saving {formatINR(savings)} on this order</span>
                      </span>
                    ) : isEligible ? (
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <Sparkles size={12} className="text-gold" />
                        <span>Saves {formatINR(savings)} with your current cart</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                        <Lock size={12} className="text-amber-700" />
                        <span>Add items worth {formatINR(diff)} more to unlock</span>
                      </span>
                    )}

                    {c.validUntil && (
                      <span className="text-[10px] text-ink/40 font-normal">
                        Valid till {new Date(c.validUntil).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clean Done Footer */}
        <div className="bg-white border-t border-ink/5 px-6 py-3.5 flex items-center justify-between">
          <span className="text-xs text-ink/50 font-medium">
            {appliedCouponCode ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check size={12} /> Coupon {appliedCouponCode} is active
              </span>
            ) : (
              "Select an eligible coupon above"
            )}
          </span>
          <button
            onClick={onClose}
            className="btn-copper text-xs py-2 px-5 font-bold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
