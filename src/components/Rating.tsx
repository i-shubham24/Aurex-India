import { Star } from "lucide-react";

export default function Rating({
  value,
  count,
  size = 14,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${value} out of 5 stars`}>
      <div className="flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-copper text-copper" : "fill-none text-ink/25"}
              strokeWidth={2}
            />
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-ink/55">
          {value.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
