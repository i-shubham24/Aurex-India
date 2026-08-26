import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin, Send, Check } from "lucide-react";
import Seo from "@/components/Seo";

const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER ?? "917814477667";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "General enquiry", message: "" });
  const [sent, setSent] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // No backend yet: compose a WhatsApp message the customer sends themselves.
    // Swap for a real endpoint (Supabase/MERN) later without changing the form.
    const text =
      `Hi Aurex, I have a ${form.subject.toLowerCase()}.\n\n` +
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    setSent(true);
  }

  return (
    <div className="container-x py-12">
      <Seo
        title="Contact Us"
        description="Questions about Aurex cookware, orders or warranty? Reach us on WhatsApp at +91 78144 77667 or send us a message."
        canonicalPath="/contact"
      />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Get in touch</h1>
        <p className="mt-3 text-ink/60">
          Questions about cookware, orders or warranty? We're here to help.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Contact details */}
        <div className="space-y-4">
          {[
            { Icon: MessageCircle, label: "WhatsApp", value: "+91 78144 77667", href: `https://wa.me/${whatsapp}` },
            { Icon: Phone, label: "Phone", value: "+91 78144 77667", href: "tel:+917814477667" },
            { Icon: Mail, label: "Email", value: "care@aurexindia.com", href: "mailto:care@aurexindia.com" },
            { Icon: MapPin, label: "Made in", value: "India · 5 decades of craftsmanship" },
          ].map(({ Icon, label, value, href }) => (
            <div key={label} className="card flex items-center gap-4 p-5">
              <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-copper/10 text-copper">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="font-medium hover:text-copper">
                    {value}
                  </a>
                ) : (
                  <p className="font-medium">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-forest/10 text-forest">
                <Check size={28} />
              </div>
              <h2 className="mt-4 text-xl font-semibold">Thanks, {form.name || "there"}!</h2>
              <p className="mt-2 max-w-xs text-sm text-ink/60">
                We've opened WhatsApp with your message ready to send. Tap send and our team will
                reply shortly.
              </p>
              <button onClick={() => setSent(false)} className="btn-outline mt-6">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="c-name">Name</label>
                  <input id="c-name" required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="c-phone">Phone</label>
                  <input id="c-phone" type="tel" className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="c-email">Email</label>
                <input id="c-email" type="email" required className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="c-subject">Subject</label>
                <select id="c-subject" className="input" value={form.subject} onChange={(e) => set("subject", e.target.value)}>
                  <option>General enquiry</option>
                  <option>Order support</option>
                  <option>Warranty claim</option>
                  <option>Returns & refunds</option>
                  <option>Bulk / wholesale</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="c-message">Message</label>
                <textarea id="c-message" required rows={4} className="input" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="How can we help?" />
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                <Send size={16} /> Send message
              </button>
              <p className="text-center text-xs text-ink/45">
                Sends via WhatsApp for the fastest response.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
