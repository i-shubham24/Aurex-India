import type { Config } from "tailwindcss";

/**
 * Brand tokens — blue / yellow / white.
 *
 * A royal-blue family on a white ground, with a golden-yellow accent used for
 * hovers. Token NAMES are kept stable across the app (cream/sand/ink/charcoal/
 * copper/forest) and only their VALUES changed, so the whole UI recolours from
 * here. `copper` is the primary brand accent (now royal blue); `gold` is the
 * hover accent; `sky` is a lighter secondary blue. Swap hex values here once
 * the client sends the exact brand palette — nothing else changes.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F4F8FE", // cool near-white ground
        sand: "#E5EDFB", // soft blue section background
        ink: "#0F1E3D", // deep navy — primary text & dark surfaces
        charcoal: "#0B1A38", // deeper navy — footer
        // Primary brand accent (kept as `copper` for stable class names)
        copper: {
          DEFAULT: "#1E50C8", // royal blue
          dark: "#163FA0", // deeper royal blue
          light: "#5B86E5", // lighter royal blue
        },
        // Golden-yellow hover accent
        gold: {
          DEFAULT: "#F5B301",
          dark: "#DB9E00",
          light: "#FFCB3D",
        },
        // Secondary lighter blue (gradients / subtle accents)
        sky: "#3B82F6",
        forest: "#1F7A5A", // success / verified / delivered
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,30,61,0.06), 0 8px 24px -12px rgba(15,30,61,0.20)",
        lift: "0 12px 40px -16px rgba(15,30,61,0.38)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      maxWidth: {
        container: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
