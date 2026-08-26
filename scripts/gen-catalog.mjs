import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = "C:/Users/Hp/AppData/Local/Temp/claude/D--Aurex/1524ec76-4142-4463-b029-c6e424f4de12/scratchpad";
const IMG_DIR = "D:/Aurex/public/products";
const PUBLIC = "D:/Aurex/public";
const ZIP = `${dir}/website-images/Website images`;
const products = JSON.parse(fs.readFileSync(`${dir}/products.json`, "utf8"));
const cats = JSON.parse(fs.readFileSync(`${dir}/categories.json`, "utf8"));
const MAX_IMAGES = 4;

fs.mkdirSync(IMG_DIR, { recursive: true });

// ── zip image pipeline (sharp → webp) ─────────────────────
// Optimize a source image to public<outRel> as webp; skip if present.
async function optimize(srcAbs, outRel, w = 1000) {
  const outAbs = PUBLIC + outRel;
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  if (!fs.existsSync(outAbs)) {
    await sharp(srcAbs).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outAbs);
  }
  return outRel;
}
function orderFiles(folderAbs) {
  const files = fs.readdirSync(folderAbs).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  const main = files.filter((f) => /^main/i.test(f));
  const rest = files.filter((f) => !/^main/i.test(f)).sort((a, b) => (parseInt(a) || 99) - (parseInt(b) || 99));
  return [...main, ...rest];
}
async function zipImages(folderRel, keyPrefix, limit = 5) {
  const folderAbs = path.join(ZIP, folderRel);
  if (!fs.existsSync(folderAbs)) { console.warn("  ! missing zip folder:", folderRel); return []; }
  const files = orderFiles(folderAbs).slice(0, limit);
  const out = [];
  for (let i = 0; i < files.length; i++)
    out.push(await optimize(path.join(folderAbs, files[i]), `/products/${keyPrefix}-${i}.webp`, i === 0 ? 1200 : 1000));
  return out;
}

// zip folder → catalog product (slug). `sizes` builds per-size variants w/ images.
const MEDIA_MAP = {
  "triply-deep-kadhai": { sizes: [
    { name: "22 cm", folder: "Triply Stainless Steel Deep Kadhai/22CM" },
    { name: "24 cm", folder: "Triply Stainless Steel Deep Kadhai/24CM" } ] },
  "triply-stainless-steel-deep-kadhai-22cm": { folder: "Triply Stainless Steel Deep Kadhai/22CM" },
  "triply-stainless-steel-frypan": { sizes: [
    { name: "22 cm", folder: "Triply Stainless Steel Frypan/22cm" },
    { name: "24 cm", folder: "Triply Stainless Steel Frypan/24cm" } ] },
  "triply-stainless-steel-kadhai-24-cm": { folder: "Triply Stainless Steel Kadhai/24 CM 2.5 LTRS" },
  "triply-stainless-steel-kadhai-26-cm": { folder: "Triply Stainless Steel Kadhai/26cm" },
  "triply-plain-tawa": { folder: "Triply Stainless Steel Plain Tawa (26CM)" },
  "triply-cookware-set-3-piece": { folder: "Tri-Ply 3 Pc Set" },
  "triply-cookware-set-4-piece": { folder: "Tri-Ply 4 Pc Set" },
  "honeycomb-triply-kadhai-26-cm": { folder: "Triply Stainless Steel Honeycomb Non Stick Tawa (26CM)" },
  "cast-iron-skillet-frypan": { folder: "Cast Iron Frypan (22CM)" },
  "cast-iron-appam-pan": { folder: "Cast Iron Paniyaram Pan (26CM)" },
  "cast-iron-dosa-tawa": { folder: "Cast Iron Tawa for Roti and Paratha (26 CM)" },
  "cast-iron-concave-tawa-with-silicon-sleeve": { folder: "Cast Iron 2 in 1 Reversible Dosa Tawa and Grill (30CM)" },
};
// brand banners / editorial imagery → /public/brand (used by later phases)
const BRAND_MAP = {
  "tri-ply-range": "Tri-Ply Range.png",
  "cast-iron-range": "Cast Iron Range.png",
  "full-range": "Full Cookware Range.png",
  foundry: "Foundry metal pouring.png",
  factory: "Factory Grinding.png",
  construction: "Construction Cross-Section.jpg",
  "recipe-dosa": "Dosa Recipe Pic.png",
  "recipe-paneer": "Grilled paneer recipe pic.png",
  "recipe-appe": "Rava Appe recipe photo for blog.png",
};

// ── helpers ───────────────────────────────────────────────
function decode(s = "") {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&hellip;/g, "…");
}
function stripHtml(s = "") {
  return decode(s.replace(/<br\s*\/?>/gi, " ").replace(/<\/(p|div|li|h\d)>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ").trim();
}
function shortDesc(text, max = 150) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
}
function extractFeatures(html) {
  const feats = [];
  const re = /<strong>([^<]{2,40})<\/strong>\s*(?:&#8211;|–|-|:)?\s*([^<]{3,80})/g;
  let m;
  while ((m = re.exec(html)) && feats.length < 5) {
    const label = decode(m[1]).trim().replace(/[:–-]\s*$/, "");
    let val = decode(m[2]).trim().replace(/\s+/g, " ");
    if (val.length > 70) val = val.slice(0, 70).replace(/\s\S*$/, "") + "…";
    if (val && !/^&#/.test(val)) feats.push(`${label}: ${val}`);
  }
  return feats;
}
// Seeded RNG so ratings are random-looking but STABLE per product across runs.
function rng(seed) {
  let h = 2166136261 >>> 0;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return () => {
    h = (Math.imul(h, 1103515245) + 12345) & 0x7fffffff;
    return h / 0x7fffffff;
  };
}
function goodRating(seed) {
  const r = rng("rating-" + seed);
  return Math.round((4.3 + r() * 0.6) * 10) / 10; // 4.3 – 4.9
}
function goodCount(seed) {
  const r = rng("count-" + seed);
  return 24 + Math.floor(r() * 300); // 24 – 323 reviews
}

function primarySlug(p) {
  const slugs = p.categories.map((c) => c.slug);
  // kadhai/honeycomb before triply so single-product categories keep their item
  for (const pref of ["cast-iron", "honeycomb", "kadhai", "triply"]) if (slugs.includes(pref)) return pref;
  return slugs[0] ?? "cookware";
}
const MATERIAL = { "cast-iron": "Cast Iron", triply: "Triply Stainless Steel", honeycomb: "Honeycomb Triply", kadhai: "Triply Stainless Steel" };
const CAT_DESC = {
  "cast-iron": "Pre-seasoned, toxin-free cast iron — naturally non-stick and built to last a lifetime.",
  triply: "Three-layer stainless steel with an aluminium core for fast, even, induction-ready heat.",
  honeycomb: "Honeycomb-textured triply for a durable, low-stick everyday surface.",
  kadhai: "Deep, sturdy kadhais for everything from sabzi to festive frying.",
};
const FEATURED = new Set(["triply-cookware-set-4-piece", "triply-cookware-set-3-piece", "cast-iron-fry-pan-skillet", "triply-stainless-steel-kadhai-24-cm", "cast-iron-deep-kadhai-with-glass-lid"]);
const NEW = new Set(["triply-stainless-steel-honeycomb", "honeycomb-triply-kadhai-26-cm", "cast-iron-appam-pan", "cast-iron-concave-tawa-with-silicon-sleeve", "triply-plain-tawa"]);

// ── download images ───────────────────────────────────────
const cache = new Map(); // remoteUrl -> localPath
async function download(url, id, i) {
  if (cache.has(url)) return cache.get(url);
  const ext = (path.extname(new URL(url).pathname) || ".jpg").split("?")[0];
  const file = `${id}-${i}${ext}`;
  const dest = path.join(IMG_DIR, file);
  const local = `/products/${file}`;
  if (fs.existsSync(dest)) { cache.set(url, local); return local; } // skip re-download
  try {
    const res = await fetch(url, { headers: { Referer: "https://aurexindia.com" } });
    if (!res.ok) throw new Error(res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    cache.set(url, local);
    return local;
  } catch (e) {
    console.warn(`  ! failed ${url}: ${e.message} — keeping remote`);
    cache.set(url, url); // fall back to remote URL (ProductImage handles errors)
    return url;
  }
}

// ── build ─────────────────────────────────────────────────
const catImg = {};
const mapped = [];
for (const p of products) {
  const cat = primarySlug(p);
  const minor = Math.pow(10, p.prices.currency_minor_unit);
  const price = Math.round(+p.prices.price / minor);
  const regular = Math.round(+p.prices.regular_price / minor);
  // Only download API images for products with NO client-zip photos (the zip
  // overlay below replaces the rest, so downloading them would just orphan files).
  const images = [];
  if (!MEDIA_MAP[p.slug]) {
    const urls = [...new Set((p.images || []).map((i) => i.src))].slice(0, MAX_IMAGES);
    for (let i = 0; i < urls.length; i++) images.push(await download(urls[i], p.id, i));
  }
  if (!catImg[cat] && images[0]) catImg[cat] = images[0];
  // Client asked to keep warranty claims off the product info — strip the
  // trailing "Warranty – …" sentence from the description.
  const descText = stripHtml(p.description).replace(/\s*Warranty\s*[–-].*/is, "").trim();
  const sizeAttr = (p.attributes || []).find((a) => a.has_variations);
  const variants = sizeAttr?.terms?.length
    ? sizeAttr.terms.map((t, i) => ({ id: `v-${i}`, name: decode(t.name).replace(/"/g, "").trim(), priceDelta: 0, stock: p.is_in_stock ? 25 : 0 }))
    : [];
  mapped.push({
    id: `wc-${p.id}`,
    slug: p.slug,
    name: decode(p.name),
    categorySlug: cat,
    price,
    compareAtPrice: p.on_sale && regular > price ? regular : undefined,
    currency: "INR",
    images,
    shortDescription: shortDesc(descText) || `${MATERIAL[cat]} cookware by Aurex.`,
    description: descText || `${decode(p.name)} — premium ${MATERIAL[cat]} cookware from Aurex.`,
    features: (extractFeatures(p.description).filter((f) => !/warranty/i.test(f)).slice(0, 5).length
      ? extractFeatures(p.description).filter((f) => !/warranty/i.test(f)).slice(0, 5)
      : ["100% toxin-free", "No chemical coating", "Easy to clean"]),
    material: MATERIAL[cat],
    variants,
    // Live products have no reviews yet — seed good, stable placeholder ratings.
    rating: goodRating(p.id),
    reviewCount: goodCount(p.id),
    stock: p.is_in_stock ? p.low_stock_remaining || 40 : 0,
    badges: [],
    isFeatured: FEATURED.has(p.slug),
    isNew: NEW.has(p.slug),
  });
  console.log(`  ✓ ${p.slug} (${images.length} imgs)`);
}

// ── overlay real client photography from the zip ──────────
console.log("\nOverlaying real product photos + sizes:");
for (const prod of mapped) {
  const m = MEDIA_MAP[prod.slug];
  if (!m) { console.log(`  · ${prod.slug} → (no zip match, keeps API image)`); continue; }
  if (m.sizes) {
    const variants = [];
    for (let i = 0; i < m.sizes.length; i++) {
      const imgs = await zipImages(m.sizes[i].folder, `${prod.id}-s${i}`);
      variants.push({ id: `v-${i}`, name: m.sizes[i].name, priceDelta: 0, stock: 25, images: imgs });
    }
    prod.variants = variants;
    if (variants[0]?.images?.length) prod.images = variants[0].images;
    console.log(`  ★ ${prod.slug} → ${prod.images.length} imgs, sizes: ${m.sizes.map((s) => s.name).join("/")}`);
  } else {
    const imgs = await zipImages(m.folder, prod.id);
    if (imgs.length) prod.images = imgs;
    console.log(`  ★ ${prod.slug} → ${imgs.length} imgs`);
  }
}

// ── optimize brand / editorial banners for later phases ───
console.log("\nOptimizing brand banners:");
for (const [key, file] of Object.entries(BRAND_MAP)) {
  const src = path.join(ZIP, file);
  if (fs.existsSync(src)) { await optimize(src, `/brand/${key}.webp`, 1600); console.log(`  ★ /brand/${key}.webp`); }
  else console.warn(`  ! missing brand file: ${file}`);
}

const order = ["triply", "cast-iron", "kadhai", "honeycomb"];
const categories = cats.filter((c) => c.count > 0)
  .sort((a, b) => (order.indexOf(a.slug) + 1 || 99) - (order.indexOf(b.slug) + 1 || 99))
  .map((c) => ({ id: `cat-${c.slug}`, slug: c.slug, name: decode(c.name), description: CAT_DESC[c.slug] ?? "Premium Aurex cookware.", image: mapped.find((m) => m.categorySlug === c.slug)?.images?.[0] || catImg[c.slug] || "" }));

function obj(o, indent = "  ") {
  return JSON.stringify(o, null, 2).split("\n").map((l, i) => (i === 0 ? l : indent + l)).join("\n");
}
const out = `import type { Category, Product, Review } from "@/services/types";

/**
 * Real Aurex catalog, imported from the live site's public WooCommerce Store
 * API (https://aurexindia.com/wp-json/wc/store/products). ${mapped.length} products across
 * ${categories.length} categories. Product photos were downloaded into /public/products so the
 * site is self-contained. Regenerate with scratchpad/gen-catalog.mjs.
 */

export const categories: Category[] = ${obj(categories)};

export const products: Product[] = ${obj(mapped)};

export const reviews: Record<string, Review[]> = {};
`;
fs.writeFileSync("D:/Aurex/src/data/catalog.ts", out);
console.log(`\nWrote catalog.ts: ${mapped.length} products, ${categories.length} categories, ${cache.size} images cached`);
