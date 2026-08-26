import { useState } from "react";
import { formatINR } from "@/lib/format";

interface Range {
  label: string;
  min?: number;
  max?: number;
}

export default function PriceFilter({
  ranges,
  priceMin,
  priceMax,
  onApply,
}: {
  ranges: Range[];
  priceMin?: number;
  priceMax?: number;
  onApply: (min?: number, max?: number) => void;
}) {
  const [customMin, setCustomMin] = useState(priceMin?.toString() ?? "");
  const [customMax, setCustomMax] = useState(priceMax?.toString() ?? "");

  const isActive = (r: Range) => r.min === priceMin && r.max === priceMax;
  const anyActive = priceMin !== undefined || priceMax !== undefined;

  function applyCustom(e: React.FormEvent) {
    e.preventDefault();
    const min = customMin ? Number(customMin) : undefined;
    const max = customMax ? Number(customMax) : undefined;
    onApply(min, max);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Price</h3>
        {anyActive && (
          <button
            onClick={() => {
              setCustomMin("");
              setCustomMax("");
              onApply(undefined, undefined);
            }}
            className="text-xs font-medium text-copper hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {ranges.map((r) => (
          <button
            key={r.label}
            onClick={() => onApply(r.min, r.max)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              isActive(r)
                ? "bg-ink/[0.05] font-semibold text-copper"
                : "text-ink/75 hover:bg-ink/[0.04]"
            }`}
          >
            <span
              className={`grid h-4 w-4 place-items-center rounded-full border ${
                isActive(r) ? "border-copper" : "border-ink/25"
              }`}
            >
              {isActive(r) && <span className="h-2 w-2 rounded-full bg-copper" />}
            </span>
            {r.label}
          </button>
        ))}
      </div>

      {/* Custom range */}
      <form onSubmit={applyCustom} className="mt-3 border-t border-ink/10 pt-3">
        <p className="mb-2 text-xs text-ink/50">Custom range (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            placeholder="Min"
            className="input px-2 py-1.5 text-sm"
            aria-label="Minimum price"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={customMax}
            onChange={(e) => setCustomMax(e.target.value)}
            placeholder="Max"
            className="input px-2 py-1.5 text-sm"
            aria-label="Maximum price"
          />
        </div>
        <button type="submit" className="btn-outline mt-2 w-full py-1.5 text-sm">
          Apply
        </button>
      </form>

      {anyActive && (
        <p className="mt-2 text-xs text-ink/50">
          Showing{" "}
          {priceMin !== undefined ? formatINR(priceMin) : "₹0"}
          {" – "}
          {priceMax !== undefined ? formatINR(priceMax) : "any"}
        </p>
      )}
    </div>
  );
}
