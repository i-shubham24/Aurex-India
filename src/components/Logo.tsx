import { Link } from "react-router-dom";

/**
 * Wordmark logo. Placeholder until the client sends the real Aurex logo —
 * drop the SVG/PNG here and this component swaps out cleanly.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-baseline gap-1 font-serif ${className}`}
      aria-label="Aurex India — home"
    >
      <span className="text-2xl font-semibold tracking-tight text-ink">Aurex</span>
      <span className="text-2xl font-semibold tracking-tight text-copper">.</span>
      <span className="ml-0.5 text-[0.65rem] font-sans font-semibold uppercase tracking-[0.2em] text-ink/50">
        India
      </span>
    </Link>
  );
}
