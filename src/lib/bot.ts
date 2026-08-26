import { data } from "@/services";
import type { Product } from "@/services/types";
import { formatINR } from "@/lib/format";

/**
 * Aurea — Aurex's support assistant.
 *
 * Works with ZERO API keys: it retrieves from the live catalog + a small FAQ
 * knowledge base and composes grounded answers (prices/stock come from real
 * data, so it can't hallucinate them). When it can't help, it offers a
 * WhatsApp handoff to the human team.
 *
 * Upgrade path: set VITE_BOT_API_URL to a server endpoint that wraps Claude/
 * OpenAI with the same knowledge base, and route askBot() through it. The UI
 * (ChatWidget) never changes.
 */

export interface BotReply {
  text: string;
  products?: Product[];
  handoff?: boolean;
}

export interface BotContext {
  isLoggedIn: boolean;
}

const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917814477667";

export const FAQ: { q: string; keywords: string[]; a: string }[] = [
  {
    q: "Shipping",
    keywords: ["shipping", "ship", "delivery", "deliver", "courier", "dispatch", "how long"],
    a: "We offer free shipping across India on all orders. Most orders are dispatched within 24–48 hours and delivered in 3–7 business days depending on your pincode.",
  },
  {
    q: "Returns",
    keywords: ["return", "refund", "exchange", "replace", "money back"],
    a: "You can request a return within 7 days of delivery for unused items in original packaging. Once we receive and inspect the item, refunds are processed to your original payment method within 5–7 business days.",
  },
  {
    q: "Warranty",
    keywords: ["warranty", "guarantee", "lifetime", "damaged", "defect"],
    a: "Our cast iron cookware carries a lifetime warranty against manufacturing defects. Triply stainless steel is covered for 10 years. Keep your order ID handy and we'll take care of the rest.",
  },
  {
    q: "Cast iron care",
    keywords: ["season", "seasoning", "cast iron", "rust", "care", "maintain", "clean cast"],
    a: "For cast iron: wash with warm water (mild soap is fine), dry on low heat, then rub a thin layer of oil before storing. Avoid soaking. It gets more non-stick with every use.",
  },
  {
    q: "Triply care",
    keywords: ["triply", "stainless", "dishwasher", "clean", "care steel"],
    a: "Triply stainless steel is dishwasher safe and induction compatible. For stubborn marks, a little baking soda paste restores the shine. Avoid abrasive steel wool.",
  },
  {
    q: "Induction",
    keywords: ["induction", "gas", "stove", "compatible", "cooktop"],
    a: "All our triply cookware and most cast iron pieces are induction and gas compatible.",
  },
  {
    q: "Payment / order",
    keywords: ["payment", "pay", "cod", "cash on delivery", "checkout"],
    a: "We're upgrading our checkout right now. To place an order today, tap ‘Chat on WhatsApp’ and our team will confirm items, price and delivery for you.",
  },
];

function findFaq(text: string) {
  const t = text.toLowerCase();
  return FAQ.find((f) => f.keywords.some((k) => t.includes(k)));
}

function isGreeting(text: string) {
  return /\b(hi|hello|hey|namaste|hii|good (morning|evening|afternoon))\b/i.test(text);
}

function looksLikeRecommendation(text: string) {
  return /\b(recommend|suggest|which|best|looking for|need a|want a|buy|for (dosa|roti|frying|curry|paratha|deep fry))\b/i.test(
    text
  );
}

function looksLikeOrderStatus(text: string) {
  return /\b(order|track|where is|status|delivery status|my parcel|shipment)\b/i.test(text);
}

const whatsappLink = () =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Aurex, I need help with…")}`;

async function recommend(text: string): Promise<Product[]> {
  const all = await data.getProducts();
  const t = text.toLowerCase();
  const scored = all
    .map((p) => {
      let score = 0;
      const hay = `${p.name} ${p.shortDescription} ${p.material ?? ""} ${p.categorySlug}`.toLowerCase();
      for (const word of t.split(/\W+/).filter((w) => w.length > 2)) {
        if (hay.includes(word)) score += 1;
      }
      if (p.isFeatured) score += 0.5;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.p);
  return top.length ? top : all.filter((p) => p.isFeatured).slice(0, 3);
}

/**
 * The single entry point the ChatWidget calls. If VITE_BOT_API_URL is set, we
 * hand off to the server LLM; otherwise we answer locally.
 */
export async function askBot(message: string, ctx: BotContext): Promise<BotReply> {
  const apiUrl = import.meta.env.VITE_BOT_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context: ctx }),
      });
      if (res.ok) return (await res.json()) as BotReply;
    } catch {
      /* fall through to local */
    }
  }
  return localAnswer(message, ctx);
}

async function localAnswer(message: string, ctx: BotContext): Promise<BotReply> {
  const text = message.trim();

  if (isGreeting(text)) {
    return {
      text: "Namaste! 👋 I'm Aurea, your Aurex assistant. I can help with product picks, shipping, returns, warranty and cookware care. What are you cooking today?",
    };
  }

  if (looksLikeOrderStatus(text)) {
    if (!ctx.isLoggedIn) {
      return {
        text: "I can check your order status once you're signed in. Please log in to your account, then ask me again — or reach our team on WhatsApp with your order ID.",
        handoff: true,
      };
    }
    return {
      text: "You can see live status and tracking for every order under Account → My Orders. If something looks off, tap ‘Chat on WhatsApp’ and share your order ID (starts with AX).",
      handoff: true,
    };
  }

  if (looksLikeRecommendation(text)) {
    const products = await recommend(text);
    const names = products
      .map((p) => `• ${p.name} — ${formatINR(p.price)}`)
      .join("\n");
    return {
      text: `Based on what you need, here are a few from our range:\n${names}\n\nWant me to compare any of these?`,
      products,
    };
  }

  const faq = findFaq(text);
  if (faq) {
    return {
      text: faq.a,
      handoff: faq.q === "Payment / order",
    };
  }

  // Fallback → offer human handoff
  return {
    text: "I'm not fully sure on that one. Our team can help you directly — tap ‘Chat on WhatsApp’ and we'll jump in.",
    handoff: true,
  };
}

export { whatsappLink };
