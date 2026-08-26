import { useState } from "react";

/**
 * Product image with a guaranteed on-brand fallback. If the source fails to
 * load (flaky stock host, offline, etc.) it swaps to an inline SVG placeholder
 * so a card NEVER shows a broken image. Swap `src` for real product photos
 * later — nothing else changes.
 */

// Inline, zero-network placeholder: soft blue gradient + a simple pan glyph.
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#EAF0FC'/>
          <stop offset='1' stop-color='#D7E3FA'/>
        </linearGradient>
      </defs>
      <rect width='400' height='400' fill='url(#g)'/>
      <g fill='none' stroke='#1E50C8' stroke-opacity='0.5' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'>
        <circle cx='196' cy='214' r='70'/>
        <line x1='266' y1='188' x2='340' y2='170'/>
        <circle cx='196' cy='214' r='30' stroke-opacity='0.25'/>
      </g>
      <text x='200' y='340' font-family='Inter,system-ui,sans-serif' font-size='22' font-weight='600' fill='#1E50C8' fill-opacity='0.55' text-anchor='middle'>Aurex Cookware</text>
    </svg>`
  );

interface Props {
  src?: string;
  alt: string;
  className?: string;
}

export default function ProductImage({ src, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? FALLBACK : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
