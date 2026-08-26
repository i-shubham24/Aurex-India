import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import Logo from "@/components/Logo";

const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917814477667";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Triply Cookware", to: "/shop/triply-cookware" },
      { label: "Cast Iron", to: "/shop/cast-iron" },
      { label: "Kadais", to: "/shop/kadais" },
      { label: "Tawas", to: "/shop/tawas" },
      { label: "Combos & Sets", to: "/shop/combos-and-sets" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "Track Order", to: "/account" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", to: "/about" },
      { label: "Blogs", to: "/blog" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Refund Policy", to: "/refund" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/[0.08] bg-charcoal text-cream/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="[&_span]:text-cream">
            <Logo className="[&_.text-ink]:text-cream" />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
            Premium triply stainless steel and cast iron cookware, made in India
            with over five decades of manufacturing craftsmanship.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[
              { Icon: Instagram, href: "https://www.instagram.com/aurex.india", label: "Instagram" },
              { Icon: Facebook, href: "https://www.facebook.com/share/1B2XLaNTBc/", label: "Facebook" },
              { Icon: Youtube, href: "https://youtube.com/@aurex_india", label: "YouTube" },
              { Icon: MessageCircle, href: `https://wa.me/${whatsapp}`, label: "WhatsApp" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-copper"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-cream">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-cream/60 transition-colors hover:text-copper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Aurex India. All rights reserved.</p>
          <p>
            Crafted by{" "}
            <a
              href="https://humblesolutions.in"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-cream/80 underline decoration-copper/60 underline-offset-2 transition-colors hover:text-copper"
            >
              HumbleSolutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
