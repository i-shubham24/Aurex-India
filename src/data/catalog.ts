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

export const products: Product[] = [
    {
      "id": "wc-981",
      "slug": "triply-stainless-steel-deep-kadhai-22cm",
      "name": "Triply Stainless Steel Deep Kadhai – 22cm",
      "categorySlug": "kadhai",
      "price": 499,
      "compareAtPrice": 599,
      "currency": "INR",
      "images": [
        "/products/wc-981-0.webp",
        "/products/wc-981-1.webp",
        "/products/wc-981-2.webp",
        "/products/wc-981-3.webp",
        "/products/wc-981-4.webp"
      ],
      "shortDescription": "Aurex Triply Stainless Steel Deep Kadai/ Kadai with Steel Lid/ 22cm/ 2.9ltr Deep/ 1.6Kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean,…",
      "description": "Aurex Triply Stainless Steel Deep Kadai/ Kadai with Steel Lid/ 22cm/ 2.9ltr Deep/ 1.6Kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material – Made with triply stainless steel Triply Construction – Three layer construction with stainless steel on the inside and the outside. Its durable, rust-free, hygienic, and non reactive. Size Options – 22cm, 24cm Colour – Silver Dimensions Package Length (cm) – 29.5 Width (cm) – 32.5 Height (cm) – 12 Product Length (cm) – 35.5 Width (cm) – 28 Height (cm) – 10 Weight (kg) – 1.680 Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Perfect for deep-frying, curries, slow cookings and stir-fries. Cleaning Process – Its smooth surface makes it easy to clean and dishwasher safe. Durability – Triply’s rust-free and damage resistant features makes it highly durable. Consumes Less Oil – Triply products are designed to consume less oil, promoting healthy cooking, yet deep walls allow efficient, even deep frying.",
      "features": [
        "Material: Made with triply stainless steel",
        "Triply Construction: Three layer construction with",
        "Size Options: 22cm, 24cm",
        "Colour: Silver",
        "Length (cm): 29.5"
      ],
      "material": "Triply Stainless Steel",
      "variants": [],
      "rating": 4.7,
      "reviewCount": 70,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": false
    },
    {
      "id": "wc-663",
      "slug": "cast-iron-deep-kadhai-with-glass-lid",
      "name": "Cast Iron Deep Kadai with Glass Lid",
      "categorySlug": "cast-iron",
      "price": 499,
      "compareAtPrice": 599,
      "currency": "INR",
      "images": [
        "/products/663-0.png"
      ],
      "shortDescription": "Aurex Cast Iron Deep Kadai with toughened Glass Lid/ 26cm/ 4.6ltr/ Pre-Seasoned/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish,…",
      "description": "Aurex Cast Iron Deep Kadai with toughened Glass Lid/ 26cm/ 4.6ltr/ Pre-Seasoned/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less Oil, Healthy Cooking Material -Made with cast iron Cast Iron Construction – Cast Iron is mostly made from Iron and few percentage of carbon, silicon and other chemical elements. Built for exceptional heat retention and lifelong durability. Colour – Black Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Ideal for versatile and everyday cooking, such as all kinds of Indian flat breads ( roti, paratha, naan etc). Cleaning Process – Cast Iron can be easily cleaned with just warm water and a soft scrubber. Make sure not use the dishwasher for cleaning cast iron. Durability – Cast Iron is known to last for decades and even generations if properly maintained. Consumes Less Oil – Cast Iron products are designed to consume less oil, promoting healthy cooking without compromising on the taste.",
      "features": [
        "Material: Made with cast iron",
        "Cast Iron Construction: Cast Iron is mostly made from Iron and few",
        "Colour: Black",
        "Compatibly: Compatible for induction, gas Stove, ceramic",
        "Usage: Ideal for versatile and everyday cooking, such as all kinds of"
      ],
      "material": "Cast Iron",
      "variants": [],
      "rating": 4.5,
      "reviewCount": 114,
      "stock": 40,
      "badges": [],
      "isFeatured": true,
      "isNew": false
    },
    {
      "id": "wc-662",
      "slug": "cast-iron-grill-pan",
      "name": "Cast Iron Grill Pan",
      "categorySlug": "cast-iron",
      "price": 799,
      "compareAtPrice": 899,
      "currency": "INR",
      "images": [
        "/products/662-0.png"
      ],
      "shortDescription": "Aurex Cast Iron Grill Pan/ 27cm/ Pre -Seasoned/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less…",
      "description": "Aurex Cast Iron Grill Pan/ 27cm/ Pre -Seasoned/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less Oil, Healthy Cooking Material -Made with cast iron Cast Iron Construction – Cast Iron is mostly made from Iron and few percentage of carbon, silicon and other chemical elements. Built for exceptional heat retention and lifelong durability. Colour – Black Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Ideal for versatile and everyday cooking, such as all kinds of Indian flat breads ( roti, paratha, naan etc). Cleaning Process – Cast Iron can be easily cleaned with just warm water and a soft scrubber. Make sure not use the dishwasher for cleaning cast iron. Durability – Cast Iron is known to last for decades and even generations if properly maintained. Consumes Less Oil – Cast Iron products are designed to consume less oil, promoting healthy cooking without compromising on the taste.",
      "features": [
        "Material: Made with cast iron",
        "Cast Iron Construction: Cast Iron is mostly made from Iron and few",
        "Colour: Black",
        "Compatibly: Compatible for induction, gas Stove, ceramic",
        "Usage: Ideal for versatile and everyday cooking, such as all kinds of"
      ],
      "material": "Cast Iron",
      "variants": [],
      "rating": 4.5,
      "reviewCount": 95,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": false
    },
    {
      "id": "wc-661",
      "slug": "cast-iron-skillet-frypan",
      "name": "Cast Iron Fry Pan/ Skillet",
      "categorySlug": "cast-iron",
      "price": 999,
      "compareAtPrice": 1199,
      "currency": "INR",
      "images": [
        "/products/wc-661-0.webp",
        "/products/wc-661-1.webp",
        "/products/wc-661-2.webp",
        "/products/wc-661-3.webp",
        "/products/wc-661-4.webp"
      ],
      "shortDescription": "Aurex Cast Iron Fry Pan/ Skillet/ 24cm/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less Oil,…",
      "description": "Aurex Cast Iron Fry Pan/ Skillet/ 24cm/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less Oil, Healthy Cooking Material -Made with cast iron Cast Iron Construction – Cast Iron is mostly made from Iron and few percentage of carbon, silicon and other chemical elements. Built for exceptional heat retention and lifelong durability. Colour – Black Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Ideal for versatile and everyday cooking, such as all kinds of Indian flat breads ( roti, paratha, naan etc). Cleaning Process – Cast Iron can be easily cleaned with just warm water and a soft scrubber. Make sure not use the dishwasher for cleaning cast iron. Durability – Cast Iron is known to last for decades and even generations if properly maintained. Consumes Less Oil – Cast Iron products are designed to consume less oil, promoting healthy cooking without compromising on the taste.",
      "features": [
        "Material: Made with cast iron",
        "Cast Iron Construction: Cast Iron is mostly made from Iron and few",
        "Colour: Black",
        "Compatibly: Compatible for induction, gas Stove, ceramic",
        "Usage: Ideal for versatile and everyday cooking, such as all kinds of"
      ],
      "material": "Cast Iron",
      "variants": [],
      "rating": 4.4,
      "reviewCount": 77,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": false
    },
    {
      "id": "wc-660",
      "slug": "cast-iron-appam-pan",
      "name": "Cast Iron Appam Pan",
      "categorySlug": "cast-iron",
      "price": 899,
      "compareAtPrice": 999,
      "currency": "INR",
      "images": [
        "/products/wc-660-0.webp",
        "/products/wc-660-1.webp",
        "/products/wc-660-2.webp",
        "/products/wc-660-3.webp",
        "/products/wc-660-4.webp"
      ],
      "shortDescription": "Aurex Cast Iron Fry Pan/ Skillet/ 24cm/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less Oil,…",
      "description": "Aurex Cast Iron Fry Pan/ Skillet/ 24cm/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less Oil, Healthy Cooking Material -Made with cast iron Cast Iron Construction – Cast Iron is mostly made from Iron and few percentage of carbon, silicon and other chemical elements. Built for exceptional heat retention and lifelong durability. Colour – Black Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Ideal for versatile and everyday cooking, such as crispy dosas, pancakes, Uttapams, and cheelas etc. Cleaning Process – Cast Iron can be easily cleaned with just warm water and a soft scrubber. Make sure not use the dishwasher for cleaning cast iron. Durability – Cast Iron is known to last for decades and even generations if properly maintained. Consumes Less Oil – Cast Iron products are designed to consume less oil, promoting healthy cooking without compromising on the taste.",
      "features": [
        "Material: Made with cast iron",
        "Cast Iron Construction: Cast Iron is mostly made from Iron and few",
        "Colour: Black",
        "Compatibly: Compatible for induction, gas Stove, ceramic",
        "Usage: Ideal for versatile and everyday cooking, such as crispy dosas,"
      ],
      "material": "Cast Iron",
      "variants": [],
      "rating": 4.4,
      "reviewCount": 59,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": true
    },
    {
      "id": "wc-659",
      "slug": "cast-iron-dosa-tawa",
      "name": "Cast Iron Dosa Tawa",
      "categorySlug": "cast-iron",
      "price": 599,
      "compareAtPrice": 699,
      "currency": "INR",
      "images": [
        "/products/wc-659-0.webp",
        "/products/wc-659-1.webp",
        "/products/wc-659-2.webp",
        "/products/wc-659-3.webp",
        "/products/wc-659-4.webp"
      ],
      "shortDescription": "Aurex Cast Iron Dosa Tawa 30cm/ 1kg/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less Oil, Healthy…",
      "description": "Aurex Cast Iron Dosa Tawa 30cm/ 1kg/ 100% Toxin Free, No Chemical Coating, Durable, Natural Stone Finish, Easy to Clean, Consumes Less Oil, Healthy Cooking Material -Made with cast iron Cast Iron Construction – Cast Iron is mostly made from Iron and few percentage of carbon, silicon and other chemical elements. Built for exceptional heat retention and lifelong durability. Colour – Black Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Ideal for versatile and everyday cooking, such as all kinds of Indian flat breads ( roti, paratha, naan etc). Cleaning Process – Cast Iron can be easily cleaned with just warm water and a soft scrubber. Make sure not use the dishwasher for cleaning cast iron. Durability – Cast Iron is known to last for decades and even generations if properly maintained. Consumes Less Oil – Cast Iron products are designed to consume less oil, promoting healthy cooking without compromising on the taste.",
      "features": [
        "Material: Made with cast iron",
        "Cast Iron Construction: Cast Iron is mostly made from Iron and few",
        "Colour: Black",
        "Compatibly: Compatible for induction, gas Stove, ceramic",
        "Usage: Ideal for versatile and everyday cooking, such as all kinds of"
      ],
      "material": "Cast Iron",
      "variants": [],
      "rating": 4.3,
      "reviewCount": 99,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": false
    },
    {
      "id": "wc-658",
      "slug": "cast-iron-concave-tawa-with-silicon-sleeve",
      "name": "Cast Iron Concave Tawa with Silicon Sleeve",
      "categorySlug": "cast-iron",
      "price": 499,
      "compareAtPrice": 599,
      "currency": "INR",
      "images": [
        "/products/wc-658-0.webp",
        "/products/wc-658-1.webp",
        "/products/wc-658-2.webp",
        "/products/wc-658-3.webp",
        "/products/wc-658-4.webp"
      ],
      "shortDescription": "Aurex Cast Iron Concave Tawa with Silicon Sleeve/ 26cm/ 1kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking…",
      "description": "Aurex Cast Iron Concave Tawa with Silicon Sleeve/ 26cm/ 1kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material -Made with cast iron Cast Iron Construction – Cast Iron is mostly made from Iron and few percentage of carbon, silicon and other chemical elements. Built for exceptional heat retention and lifelong durability. Colour – Black Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Ideal for versatile and everyday cooking, such as all kinds of Indian flat breads ( roti, paratha, naan etc). Cleaning Process – Cast Iron can be easily cleaned with just warm water and a soft scrubber. Make sure not use the dishwasher for cleaning cast iron. Durability – Cast Iron is known to last for decades and even generations if properly maintained. Consumes Less Oil – Cast Iron products are designed to consume less oil, promoting healthy cooking without compromising on the taste.",
      "features": [
        "Material: Made with cast iron",
        "Cast Iron Construction: Cast Iron is mostly made from Iron and few",
        "Colour: Black",
        "Compatibly: Compatible for induction, gas Stove, ceramic",
        "Usage: Ideal for versatile and everyday cooking, such as all kinds of"
      ],
      "material": "Cast Iron",
      "variants": [],
      "rating": 4.4,
      "reviewCount": 117,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": true
    },
    {
      "id": "wc-655",
      "slug": "honeycomb-triply-kadhai-26-cm",
      "name": "Honeycomb Triply Kadhai – 26 cm",
      "categorySlug": "honeycomb",
      "price": 399,
      "compareAtPrice": 499,
      "currency": "INR",
      "images": [
        "/products/wc-655-0.webp",
        "/products/wc-655-1.webp",
        "/products/wc-655-2.webp",
        "/products/wc-655-3.webp",
        "/products/wc-655-4.webp"
      ],
      "shortDescription": "Designed for larger meals, this honeycomb kadhai offers stability and surface protection. Textured surface for controlled cooking Consistent heating…",
      "description": "Designed for larger meals, this honeycomb kadhai offers stability and surface protection. Textured surface for controlled cooking Consistent heating throughout Suitable for frying and gravies Strong triply construction Induction compatible",
      "features": [
        "100% toxin-free",
        "No chemical coating",
        "Easy to clean"
      ],
      "material": "Honeycomb Triply",
      "variants": [],
      "rating": 4.5,
      "reviewCount": 319,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": true
    },
    {
      "id": "wc-653",
      "slug": "triply-plain-tawa",
      "name": "Triply Plain Tawa",
      "categorySlug": "triply",
      "price": 599,
      "compareAtPrice": 699,
      "currency": "INR",
      "images": [
        "/products/wc-653-0.webp",
        "/products/wc-653-1.webp",
        "/products/wc-653-2.webp",
        "/products/wc-653-3.webp",
        "/products/wc-653-4.webp"
      ],
      "shortDescription": "Aurex Triply Stainless Steel Tawa/ 26cm/ 1kg/ 4mm/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material –…",
      "description": "Aurex Triply Stainless Steel Tawa/ 26cm/ 1kg/ 4mm/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material – Made with triply stainless steel Triply Construction – Three layer construction with stainless steel on the inside and the outside. Its durable, rust-free, hygienic, and non reactive. Size Options – 22cm, 24cm Colour – Silver Dimensions Package Length (cm) -26.5 Width (cm) -44.5 Height (cm) – 9 Product Length (cm) -38 Height (cm) -8.5 Weight (kg) -2.32 Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Perfect for deep-frying, curries, slow cookings and stir-fries. Cleaning Process – Its smooth surface makes it easy to clean and dishwasher safe. Durability – Triply’s rust-free and damage resistant features makes it highly durable. Consumes Less Oil – Triply products are designed to consume less oil, promoting healthy cooking, yet deep walls allow efficient, even deep frying.",
      "features": [
        "Material: Made with triply stainless steel",
        "Triply Construction: Three layer construction with",
        "Size Options: 22cm, 24cm",
        "Colour: Silver",
        "Length (cm): 26.5"
      ],
      "material": "Triply Stainless Steel",
      "variants": [],
      "rating": 4.7,
      "reviewCount": 282,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": true
    },
    {
      "id": "wc-650",
      "slug": "triply-stainless-steel-frypan",
      "name": "Triply Stainless Steel Frypan",
      "categorySlug": "triply",
      "price": 599,
      "compareAtPrice": 699,
      "currency": "INR",
      "images": [
        "/products/wc-650-s0-0.webp",
        "/products/wc-650-s0-1.webp",
        "/products/wc-650-s0-2.webp",
        "/products/wc-650-s0-3.webp",
        "/products/wc-650-s0-4.webp"
      ],
      "shortDescription": "Aurex Triply Stainless Steel Fry Pan with Lid/ 22cm/ 1.23kg/2.5mm 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy…",
      "description": "Aurex Triply Stainless Steel Fry Pan with Lid/ 22cm/ 1.23kg/2.5mm 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material – Made with triply stainless steel Triply Construction – Three layer construction with stainless steel on the inside and the outside. Its durable, rust-free, hygienic, and non reactive. Size Options – 22cm, 24cm Colour – Silver Product Length (cm) -42 Height (cm) -7.6 Weight (kg) -1.2 Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Perfect for deep-frying, curries, slow cookings and stir-fries. Cleaning Process – Its smooth surface makes it easy to clean and dishwasher safe. Durability – Triply’s rust-free and damage resistant features makes it highly durable. Consumes Less Oil – Triply products are designed to consume less oil, promoting healthy cooking, yet deep walls allow efficient, even deep frying.",
      "features": [
        "Material: Made with triply stainless steel",
        "Triply Construction: Three layer construction with",
        "Size Options: 22cm, 24cm",
        "Colour: Silver",
        "Length (cm): -42"
      ],
      "material": "Triply Stainless Steel",
      "variants": [
        {
          "id": "v-0",
          "name": "22 cm",
          "priceDelta": 0,
          "stock": 25,
          "images": [
            "/products/wc-650-s0-0.webp",
            "/products/wc-650-s0-1.webp",
            "/products/wc-650-s0-2.webp",
            "/products/wc-650-s0-3.webp",
            "/products/wc-650-s0-4.webp"
          ]
        },
        {
          "id": "v-1",
          "name": "24 cm",
          "priceDelta": 0,
          "stock": 25,
          "images": [
            "/products/wc-650-s1-0.webp",
            "/products/wc-650-s1-1.webp",
            "/products/wc-650-s1-2.webp",
            "/products/wc-650-s1-3.webp",
            "/products/wc-650-s1-4.webp"
          ]
        }
      ],
      "rating": 4.7,
      "reviewCount": 264,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": false
    },
    {
      "id": "wc-649",
      "slug": "triply-cookware-set-4-piece",
      "name": "Triply Cookware Set – 4 Piece",
      "categorySlug": "triply",
      "price": 699,
      "compareAtPrice": 799,
      "currency": "INR",
      "images": [
        "/products/wc-649-0.webp",
        "/products/wc-649-1.webp",
        "/products/wc-649-2.webp",
        "/products/wc-649-3.webp",
        "/products/wc-649-4.webp"
      ],
      "shortDescription": "Aurex Triply Stainless Steel 4 Pc Cookware Set, Stainless Steel Kadai with Steel Lid/ 24cm/ 9.4 Iches/2.5ltr Deep/ 1.7Kg/ Stainless Steel Fry Pan…",
      "description": "Aurex Triply Stainless Steel 4 Pc Cookware Set, Stainless Steel Kadai with Steel Lid/ 24cm/ 9.4 Iches/2.5ltr Deep/ 1.7Kg/ Stainless Steel Fry Pan with Lid/ 22cm/ 1.23kg/2.5mm/ Stainless Steel Tea Pan/ 16cm/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material – Made with triply stainless steel Triply Construction – Three layer construction with stainless steel on the inside and the outside. Its durable, rust-free, hygienic, and non reactive. Size Options – 22cm, 24cm Colour – Silver Dimensions Package Length (cm) – 33 Width (cm) – 44 Height (cm) – 14.5 Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Perfect for deep-frying, curries, slow cookings and stir-fries. Cleaning Process – Its smooth surface makes it easy to clean and dishwasher safe. Durability – Triply’s rust-free and damage resistant features makes it highly durable. Consumes Less Oil – Triply products are designed to consume less oil, promoting healthy cooking, yet deep walls allow efficient, even deep frying.",
      "features": [
        "Material: Made with triply stainless steel",
        "Triply Construction: Three layer construction with",
        "Size Options: 22cm, 24cm",
        "Colour: Silver",
        "Length (cm): 33"
      ],
      "material": "Triply Stainless Steel",
      "variants": [],
      "rating": 4.7,
      "reviewCount": 281,
      "stock": 40,
      "badges": [],
      "isFeatured": true,
      "isNew": false
    },
    {
      "id": "wc-648",
      "slug": "triply-cookware-set-3-piece",
      "name": "Triply Cookware Set – 3 Piece",
      "categorySlug": "triply",
      "price": 699,
      "compareAtPrice": 799,
      "currency": "INR",
      "images": [
        "/products/wc-648-0.webp",
        "/products/wc-648-1.webp",
        "/products/wc-648-2.webp",
        "/products/wc-648-3.webp",
        "/products/wc-648-4.webp"
      ],
      "shortDescription": "Aurex Triply Stainless Steel 3 Pc Cookware Set, Stainless Steel Kadai with Steel Lid/ 24cm/ 9.4 Iches/2.5ltr Deep/ 1.7Kg/ Stainless Steel Fry Pan…",
      "description": "Aurex Triply Stainless Steel 3 Pc Cookware Set, Stainless Steel Kadai with Steel Lid/ 24cm/ 9.4 Iches/2.5ltr Deep/ 1.7Kg/ Stainless Steel Fry Pan with Lid/ 22cm/ 1.23kg/2.5mm/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material – Made with triply stainless steel Triply Construction – Three layer construction with stainless steel on the inside and the outside. Its durable, rust-free, hygienic, and non reactive. Size Options – 22cm, 24cm Colour – Silver Dimensions Package Length (cm) – 32 Width (cm) – 45 Height (cm) – 12 Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Perfect for deep-frying, curries, slow cookings and stir-fries. Cleaning Process – Its smooth surface makes it easy to clean and dishwasher safe. Durability – Triply’s rust-free and damage resistant features makes it highly durable. Consumes Less Oil – Triply products are designed to consume less oil, promoting healthy cooking, yet deep walls allow efficient, even deep frying.",
      "features": [
        "Material: Made with triply stainless steel",
        "Triply Construction: Three layer construction with",
        "Size Options: 22cm, 24cm",
        "Colour: Silver",
        "Length (cm): 32"
      ],
      "material": "Triply Stainless Steel",
      "variants": [],
      "rating": 4.7,
      "reviewCount": 263,
      "stock": 40,
      "badges": [],
      "isFeatured": true,
      "isNew": false
    },
    {
      "id": "wc-646",
      "slug": "triply-deep-kadhai",
      "name": "Triply Deep Kadhai",
      "categorySlug": "triply",
      "price": 599,
      "compareAtPrice": 699,
      "currency": "INR",
      "images": [
        "/products/wc-646-s0-0.webp",
        "/products/wc-646-s0-1.webp",
        "/products/wc-646-s0-2.webp",
        "/products/wc-646-s0-3.webp",
        "/products/wc-646-s0-4.webp"
      ],
      "shortDescription": "Aurex Triply Stainless Steel Deep Kadai/ Kadai with Steel Lid/ 24cm/ 3.3ltr Deep/ 1.78Kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean,…",
      "description": "Aurex Triply Stainless Steel Deep Kadai/ Kadai with Steel Lid/ 24cm/ 3.3ltr Deep/ 1.78Kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material – Made with triply stainless steel Triply Construction – Three layer construction with stainless steel on the inside and the outside. Its durable, rust-free, hygienic, and non reactive. Size Options – 22cm, 24cm Colour – Silver Dimensions Package Length (cm) – 29.5 Width (cm) – 35 Height (cm) – 11.5 Product Length (cm) – 37 Height (cm) – 11.5 Weight (kg) – 1.780 Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Perfect for deep-frying, curries, slow cookings and stir-fries. Cleaning Process – Its smooth surface makes it easy to clean and dishwasher safe. Durability – Triply’s rust-free and damage resistant features makes it highly durable. Consumes Less Oil – Triply products are designed to consume less oil, promoting healthy cooking, yet deep walls allow efficient, even deep frying.",
      "features": [
        "Material: Made with triply stainless steel",
        "Triply Construction: Three layer construction with",
        "Size Options: 22cm, 24cm",
        "Colour: Silver",
        "Length (cm): 29.5"
      ],
      "material": "Triply Stainless Steel",
      "variants": [
        {
          "id": "v-0",
          "name": "22 cm",
          "priceDelta": 0,
          "stock": 25,
          "images": [
            "/products/wc-646-s0-0.webp",
            "/products/wc-646-s0-1.webp",
            "/products/wc-646-s0-2.webp",
            "/products/wc-646-s0-3.webp",
            "/products/wc-646-s0-4.webp"
          ]
        },
        {
          "id": "v-1",
          "name": "24 cm",
          "priceDelta": 0,
          "stock": 25,
          "images": [
            "/products/wc-646-s1-0.webp",
            "/products/wc-646-s1-1.webp",
            "/products/wc-646-s1-2.webp",
            "/products/wc-646-s1-3.webp",
            "/products/wc-646-s1-4.webp"
          ]
        }
      ],
      "rating": 4.5,
      "reviewCount": 306,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": false
    },
    {
      "id": "wc-645",
      "slug": "triply-stainless-steel-kadhai-24-cm",
      "name": "Triply Stainless Steel Kadhai – 24 cm",
      "categorySlug": "triply",
      "price": 499,
      "compareAtPrice": 699,
      "currency": "INR",
      "images": [
        "/products/wc-645-0.webp",
        "/products/wc-645-1.webp",
        "/products/wc-645-2.webp",
        "/products/wc-645-3.webp",
        "/products/wc-645-4.webp"
      ],
      "shortDescription": "Aurex Triply Stainless Steel Kadai/ Kadai with Steel Lid/ 24cm/ 9.4 Iches/2.5ltr Deep/ 1.7Kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean,…",
      "description": "Aurex Triply Stainless Steel Kadai/ Kadai with Steel Lid/ 24cm/ 9.4 Iches/2.5ltr Deep/ 1.7Kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material – Made with Triply stainless Steel Triply Construction – Three layer construction with stainless steel on the inside and the outside. Its durable, rust-free, hygienic, and non reactive. Size Options – 24cm, 26cm Colour – Silver Dimensions Package Length (cm) – 29 Width (cm) – 33 Height (cm) – 10.5 Product Length (cm) – 38 Width (cm) – 8.5 Height (cm) – 2.32 Compatibly – Compatible for induction, gas Stove, ceramic and electric cooktops. Usage – Ideal for shallow frying, sauteing and everyday cooking. Cleaning Process – Its smooth surface makes it easy to clean and dishwasher safe. Durability – Triply’s rust-free and damage resistant features makes it highly durable. Consumes Less Oil – Triply products are designed to consume less oil, promoting healthy cooking without compromising on the taste.",
      "features": [
        "Material: Made with Triply stainless Steel",
        "Triply Construction: Three layer construction with stainless steel on the inside and the…",
        "Size Options: 24cm, 26cm",
        "Colour: Silver",
        "Length (cm): 29"
      ],
      "material": "Triply Stainless Steel",
      "variants": [],
      "rating": 4.6,
      "reviewCount": 61,
      "stock": 40,
      "badges": [],
      "isFeatured": true,
      "isNew": false
    },
    {
      "id": "wc-644",
      "slug": "triply-stainless-steel-kadhai-26-cm",
      "name": "Triply Stainless Steel Kadhai – 26 cm",
      "categorySlug": "triply",
      "price": 499,
      "compareAtPrice": 699,
      "currency": "INR",
      "images": [
        "/products/wc-644-0.webp",
        "/products/wc-644-1.webp",
        "/products/wc-644-2.webp",
        "/products/wc-644-3.webp",
        "/products/wc-644-4.webp"
      ],
      "shortDescription": "Aurex Triply Stainless Steel Kadai/ Kadai with Steel Lid/ 26cm/ 3.6ltr/ 1.96Kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less…",
      "description": "Aurex Triply Stainless Steel Kadai/ Kadai with Steel Lid/ 26cm/ 3.6ltr/ 1.96Kg/ 100% Toxin Free, No Chemical Coating, Easy to Clean, Consumes Less Oil, Healthy Cooking Material – Made with triply stainless steel Triply Construction – Three layer construction with stainless steel on the inside and the outside. Its durable, rust-free, hygienic, and non reactive. Size Options – 24cm, 26cm Colour – Silver Dimensions Package Length (cm) – 30 Width (cm) – 38.5 Height (cm) – 11 Product Length (cm) – 39.6 Width (cm) – 26.5 Height (cm) – 9.2 Weight (kg) – 1.960 Compatibly – Compatible for induction, gas stove, ceramic and electric cooktops. Usage – Ideal for shallow frying, sauteing and everyday cooking. Cleaning Process – Its smooth surface makes it easy to clean and dishwasher safe. Durability – Triply’s rust-free and damage resistant features makes it highly durable. Consumes Less Oil – Triply products are designed to consume less oil, promoting healthy cooking without compromising on the taste.",
      "features": [
        "Material: Made with triply stainless steel",
        "Triply Construction: Three layer construction with",
        "Size Options: 24cm, 26cm",
        "Colour: Silver",
        "Length (cm): 30"
      ],
      "material": "Triply Stainless Steel",
      "variants": [],
      "rating": 4.5,
      "reviewCount": 43,
      "stock": 40,
      "badges": [],
      "isFeatured": false,
      "isNew": false
    }
  ];

export const reviews: Record<string, Review[]> = {};
