/**
 * Product/category imagery.
 *
 * Reliable free cookware photography proved unavailable (keyword stock hosts
 *返回 unrelated shots — cats, food, foundries — and often fail to load), so
 * until the client supplies real product photography we render a clean,
 * on-brand SVG placeholder that ALWAYS loads (zero network) and looks
 * intentional. Each item gets a subtly different blue by its `lock` seed so a
 * grid doesn't look monotonous.
 *
 * To switch to real photos later: put the photo URLs in src/data/catalog.ts
 * (or return them from stockImg). ProductImage already falls back to this
 * placeholder if a real photo ever fails to load — see ProductImage.tsx.
 */

// Blue-family gradient pairs; picked by lock so items vary but stay on-brand.
const PAIRS: [string, string][] = [
  ["#EAF0FC", "#D3E0FA"],
  ["#E7F0FE", "#CFE0F8"],
  ["#EEF1FB", "#DCE6F7"],
  ["#E9EEFC", "#D2DDF6"],
  ["#F0F4FE", "#D8E6FB"],
  ["#E6EEFB", "#CBDAF3"],
];

export function stockImg(keywords: string, lock: number, w = 800, h = 800): string {
  void keywords;
  void w;
  void h;
  const [a, b] = PAIRS[Math.abs(lock) % PAIRS.length];
  const id = `g${Math.abs(lock)}`;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>` +
    `<defs><linearGradient id='${id}' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>` +
    `</linearGradient></defs>` +
    `<rect width='400' height='400' fill='url(#${id})'/>` +
    `<g fill='none' stroke='#1E50C8' stroke-opacity='0.45' stroke-width='9' stroke-linecap='round' stroke-linejoin='round'>` +
    `<circle cx='192' cy='210' r='72'/>` +
    `<line x1='264' y1='184' x2='342' y2='166'/>` +
    `<circle cx='192' cy='210' r='30' stroke-opacity='0.22'/>` +
    `</g>` +
    `<text x='200' y='336' font-family='Inter,system-ui,sans-serif' font-size='21' font-weight='600' fill='#1E50C8' fill-opacity='0.5' text-anchor='middle'>Aurex Cookware</text>` +
    `</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
