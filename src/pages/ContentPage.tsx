import { Link } from "react-router-dom";
import { FAQ } from "@/lib/bot";
import Seo from "@/components/Seo";

/**
 * Structured content/policy pages. Copy is professional placeholder tailored
 * to an Indian cookware store — replace with the client's final legal text.
 * FAQ pulls from the same knowledge base the assistant uses, so answers stay
 * consistent across the site and the bot.
 */
interface Section {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
}
interface Page {
  title: string;
  updated: string;
  intro?: string;
  sections: Section[];
}

const UPDATED = "August 2026";

const CONTENT: Record<string, Page> = {
  shipping: {
    title: "Shipping Policy",
    updated: UPDATED,
    intro: "We offer free shipping across India on all orders.",
    sections: [
      {
        heading: "Dispatch & delivery times",
        bullets: [
          "Orders are dispatched within 24–48 hours of confirmation.",
          "Delivery typically takes 3–7 business days depending on your pincode.",
          "Remote locations may take slightly longer.",
        ],
      },
      {
        heading: "Order tracking",
        paragraphs: [
          "Once your order ships, you'll receive tracking details. You can also view live status any time under Account → My Orders.",
        ],
      },
      {
        heading: "Charges",
        paragraphs: [
          "Shipping is free on every order across India. Any applicable taxes are shown at checkout.",
        ],
      },
    ],
  },
  returns: {
    title: "Returns Policy",
    updated: UPDATED,
    intro: "Not fully satisfied? We keep returns simple.",
    sections: [
      {
        heading: "Eligibility",
        bullets: [
          "Returns can be requested within 7 days of delivery.",
          "Items must be unused and in their original packaging.",
          "Proof of purchase (order ID) is required.",
        ],
      },
      {
        heading: "How to start a return",
        paragraphs: [
          "Contact us on WhatsApp at +91 78144 77667 with your order ID and reason. We'll arrange a pickup or guide you through the next steps.",
        ],
      },
      {
        heading: "Non-returnable items",
        paragraphs: [
          "Used cookware (beyond inspection), items without original packaging, and clearance items are not eligible unless they arrived damaged or defective.",
        ],
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    updated: UPDATED,
    intro: "Refunds are processed quickly once your return is received.",
    sections: [
      {
        heading: "Processing",
        bullets: [
          "Refunds are issued after the returned item passes inspection.",
          "Amounts are credited to your original payment method.",
          "Please allow 5–7 business days for the amount to reflect.",
        ],
      },
      {
        heading: "Damaged or defective items",
        paragraphs: [
          "If your item arrived damaged or has a manufacturing defect, we'll offer a free replacement or a full refund, including any return shipping.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: UPDATED,
    intro:
      "We respect your privacy and collect only what's needed to serve you well.",
    sections: [
      {
        heading: "What we collect",
        bullets: [
          "Contact details (name, email, phone) to process orders and support requests.",
          "Delivery address for shipping.",
          "Order history to power your account and tracking.",
        ],
      },
      {
        heading: "How we use it",
        paragraphs: [
          "Your information is used to fulfil orders, provide support, and improve your experience. We never sell your personal data to third parties.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "You can request access to or deletion of your data any time by contacting us. This is placeholder copy — final policy text will be supplied by Aurex.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: UPDATED,
    intro: "By using this website you agree to the following terms.",
    sections: [
      {
        heading: "Use of the site",
        paragraphs: [
          "You agree to provide accurate information and to use the site lawfully. Product images and descriptions are for reference; slight variations may occur.",
        ],
      },
      {
        heading: "Pricing & orders",
        bullets: [
          "Prices are in Indian Rupees (₹) and inclusive of applicable taxes unless stated.",
          "We reserve the right to cancel orders in case of pricing errors or stock issues.",
          "Coupons are subject to their individual terms and may be withdrawn at any time.",
        ],
      },
      {
        heading: "Warranty",
        paragraphs: [
          "Cast iron carries a lifetime warranty and triply stainless steel a 10-year warranty against manufacturing defects. Warranty excludes normal wear, misuse and cosmetic changes from use.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "This is placeholder copy — final terms will be supplied by Aurex. Questions? Reach us on WhatsApp at +91 78144 77667.",
        ],
      },
    ],
  },
};

function PolicyView({ page }: { page: Page }) {
  return (
    <div className="container-x max-w-3xl py-14">
      <Seo title={page.title} description={page.intro ?? `${page.title} — Aurex India`} />
      <h1 className="text-3xl font-semibold">{page.title}</h1>
      <p className="mt-2 text-sm text-ink/45">Last updated: {page.updated}</p>
      {page.intro && <p className="mt-6 text-lg text-ink/75">{page.intro}</p>}
      <div className="mt-8 space-y-8">
        {page.sections.map((s, i) => (
          <section key={i}>
            {s.heading && <h2 className="text-lg font-semibold text-ink">{s.heading}</h2>}
            {s.paragraphs?.map((p, j) => (
              <p key={j} className="mt-2 text-ink/70">{p}</p>
            ))}
            {s.bullets && (
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-ink/70">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-copper" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <div className="mt-12 rounded-xl2 bg-sand/60 p-6 text-center">
        <p className="text-sm text-ink/60">Need help? We're a message away.</p>
        <Link to="/contact" className="btn-copper mt-3">Contact us</Link>
      </div>
    </div>
  );
}

export default function ContentPage({ slug }: { slug: string }) {
  if (slug === "faq") {
    return (
      <div className="container-x max-w-3xl py-14">
        <Seo
          title="FAQ — Shipping, Returns & Warranty"
          description="Answers to common questions about Aurex cookware — shipping, returns, warranty, and cast iron care."
          canonicalPath="/faq"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
        <h1 className="text-3xl font-semibold">Frequently Asked Questions</h1>
        <div className="mt-8 divide-y divide-ink/10 rounded-xl2 bg-white shadow-card">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {f.q}
                <span className="text-copper transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-ink/70">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    );
  }

  const page = CONTENT[slug];
  if (!page) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-semibold">Page coming soon</h1>
        <Link to="/" className="btn-copper mt-4">Back home</Link>
      </div>
    );
  }
  return <PolicyView page={page} />;
}
