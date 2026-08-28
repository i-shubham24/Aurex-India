import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import Logo from "@/components/Logo";

const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917814477667";

export default function Footer() {
  return (
    <footer className="border-t border-ink/[0.08] bg-charcoal text-cream/80 w-full mt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-cream/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="[&_span]:text-cream">
              <Logo light />
            </div>
            <p className="text-sm leading-relaxed text-cream/60 max-w-sm">
              Premium triply stainless steel and toxin-free cast iron cookware. Made in India with over five decades of manufacturing craftsmanship.
            </p>
            
            {/* Social Icons */}
            <div className="space-y-2">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-cream/70">Connect with us</h4>
              <div className="flex items-center gap-3">
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
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-cream hover:bg-gold hover:text-ink transition-all duration-300"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Column 1: Shop */}
          <div>
            <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-cream">
              Shop
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "Triply Cookware", to: "/shop/triply" },
                { label: "Cast Iron Range", to: "/shop/cast-iron" },
                { label: "Kadhai Collections", to: "/shop/kadhai" },
                { label: "Honeycomb Non-Stick", to: "/shop/honeycomb" },
                { label: "View All Cookware", to: "/shop" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-cream/60 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2: Support */}
          <div>
            <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-cream">
              Support
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "Contact Us", to: "/contact" },
                { label: "Shipping Policy", to: "/shipping" },
                { label: "Returns & Refund", to: "/returns" },
                { label: "Track Your Order", to: "/account" },
                { label: "FAQs & Support", to: "/faq" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-cream/60 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-cream/50">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center sm:justify-start">
            <p>© {new Date().getFullYear()} Aurex India. All rights reserved.</p>
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
          </div>
          <p>
            Crafted by{" "}
            <a
              href="https://humblesolutions.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/80 hover:text-gold transition-colors font-medium"
            >
              Humble Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
