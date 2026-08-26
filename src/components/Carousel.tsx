import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Lightweight, dependency-free carousel built on native scroll-snap.
 * - Swipe/trackpad works natively (overflow-x-auto).
 * - Arrows + dots drive programmatic smooth scrolling.
 * - Optional autoplay, paused on hover/focus and when the tab is hidden.
 * Responsive by design: control slide width via `slideClassName`
 *   hero → "basis-full", rails → "basis-[86%] sm:basis-1/2 lg:basis-1/3".
 */
interface CarouselProps {
  children: ReactNode[];
  slideClassName?: string;
  gapClassName?: string;
  autoPlayMs?: number;
  showArrows?: boolean;
  leftArrow?: boolean;
  showDots?: boolean;
  ariaLabel?: string;
  className?: string;
}

export default function Carousel({
  children,
  slideClassName = "basis-full",
  gapClassName = "gap-4",
  autoPlayMs,
  showArrows = true,
  leftArrow = true,
  showDots = false,
  ariaLabel = "carousel",
  className = "",
}: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = children.length;

  const scrollToIndex = useCallback((i: number) => {
    const t = track.current;
    if (!t) return;
    const slide = t.children[i] as HTMLElement | undefined;
    if (slide) t.scrollTo({ left: slide.offsetLeft - t.offsetLeft, behavior: "smooth" });
  }, []);

  const go = useCallback(
    (dir: number) => {
      const next = (index + dir + count) % count;
      setIndex(next);
      scrollToIndex(next);
    },
    [index, count, scrollToIndex]
  );

  // Keep `index` in sync when the user swipes manually.
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let timer: number;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const kids = [...t.children] as HTMLElement[];
        let best = 0;
        let bestDist = Infinity;
        kids.forEach((el, i) => {
          const d = Math.abs(el.offsetLeft - t.offsetLeft - t.scrollLeft);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        setIndex(best);
      }, 120);
    };
    t.addEventListener("scroll", onScroll, { passive: true });
    return () => t.removeEventListener("scroll", onScroll);
  }, [count]);

  // Autoplay
  useEffect(() => {
    if (!autoPlayMs || paused || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % count;
        scrollToIndex(next);
        return next;
      });
    }, autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, paused, count, scrollToIndex]);

  return (
    <div
      className={`group/carousel relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={track}
        className={`no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth ${gapClassName}`}
      >
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${slideClassName}`}>
            {child}
          </div>
        ))}
      </div>

      {showArrows && count > 1 && (
        <>
          {leftArrow && (
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full bg-white/90 p-2 text-ink shadow-card ring-1 ring-ink/10 transition hover:bg-white sm:grid"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full bg-white/90 p-2 text-ink shadow-card ring-1 ring-ink/10 transition hover:bg-white sm:grid"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); scrollToIndex(i); }}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={index === i}
              className={`h-2 rounded-full transition-all ${
                index === i ? "w-6 bg-copper" : "w-2 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
