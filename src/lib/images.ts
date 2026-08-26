/**
 * Placeholder imagery helper.
 *
 * Uses loremflickr, which serves real, royalty-free, keyword-matched photos
 * that always load (verified 200 image/jpeg). A stable `lock` pins the same
 * photo across reloads so the layout doesn't flicker.
 *
 * These are stand-ins for cookware product shots until the client sends real
 * photography. To switch to real assets later, replace the URLs in
 * src/data/catalog.ts (or point stockImg at your CDN) — nothing else changes.
 */
export function stockImg(keywords: string, lock: number, w = 800, h = 800): string {
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keywords)}?lock=${lock}`;
}
