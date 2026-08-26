import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send, Sparkles, ExternalLink } from "lucide-react";
import { askBot, whatsappLink, type BotReply } from "@/lib/bot";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/services/types";
import { formatINR } from "@/lib/format";

interface Msg {
  from: "bot" | "user";
  text: string;
  products?: Product[];
  handoff?: boolean;
}

const SUGGESTIONS = [
  "Which pan is best for dosas?",
  "What's your return policy?",
  "How do I season cast iron?",
  "Do you ship across India?",
];

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: "Namaste! 👋 I'm Aurea, your Aurex assistant. Ask me about products, shipping, returns, warranty or cookware care.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setBusy(true);
    try {
      const reply: BotReply = await askBot(q, { isLoggedIn: !!user });
      setMsgs((m) => [
        ...m,
        { from: "bot", text: reply.text, products: reply.products, handoff: reply.handoff },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { from: "bot", text: "Something went wrong. Please try again or reach us on WhatsApp.", handoff: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-copper text-white shadow-lift transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-5 z-40 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-ink/10 transition-all duration-300 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ height: "min(70vh, 560px)" }}
        role="dialog"
        aria-label="Aurex assistant"
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-ink px-4 py-3 text-cream">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-copper">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold">Aurea</p>
            <p className="text-[0.7rem] text-cream/60">Aurex assistant · replies instantly</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="scroll-slim flex-1 space-y-3 overflow-y-auto bg-cream/60 px-3 py-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className="max-w-[85%] space-y-2">
                <div
                  className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.from === "user"
                      ? "rounded-br-sm bg-ink text-cream"
                      : "rounded-bl-sm bg-white text-ink ring-1 ring-ink/[0.06]"
                  }`}
                >
                  {m.text}
                </div>

                {m.products && m.products.length > 0 && (
                  <div className="space-y-2">
                    {m.products.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl bg-white p-2 ring-1 ring-ink/[0.06] transition-shadow hover:shadow-card"
                      >
                        <img src={p.images[0]} alt={p.name} className="h-11 w-11 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-medium">{p.name}</p>
                          <p className="text-xs font-semibold text-copper">{formatINR(p.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {m.handoff && (
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <MessageCircle size={14} /> Chat on WhatsApp <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 ring-1 ring-ink/[0.06]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {msgs.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full bg-white px-3 py-1.5 text-xs text-ink/70 ring-1 ring-ink/10 transition-colors hover:bg-gold hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-ink/10 bg-white px-3 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aurea anything…"
            className="input py-2"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-copper text-white disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
