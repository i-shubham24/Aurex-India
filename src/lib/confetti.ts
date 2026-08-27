import confetti from "canvas-confetti";

export function fireCouponConfetti() {
  confetti({
    particleCount: 45,
    spread: 55,
    origin: { y: 0.65 },
    colors: ["#B06E3F", "#1B2A4A", "#2E7D32", "#D4AF37", "#E07A5F", "#4CAF50"],
    ticks: 180,
    gravity: 1.1,
    scalar: 0.85,
    shapes: ["circle", "square"],
    zIndex: 99999,
    disableForReducedMotion: true,
  });
}
