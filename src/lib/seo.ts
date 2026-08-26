import type { Product } from "@/services/types";
import { stockImg } from "@/lib/images";

/**
 * Central SEO configuration. Set VITE_SITE_URL to the production origin at
 * build time (defaults to the live domain). Used for canonical URLs,
 * Open Graph and structured data.
 */
export const SITE = {
  name: "Aurex India",
  url: (import.meta.env.VITE_SITE_URL ?? "https://aurexindia.com").replace(/\/$/, ""),
  description:
    "Premium triply stainless steel and toxin-free cast iron cookware, built to last. Free shipping across India.",
  keywords: [
    "Aurex India",
    "premium cookware",
    "triply stainless steel",
    "cast iron cookware",
    "toxin-free pans",
    "healthy cooking",
    "Indian cookware brand",
    "non-stick alternatives",
    "kadhai",
    "tawa",
    "stainless steel set"
  ],
  defaultImage: stockImg("stainless-steel-cookware-set", 3001, 1200, 630),
  locale: "en_IN",
  twitter: "@aurexindia",
};

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Organization JSON-LD — include once, on the homepage. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/favicon.svg"),
    sameAs: [
      "https://www.instagram.com/aurex.india",
      "https://www.facebook.com/share/1B2XLaNTBc/",
      "https://youtube.com/@aurex_india",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-78144-77667",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => absoluteUrl(i)),
    description: product.shortDescription,
    sku: product.id,
    brand: { "@type": "Brand", name: SITE.name },
    material: product.material,
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${product.slug}`),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
