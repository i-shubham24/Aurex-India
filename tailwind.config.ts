import type { Config } from "tailwindcss";

/**
 * Brand tokens are placeholders tuned to Aurex's premium-cookware feel
 * (warm cream ground, charcoal ink, copper accent). Swap the hex values
 * here once the client sends the exact brand palette — nothing else changes.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6EF",
        sand: "#EFE7DA",
        ink: "#1C1B19",
        charcoal: "#2A2825",
        copper: {
          DEFAULT: "#B06E3F",
          dark: "#8A5330",
          light: "#C98A5B",
        },
        forest: "#2F4A3E",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,27,25,0.06), 0 8px 24px -12px rgba(28,27,25,0.18)",
        lift: "0 12px 40px -16px rgba(28,27,25,0.35)",
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
