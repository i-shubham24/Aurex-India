import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, MessageCircle, FileText, ArrowDownToLine } from "lucide-react";
import Logo from "@/components/Logo";

const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917814477667";

export default function Footer() {
  return (
    <footer className="border-t border-ink/[0.08] bg-charcoal text-cream/80 w-full mt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-cream/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="[&_span]:text-cream">
              <Logo className="[&_.text-ink]:text-cream" />
            </div>
            <p className="text-sm leading-relaxed text-cream/60 max-w-sm">
              Premium triply stainless steel and toxin-free cast iron cookware. Made in India with over five decades of manufacturing craftsmanship.
            </p>
            
            {/* Social Icons matching Appy Saude style */}
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
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-cream/5 border border-cream/10 text-cream/75 transition-all hover:bg-gold hover:text-ink hover:border-gold hover:scale-105"
                  >
                    <Icon size={18} />
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

          {/* Links Column 3: Catalog Downloads */}
          <div className="space-y-4">
            <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-cream">
              Product Guides
            </h4>
            <p className="text-xs text-cream/50 leading-relaxed">
              Download our latest cookware catalog and user guides.
            </p>
            
            {/* Catalog Download Buttons styled like App Store / Play Store buttons */}
            <div className="flex flex-col gap-2.5 max-w-[200px]">
              <a
                href="/catalog-triply.pdf"
                className="flex items-center gap-3 px-4 py-2 bg-cream/5 border border-cream/15 rounded-xl hover:bg-cream/10 hover:border-cream/30 transition-all text-cream hover:text-white"
              >
                <FileText size={22} className="text-gold" />
                <div className="text-left leading-tight">
                  <span className="block text-[9px] uppercase font-semibold text-cream/50 tracking-wider">Download PDF</span>
                  <span className="block text-xs font-black">Triply Catalog</span>
                </div>
                <ArrowDownToLine size={14} className="ml-auto opacity-40" />
              </a>

              <a
                href="/catalog-castiron.pdf"
                className="flex items-center gap-3 px-4 py-2 bg-cream/5 border border-cream/15 rounded-xl hover:bg-cream/10 hover:border-cream/30 transition-all text-cream hover:text-white"
              >
                <FileText size={22} className="text-gold" />
                <div className="text-left leading-tight">
                  <span className="block text-[9px] uppercase font-semibold text-cream/50 tracking-wider">Download PDF</span>
                  <span className="block text-xs font-black">Cast Iron Catalog</span>
                </div>
                <ArrowDownToLine size={14} className="ml-auto opacity-40" />
              </a>
            </div>
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
              rel="noreferrer"
              className="font-semibold text-cream/70 hover:text-gold underline decoration-gold/40 underline-offset-2 transition-colors"
            >
              HumbleSolutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
