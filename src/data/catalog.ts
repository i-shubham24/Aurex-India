import type { Category, Product, Review } from "@/services/types";

/**
 * Real Aurex catalog, imported from the live site's public WooCommerce Store
 * API (https://aurexindia.com/wp-json/wc/store/products). 15 products across
 * 4 categories. Product photos were downloaded into /public/products so the
 * site is self-contained. Regenerate with scratchpad/gen-catalog.mjs.
 */

export const categories: Category[] = [
    {
      "id": "cat-triply",
      "slug": "triply",
      "name": "Triply",
      "description": "Three-layer stainless steel with an aluminium core for fast, even, induction-ready heat.",
      "image": "/products/wc-653-0.webp"
    },
    {
      "id": "cat-cast-iron",
      "slug": "cast-iron",
      "name": "Cast Iron",
      "description": "Pre-seasoned, toxin-free cast iron — naturally non-stick and built to last a lifetime.",
      "image": "/products/663-0.png"
    },
    {
      "id": "cat-kadhai",
      "slug": "kadhai",
      "name": "Kadhai",
      "description": "Deep, sturdy kadhais for everything from sabzi to festive frying.",
      "image": "/products/wc-981-0.webp"
    },
    {
      "id": "cat-honeycomb",
      "slug": "honeycomb",
      "name": "Honeycomb",
      "description": "Honeycomb-textured triply for a durable, low-stick everyday surface.",
      "image": "/products/wc-655-0.webp"
    }
  ];

export const products: Product[] = [];

export const reviews: Record<string, Review[]> = {};
