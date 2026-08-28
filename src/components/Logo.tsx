import { Link } from "react-router-dom";

/**
 * Wordmark logo with support for light mode / dark background inversion.
 */
export default function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Aurex India — home"
    >
      <img
        src="/brand/logo.png"
        alt="Aurex India"
        className={`h-6 w-auto object-contain sm:h-7 ${light ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
