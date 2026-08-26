import type { Category, Product, Review } from "@/services/types";
import { stockImg } from "@/lib/images";

/**
 * In-repo catalog used by the mock adapter. Modeled on the real aurexindia.com
 * categories and product mix. Replace with the WooCommerce export once the
 * client provides REST API keys — shapes already match src/services/types.ts.
 *
 * Every image uses a unique keyword + lock (no repeats) via loremflickr, which
 * serves real royalty-free cookware photos. Swap for real product photography
 * when it arrives — see src/lib/images.ts.
 */

export const categories: Category[] = [
  {
    id: "cat-triply",
    slug: "triply-cookware",
    name: "Triply Cookware",
    description:
      "Three-layer stainless steel with an aluminium core for fast, even heat. Induction-ready and built to last.",
    image: stockImg("stainless-steel-cookware", 1001, 1200, 900),
  },
  {
    id: "cat-cast-iron",
    slug: "cast-iron",
    name: "Cast Iron",
    description:
      "Toxin-free, naturally non-stick with seasoning, and backed by a lifetime warranty.",
    image: stockImg("cast-iron-skillet", 1002, 1200, 900),
  },
  {
    id: "cat-kadais",
    slug: "kadais",
    name: "Kadais",
    description: "Deep, sturdy kadais for everything from sabzi to festive frying.",
    image: stockImg("wok-pan", 1003, 1200, 900),
  },
  {
    id: "cat-tawas",
    slug: "tawas",
    name: "Tawas",
    description: "Flat and concave tawas for rotis, dosas and parathas.",
    image: stockImg("griddle-pan", 1004, 1200, 900),
  },
  {
    id: "cat-fry-pans",
    slug: "fry-pans",
    name: "Fry Pans",
    description: "Everyday fry pans that heat evenly and clean up easily.",
    image: stockImg("frying-pan", 1005, 1200, 900),
  },
  {
    id: "cat-combos",
    slug: "combos-and-sets",
    name: "Combos & Sets",
    description: "Curated cookware sets — better value, one cohesive kitchen.",
    image: stockImg("cookware-set", 1006, 1200, 900),
  },
];

export const products: Product[] = [
  {
    id: "p-triply-kadai-24",
    slug: "triply-kadai-with-lid-24cm",
    name: "Triply Stainless Steel Kadai with Lid, 24 cm",
    categorySlug: "triply-cookware",
    price: 2699,
    compareAtPrice: 3199,
    currency: "INR",
    images: [stockImg("stainless-steel-wok", 2001), stockImg("cooking-pot", 2002)],
    shortDescription:
      "Everyday deep kadai in triply steel — even heat, no hot spots, induction-ready.",
    description:
      "Our triply kadai bonds two layers of food-grade stainless steel around an aluminium core, so heat spreads fast and evenly across the base and up the walls. Ideal for sabzi, curries and deep frying. Compatible with gas and induction. Comes with a matching stainless steel lid.",
    features: [
      "3-layer construction with aluminium core",
      "Induction and gas compatible",
      "Riveted stay-cool handles",
      "Dishwasher safe",
    ],
    material: "Triply Stainless Steel",
    variants: [
      { id: "v-22", name: "22 cm", priceDelta: -300, stock: 24 },
      { id: "v-24", name: "24 cm", stock: 40 },
      { id: "v-26", name: "26 cm", priceDelta: 400, stock: 18 },
    ],
    rating: 4.7,
    reviewCount: 128,
    stock: 82,
    badges: ["Bestseller"],
    isFeatured: true,
  },
  {
    id: "p-triply-frypan-24",
    slug: "triply-fry-pan-24cm",
    name: "Triply Stainless Steel Fry Pan, 24 cm",
    categorySlug: "triply-cookware",
    price: 2299,
    compareAtPrice: 2599,
    currency: "INR",
    images: [stockImg("stainless-steel-frying-pan", 2003), stockImg("skillet", 2004)],
    shortDescription: "A pan that sears, sautés and finishes sauces beautifully.",
    description:
      "The triply fry pan gives you restaurant-grade control. The aluminium core reaches temperature quickly and holds it, while the steel surface develops a natural sear. Flared walls make tossing effortless.",
    features: [
      "Even heat for a consistent sear",
      "Induction and gas compatible",
      "Flared walls for easy tossing",
      "Oven safe to 240°C",
    ],
    material: "Triply Stainless Steel",
    variants: [
      { id: "v-22", name: "22 cm", priceDelta: -300, stock: 30 },
      { id: "v-24", name: "24 cm", stock: 44 },
      { id: "v-28", name: "28 cm", priceDelta: 500, stock: 12 },
    ],
    rating: 4.6,
    reviewCount: 96,
    stock: 86,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "p-castiron-dosa-tawa",
    slug: "cast-iron-dosa-tawa-27cm",
    name: "Pre-Seasoned Cast Iron Dosa Tawa, 27 cm",
    categorySlug: "cast-iron",
    price: 1499,
    compareAtPrice: 1799,
    currency: "INR",
    images: [stockImg("cast-iron-griddle", 2005), stockImg("cast-iron-pan", 2006)],
    shortDescription: "Crisp, even dosas on naturally non-stick, toxin-free cast iron.",
    description:
      "Hand-cast and pre-seasoned, this dosa tawa builds a naturally non-stick surface with use and adds dietary iron to your cooking. Superb heat retention gives you evenly crisp dosas and uttapams. Backed by a lifetime warranty.",
    features: [
      "Pre-seasoned, ready to use",
      "Naturally non-stick with seasoning",
      "Toxin-free, no coatings",
      "Lifetime warranty",
    ],
    material: "Cast Iron",
    variants: [
      { id: "v-25", name: "25 cm", priceDelta: -200, stock: 20 },
      { id: "v-27", name: "27 cm", stock: 35 },
      { id: "v-30", name: "30 cm", priceDelta: 300, stock: 15 },
    ],
    rating: 4.8,
    reviewCount: 210,
    stock: 70,
    badges: ["Lifetime Warranty"],
    isFeatured: true,
  },
  {
    id: "p-castiron-kadai",
    slug: "cast-iron-kadai-with-handles",
    name: "Pre-Seasoned Cast Iron Kadai with Handles",
    categorySlug: "cast-iron",
    price: 1899,
    currency: "INR",
    images: [stockImg("cast-iron-wok", 2007), stockImg("cast-iron-pot", 2008)],
    shortDescription: "Deep cast iron kadai for deep-frying and slow-cooked gravies.",
    description:
      "A heavyweight cast iron kadai that holds heat for perfect deep-frying and rich, slow-cooked curries. Dual side handles for a secure grip. Seasons darker and smoother with every use.",
    features: [
      "Excellent heat retention",
      "Dual riveted side handles",
      "Toxin-free, no coatings",
      "Lifetime warranty",
    ],
    material: "Cast Iron",
    variants: [
      { id: "v-24", name: "24 cm", stock: 22 },
      { id: "v-26", name: "26 cm", priceDelta: 300, stock: 14 },
    ],
    rating: 4.7,
    reviewCount: 84,
    stock: 36,
    isNew: true,
  },
  {
    id: "p-triply-tawa",
    slug: "triply-flat-tawa-28cm",
    name: "Triply Stainless Steel Flat Tawa, 28 cm",
    categorySlug: "tawas",
    price: 1999,
    compareAtPrice: 2299,
    currency: "INR",
    images: [stockImg("flat-griddle", 2009), stockImg("crepe-pan", 2010)],
    shortDescription: "Flat triply tawa for rotis and parathas with no warping.",
    description:
      "Engineered to stay flat under high heat, this triply tawa cooks rotis and parathas evenly without hot spots. The steel surface releases cleanly and wipes down in seconds.",
    features: [
      "Warp-resistant triply base",
      "Even browning, no hot spots",
      "Induction and gas compatible",
      "Easy to clean",
    ],
    material: "Triply Stainless Steel",
    variants: [
      { id: "v-26", name: "26 cm", priceDelta: -200, stock: 26 },
      { id: "v-28", name: "28 cm", stock: 33 },
    ],
    rating: 4.5,
    reviewCount: 57,
    stock: 59,
  },
  {
    id: "p-triply-saucepan",
    slug: "triply-saucepan-2l",
    name: "Triply Stainless Steel Saucepan, 2 L",
    categorySlug: "triply-cookware",
    price: 2099,
    currency: "INR",
    images: [stockImg("saucepan", 2011), stockImg("stainless-steel-pot", 2012)],
    shortDescription: "For milk, dals and sauces — even heat, no scorching.",
    description:
      "A dependable triply saucepan for boiling milk, tempering dals and reducing sauces without scorching. The bonded base spreads heat evenly right to the edges.",
    features: [
      "Scorch-resistant even heating",
      "Induction and gas compatible",
      "Pour-friendly rim",
      "Dishwasher safe",
    ],
    material: "Triply Stainless Steel",
    variants: [
      { id: "v-1-5", name: "1.5 L", priceDelta: -250, stock: 28 },
      { id: "v-2", name: "2 L", stock: 31 },
    ],
    rating: 4.6,
    reviewCount: 44,
    stock: 59,
  },
  {
    id: "p-frypan-nonstick",
    slug: "triply-nonstick-fry-pan-26cm",
    name: "Triply Fry Pan with Ceramic Non-Stick, 26 cm",
    categorySlug: "fry-pans",
    price: 2499,
    compareAtPrice: 2899,
    currency: "INR",
    images: [stockImg("nonstick-frying-pan", 2013), stockImg("omelette-pan", 2014)],
    shortDescription: "Triply body, PFOA-free ceramic surface for low-oil cooking.",
    description:
      "The best of both worlds: a triply body for even heat and a PFOA-free ceramic non-stick surface for eggs, dosas and low-oil cooking. Metal-spatula friendly reinforced coating.",
    features: [
      "PFOA-free ceramic non-stick",
      "Triply base for even heat",
      "Low-oil cooking",
      "Induction and gas compatible",
    ],
    material: "Triply Stainless Steel + Ceramic",
    variants: [
      { id: "v-24", name: "24 cm", priceDelta: -300, stock: 17 },
      { id: "v-26", name: "26 cm", stock: 25 },
    ],
    rating: 4.4,
    reviewCount: 38,
    stock: 42,
    isNew: true,
  },
  {
    id: "p-combo-starter",
    slug: "triply-starter-combo-3pc",
    name: "Triply Starter Combo — Kadai + Fry Pan + Tawa",
    categorySlug: "combos-and-sets",
    price: 5999,
    compareAtPrice: 7197,
    currency: "INR",
    images: [stockImg("pots-and-pans-set", 2015), stockImg("kitchen-cookware", 2016)],
    shortDescription: "Three essentials, one set — everything a new kitchen needs.",
    description:
      "A curated triply set: a 24 cm kadai with lid, a 24 cm fry pan and a 28 cm flat tawa. The fastest way to a complete, induction-ready kitchen — at a set price that saves you over ₹1,000.",
    features: [
      "3 triply essentials in one box",
      "Induction and gas compatible",
      "Saves over ₹1,000 vs. buying separately",
      "Ideal gifting set",
    ],
    material: "Triply Stainless Steel",
    variants: [{ id: "v-set", name: "3-piece set", stock: 20 }],
    rating: 4.9,
    reviewCount: 63,
    stock: 20,
    badges: ["Best Value"],
    isFeatured: true,
  },
];

export const reviews: Record<string, Review[]> = {
  "p-triply-kadai-24": [
    {
      id: "r1",
      author: "Anjali M.",
      rating: 5,
      title: "Heats so evenly",
      body: "No more burnt spots at the centre. Feels premium and heavy. Worth every rupee.",
      verified: true,
      createdAt: "2026-06-14",
    },
    {
      id: "r2",
      author: "Rahul S.",
      rating: 4,
      title: "Great, slightly heavy",
      body: "Excellent build. A touch heavy but that's the triply quality. Induction works perfectly.",
      verified: true,
      createdAt: "2026-05-30",
    },
  ],
  "p-castiron-dosa-tawa": [
    {
      id: "r3",
      author: "Lakshmi R.",
      rating: 5,
      title: "Crispiest dosas",
      body: "Seasoned it a bit more at home and now dosas slide right off. Fantastic.",
      verified: true,
      createdAt: "2026-07-02",
    },
  ],
};
