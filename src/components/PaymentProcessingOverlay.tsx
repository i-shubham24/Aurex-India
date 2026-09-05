import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export type PaymentStage = "initiating" | "waiting" | "verifying";

interface PaymentProcessingOverlayProps {
  isOpen: boolean;
  stage?: PaymentStage;
  amount?: number;
  isAdvance?: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

export default function PaymentProcessingOverlay({
  isOpen,
  stage = "initiating",
  customTitle,
  customSubtitle,
}: PaymentProcessingOverlayProps) {
  // Prevent background scrolling while overlay is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const title =
    customTitle ||
    (stage === "verifying" ? "Verifying Payment..." : "Processing Payment...");

  const subtitle =
    customSubtitle || "Please wait, do not refresh or close this window.";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-loader-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm select-none touch-none animate-fade-in"
      style={{ pointerEvents: "auto" }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 sm:p-8 text-center shadow-2xl border border-ink/10 animate-scale-up flex flex-col items-center">
        {/* Minimal Smooth Spinner */}
        <Loader2 className="h-10 w-10 animate-spin text-copper mb-3.5" />

        {/* Text */}
        <h3
          id="payment-loader-title"
          className="text-base sm:text-lg font-bold text-ink"
        >
          {title}
        </h3>
        <p className="mt-1.5 text-xs text-ink/60 leading-relaxed max-w-[260px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
