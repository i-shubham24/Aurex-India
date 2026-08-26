import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE, absoluteUrl } from "@/lib/seo";

/**
 * Dependency-free head manager. Sets document.title + meta tags per route
 * (description, canonical, Open Graph, Twitter) and optional JSON-LD.
 *
 * Note: this runs on the client. Googlebot renders JS and will see it, but
 * non-JS social scrapers only get index.html's static defaults. For full
 * coverage, add prerendering at build time (see README "SEO"). Structuring it
 * this way means the same tags work unchanged once prerendering is added.
 */
export interface SeoProps {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: object | object[];
  /** Override canonical path; defaults to current location. */
  canonicalPath?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const JSONLD_ID = "seo-jsonld";

export default function Seo({
  title,
  description = SITE.description,
  keywords,
  image = SITE.defaultImage,
  type = "website",
  noindex = false,
  jsonLd,
  canonicalPath,
}: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title.includes(SITE.name) ? title : `${title} · ${SITE.name}`;
    const canonical = absoluteUrl(canonicalPath ?? location.pathname);
    const img = absoluteUrl(image);

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    
    const kw = keywords?.join(", ") || SITE.keywords.join(", ");
    upsertMeta("name", "keywords", kw);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);

    // Open Graph
    upsertMeta("property", "og:site_name", SITE.name);
    upsertMeta("property", "og:type", type === "product" ? "product" : type);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", img);
    upsertMeta("property", "og:locale", SITE.locale);

    // Twitter
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:site", SITE.twitter);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", img);

    // JSON-LD structured data (replace the managed block each route)
    const existing = document.getElementById(JSONLD_ID);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = JSONLD_ID;
      // Escape "<" so untrusted catalog data can never break out of the
      // <script> tag (matters once this is prerendered/SSR'd to HTML).
      script.text = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
      document.head.appendChild(script);
    }
  }, [title, description, keywords, image, type, noindex, jsonLd, canonicalPath, location.pathname]);

  return null;
}
