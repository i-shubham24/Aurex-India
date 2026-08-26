import { useEffect, useState } from "react";

/**
 * Types each phrase out letter by letter (a "writing" effect), holds, erases,
 * then types the next — cycling through `words`, with a blinking caret.
 *
 * Zero layout shift: an invisible sizer reserves the box of the LONGEST phrase,
 * and the animating text is absolutely positioned over it. So the surrounding
 * heading never reflows (no horizontal or vertical jitter) as text changes.
 */
export default function Typewriter({
  words,
  typeSpeed = 65,
  deleteSpeed = 35,
  hold = 1500,
  className = "",
}: {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  hold?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      timer = setTimeout(() => setDeleting(true), hold);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    } else {
      const next = deleting
        ? current.slice(0, text.length - 1)
        : current.slice(0, text.length + 1);
      timer = setTimeout(() => setText(next), deleting ? deleteSpeed : typeSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, hold]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className="relative inline-block whitespace-nowrap align-bottom">
      {/* Sizer: reserves width + height of the longest phrase, invisible. */}
      <span className="invisible" aria-hidden="true">
        {longest}
      </span>
      {/* Animating text overlaid — absolute, so it never affects layout. */}
      <span className="absolute inset-0 whitespace-nowrap">
        <span className={className}>{text}</span>
        <span className={`tw-caret ${className}`} aria-hidden="true" />
      </span>
    </span>
  );
}
