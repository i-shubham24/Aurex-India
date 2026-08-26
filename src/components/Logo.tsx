import { Link } from "react-router-dom";

/**
 * Wordmark logo. Placeholder until the client sends the real Aurex logo —
 * drop the SVG/PNG here and this component swaps out cleanly.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Aurex India — home"
    >
      <img src="/brand/logo.png" alt="Aurex India" className="h-6 w-auto object-contain sm:h-7" />
    </Link>
  );
}
