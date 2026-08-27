/**
 * Centralised form validation. Every form imports from here so rules stay
 * consistent. Each `*Error` returns a human message when invalid, or null when
 * valid — so a form field is valid iff its error function returns null.
 */

/** Strip to the last 10 digits (handles +91 / spaces / dashes). */
export function normalizePhone(v: string): string {
  return v.replace(/\D/g, "").slice(-10);
}

export function nameError(v: string): string | null {
  const t = v.trim();
  if (!t) return "Please enter your name.";
  if (t.length < 2) return "Name is too short.";
  if (!/^[a-zA-Z\s.'-]+$/.test(t)) return "Name can only contain letters.";
  return null;
}

export function emailError(v: string): string | null {
  const t = v.trim();
  if (!t) return "Please enter your email.";
  // Pragmatic RFC-ish check: something@something.tld
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return "Enter a valid email address.";
  return null;
}

/** Indian mobile: 10 digits starting 6–9 (accepts +91 / spacing). */
export function phoneError(v: string): string | null {
  const p = normalizePhone(v);
  if (!p) return "Please enter your mobile number.";
  if (p.length !== 10) return "Mobile number must be 10 digits.";
  if (!/^[6-9]\d{9}$/.test(p)) return "Enter a valid Indian mobile number.";
  return null;
}

/** Password: 8+ chars with a number. */
export function passwordError(v: string): string | null {
  if (!v) return "Please create a password.";
  if (v.length < 8) return "Use at least 8 characters.";
  if (!/\d/.test(v)) return "Add a number.";
  return null;
}

export interface Strength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  /** tailwind bg-* class for the meter fill */
  color: string;
}

/** 0–4 strength score for a live meter (independent of the hard requirement). */
export function passwordStrength(v: string): Strength {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  if (v.length >= 12 && s >= 3) s = 4;
  const map: Record<number, Strength> = {
    0: { score: 0, label: "Too weak", color: "bg-red-500" },
    1: { score: 1, label: "Weak", color: "bg-red-500" },
    2: { score: 2, label: "Fair", color: "bg-gold" },
    3: { score: 3, label: "Good", color: "bg-sky" },
    4: { score: 4, label: "Strong", color: "bg-forest" },
  };
  return map[Math.min(s, 4) as 0 | 1 | 2 | 3 | 4];
}

export function requiredError(v: string, label = "This field"): string | null {
  return v.trim() ? null : `${label} is required.`;
}
