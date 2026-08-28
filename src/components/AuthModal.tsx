import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import PasswordMeter from "@/components/PasswordMeter";
import { emailError, passwordError } from "@/lib/validation";

export default function AuthModal() {
  const { authModalOpen, authModalMode, openAuthModal, closeAuthModal, signInWithFirebaseToken } = useAuth();

  // ── Login state (Phone OTP only) ──────────────────────────────────────────
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginOtpStep, setLoginOtpStep] = useState<"send" | "verify">("send");
  const [loginConfirmation, setLoginConfirmation] = useState<ConfirmationResult | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginResendTimer, setLoginResendTimer] = useState(0);

  // ── Signup state (details → OTP) ──────────────────────────────────────────
  const [signupStep, setSignupStep] = useState<"details" | "verify">("details");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupOtpCode, setSignupOtpCode] = useState("");
  const [signupConfirmation, setSignupConfirmation] = useState<ConfirmationResult | null>(null);
  const [signupError, setSignupError] = useState("");
  const [signupBusy, setSignupBusy] = useState(false);
  const [signupResendTimer, setSignupResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // ── Resend timers ─────────────────────────────────────────────────────────
  useEffect(() => {
    let t: any;
    if (loginResendTimer > 0) t = setInterval(() => setLoginResendTimer((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [loginResendTimer]);

  useEffect(() => {
    let t: any;
    if (signupResendTimer > 0) t = setInterval(() => setSignupResendTimer((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [signupResendTimer]);

  if (!authModalOpen) return null;

  // ── reCAPTCHA helper ──────────────────────────────────────────────────────
  const getFreshVerifier = () => {
    // Destroy any existing verifier and its container
    if ((window as any)._rcv) {
      try { (window as any)._rcv.clear(); } catch (_) {}
      (window as any)._rcv = null;
    }
    if ((window as any)._rcvEl && (window as any)._rcvEl.parentNode) {
      (window as any)._rcvEl.parentNode.removeChild((window as any)._rcvEl);
    }
    // Create a fresh hidden div on the body each time
    const el = document.createElement("div");
    el.style.display = "none";
    document.body.appendChild(el);
    (window as any)._rcvEl = el;
    (window as any)._rcv = new RecaptchaVerifier(auth, el, {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => { (window as any)._rcv = null; },
    });
    return (window as any)._rcv;
  };

  const clearVerifier = () => {
    try { (window as any)._rcv?.clear(); } catch (_) {}
    (window as any)._rcv = null;
    if ((window as any)._rcvEl && (window as any)._rcvEl.parentNode) {
      (window as any)._rcvEl.parentNode.removeChild((window as any)._rcvEl);
      (window as any)._rcvEl = null;
    }
  };

  // ── LOGIN: Send OTP ───────────────────────────────────────────────────────
  const handleLoginSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const clean = loginPhone.replace(/\D/g, "");
    if (clean.length !== 10) {
      setLoginError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setLoginBusy(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, `+91${clean}`, getFreshVerifier());
      setLoginConfirmation(confirmation);
      setLoginOtpStep("verify");
      setLoginResendTimer(60);
    } catch (err: any) {
      console.error("Login OTP send error:", err);
      setLoginError(err.message || "Failed to send OTP. Please try again.");
      clearVerifier();
    } finally {
      setLoginBusy(false);
    }
  };

  // ── LOGIN: Verify OTP ─────────────────────────────────────────────────────
  const handleLoginVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginOtpCode || loginOtpCode.length < 6) {
      setLoginError("Please enter the 6-digit OTP.");
      return;
    }
    if (!loginConfirmation) {
      setLoginError("Session expired. Please request a new OTP.");
      return;
    }
    setLoginBusy(true);
    try {
      const cred = await loginConfirmation.confirm(loginOtpCode);
      const idToken = await cred.user.getIdToken();
      await signInWithFirebaseToken(idToken);
      closeAuthModal();
    } catch (err: any) {
      console.error("Login OTP verify error:", err);
      const msg = err.response?.data?.message || err.message || "Invalid OTP. Please try again.";
      setLoginError(msg);
    } finally {
      setLoginBusy(false);
    }
  };

  // ── SIGNUP: Send OTP (after filling details) ──────────────────────────────
  const handleSignupSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    // Validate fields
    if (!signupFirstName.trim() || signupFirstName.trim().length < 2) {
      setSignupError("Please enter a valid first name (at least 2 characters).");
      return;
    }
    if (!signupLastName.trim() || signupLastName.trim().length < 2) {
      setSignupError("Please enter a valid last name (at least 2 characters).");
      return;
    }
    const emailErr = emailError(signupEmail.trim());
    if (emailErr) { setSignupError(emailErr); return; }
    const cleanPhone = signupPhone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setSignupError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setSignupBusy(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, `+91${cleanPhone}`, getFreshVerifier());
      setSignupConfirmation(confirmation);
      setSignupStep("verify");
      setSignupResendTimer(60);
    } catch (err: any) {
      console.error("Signup OTP send error:", err);
      setSignupError(err.message || "Failed to send OTP. Please try again.");
      clearVerifier();
    } finally {
      setSignupBusy(false);
    }
  };

  // ── SIGNUP: Verify OTP & Create Account ───────────────────────────────────
  const handleSignupVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    if (!signupOtpCode || signupOtpCode.length < 6) {
      setSignupError("Please enter the 6-digit OTP.");
      return;
    }
    if (!signupConfirmation) {
      setSignupError("Session expired. Please go back and try again.");
      return;
    }
    setSignupBusy(true);
    try {
      const cred = await signupConfirmation.confirm(signupOtpCode);
      const idToken = await cred.user.getIdToken();
      await signInWithFirebaseToken(idToken, {
        firstName: signupFirstName.trim(),
        lastName: signupLastName.trim(),
        email: signupEmail.trim(),
      });
      closeAuthModal();
    } catch (err: any) {
      console.error("Signup OTP verify error:", err);
      const msg = err.response?.data?.message || err.message || "Invalid OTP. Please try again.";
      setSignupError(msg);
    } finally {
      setSignupBusy(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-md animate-fade-in overflow-y-auto">

      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row my-auto max-h-[90vh] md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left column ───────────────────────────────────────────────── */}
        <div className="hidden md:flex md:w-5/12 relative flex-col justify-between p-8 md:p-12 overflow-hidden text-cream">
          {/* Hero image */}
          <img
            src="/auth-hero.webp"
            alt="Aurex premium cookware"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Dark gradient overlay so text is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/60 to-ink/30" />

          {/* Content on top of image */}
          <div className="relative z-10">
            <span className="chip bg-white/10 text-gold border border-white/20 text-[11px] font-black uppercase tracking-widest px-3 py-1 backdrop-blur-sm">Aurex India</span>
            <h3 className="mt-6 text-2xl font-black font-serif text-cream leading-tight drop-shadow-lg">
              {authModalMode === "signup" ? "Join 10,000+ happy kitchens" : "Unlock 15% Off"}
            </h3>
            <p className="text-cream/80 text-sm font-light leading-relaxed mt-3 drop-shadow">
              {authModalMode === "signup"
                ? "Create your Aurex account and get 15% off your first order of premium triply and cast iron cookware."
                : "Sign in to your Aurex account and enjoy exclusive offers on premium triply and cast iron cookware."}
            </p>
          </div>
          <div className="relative z-10 pt-8 border-t border-white/15 flex items-center gap-3 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-full bg-copper/30 border border-copper/40 flex items-center justify-center text-gold font-bold text-sm">✨</div>
            <p className="text-xs text-cream/80 font-medium">Free Shipping Across India & Lifetime Warranty</p>
          </div>
        </div>


        {/* ── Right column ──────────────────────────────────────────────── */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-10 relative flex flex-col justify-center overflow-y-auto">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 z-30 rounded-full p-2 text-ink/40 hover:bg-sand/60 hover:text-ink transition-all"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* ── LOGIN MODE ─────────────────────────────────────────────── */}
          {authModalMode === "login" ? (
            <div className="max-w-sm mx-auto w-full pt-2 sm:pt-0">
              {/* Offer Banner */}
              <div className="mb-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sand/40 to-copper/10 border border-amber-600/20 p-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 grid h-7 w-7 place-items-center rounded-lg bg-amber-600/15 text-amber-900 text-xs font-black">%</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-ink">New Member Offer</span>
                        <span className="font-mono text-[10px] font-black text-copper bg-white px-1.5 py-0.5 rounded border border-copper/30">NEWUSER15</span>
                      </div>
                      <p className="text-[11px] text-ink/60 leading-tight mt-0.5">Get 15% off your first cookware order</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => openAuthModal("signup")}
                    className="text-[11px] font-black uppercase text-copper hover:underline flex-shrink-0 bg-white px-2.5 py-1.5 rounded-xl border border-copper/25 shadow-2xs">
                    Claim →
                  </button>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-ink">Welcome back</h2>
              <p className="mt-1 text-xs sm:text-sm text-ink/60">Sign in instantly via mobile OTP.</p>

              {/* Send OTP Step */}
              {loginOtpStep === "send" ? (
                <form onSubmit={handleLoginSendOtp} className="mt-6 space-y-4">
                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="login-phone">Mobile Number</label>
                    <div className="relative mt-1 flex rounded-xl border border-ink/15 overflow-hidden focus-within:border-copper focus-within:ring-2 focus-within:ring-copper/15">
                      <span className="px-3.5 bg-sand/50 text-xs font-bold text-ink/70 flex items-center border-r border-ink/10">🇮🇳 +91</span>
                      <input
                        id="login-phone"
                        type="tel"
                        required
                        maxLength={10}
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink/30 outline-none bg-white"
                        placeholder="98765 43210"
                        autoFocus
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-ink/50">An instant 6-digit OTP will be sent via SMS.</p>
                  </div>
                  {loginError && <p className="text-xs text-red-600 font-medium">{loginError}</p>}
                  <button type="submit" disabled={loginBusy || loginPhone.length < 10}
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-md disabled:opacity-50">
                    {loginBusy ? "Sending OTP…" : "Send OTP Verification Code"}
                  </button>
                </form>
              ) : (
                /* Verify OTP Step */
                <form onSubmit={handleLoginVerifyOtp} className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-ink">OTP sent to <span className="text-copper">+91 {loginPhone}</span></p>
                    <button type="button" onClick={() => { setLoginOtpStep("send"); setLoginOtpCode(""); setLoginError(""); }}
                      className="text-[11px] font-bold text-copper hover:underline flex items-center gap-1">
                      <ArrowLeft size={12} /> Change
                    </button>
                  </div>
                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="login-otp">Enter 6-Digit OTP</label>
                    <input id="login-otp" type="text" required maxLength={6}
                      value={loginOtpCode}
                      onChange={(e) => setLoginOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="input text-center text-lg font-mono font-bold tracking-[0.4em] mt-1"
                      placeholder="••••••" autoFocus />
                  </div>
                  {loginError && <p className="text-xs text-red-600 font-medium">{loginError}</p>}
                  <button type="submit" disabled={loginBusy || loginOtpCode.length < 6}
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-md disabled:opacity-50">
                    {loginBusy ? "Verifying…" : "Verify & Sign In"}
                  </button>
                  <div className="text-center pt-1">
                    {loginResendTimer > 0
                      ? <p className="text-xs text-ink/50">Resend OTP in <span className="font-bold text-ink">{loginResendTimer}s</span></p>
                      : <button type="button" onClick={handleLoginSendOtp} disabled={loginBusy}
                          className="text-xs font-bold text-copper hover:text-gold flex items-center gap-1 mx-auto">
                          <RefreshCw size={12} /> Resend OTP Code
                        </button>
                    }
                  </div>
                </form>
              )}

              <p className="mt-5 sm:mt-7 text-center text-xs sm:text-sm text-ink/60 font-medium border-t border-ink/[0.06] pt-4 sm:pt-5">
                New to Aurex?{" "}
                <button onClick={() => openAuthModal("signup")}
                  className="font-bold text-copper hover:text-gold transition-colors outline-none">
                  Create an account (Get 15% OFF)
                </button>
              </p>
            </div>

          ) : (
            /* ── SIGNUP MODE ─────────────────────────────────────────────── */
            <div className="max-w-sm mx-auto w-full pt-2 sm:pt-0">
              {/* Signup Offer Banner */}
              <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sand/40 to-copper/10 border border-emerald-500/30 p-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 grid h-7 w-7 place-items-center rounded-lg bg-emerald-600/15 text-emerald-800 text-xs font-black">15%</span>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-ink">15% Welcome Discount</span>
                      <span className="font-mono text-[10px] font-black text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-300">NEWUSER15</span>
                    </div>
                    <p className="text-[11px] text-ink/60 leading-tight mt-0.5">Applied automatically at checkout!</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-ink">Create account</h2>
              <p className="mt-1 text-xs sm:text-sm text-ink/60">
                {signupStep === "details" ? "Fill in your details to get started." : "Enter the OTP sent to your mobile."}
              </p>

              {/* Step 1: Details */}
              {signupStep === "details" ? (
                <form onSubmit={handleSignupSendOtp} className="mt-5 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="su-fn">First Name</label>
                      <input id="su-fn" value={signupFirstName} onChange={(e) => setSignupFirstName(e.target.value)}
                        className="input text-sm mt-1" placeholder="Priya" autoComplete="given-name" required />
                    </div>
                    <div>
                      <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="su-ln">Last Name</label>
                      <input id="su-ln" value={signupLastName} onChange={(e) => setSignupLastName(e.target.value)}
                        className="input text-sm mt-1" placeholder="Sharma" autoComplete="family-name" required />
                    </div>
                  </div>

                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="su-email">Email Address</label>
                    <input id="su-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                      className="input text-sm mt-1" placeholder="you@example.com" autoComplete="email" required />
                  </div>

                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="su-phone">Mobile Number</label>
                    <div className="relative mt-1 flex rounded-xl border border-ink/15 overflow-hidden focus-within:border-copper focus-within:ring-2 focus-within:ring-copper/15">
                      <span className="px-3.5 bg-sand/50 text-xs font-bold text-ink/70 flex items-center border-r border-ink/10">🇮🇳 +91</span>
                      <input id="su-phone" type="tel" required maxLength={10}
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink/30 outline-none bg-white"
                        placeholder="98765 43210" autoComplete="tel" />
                    </div>
                    <p className="mt-1 text-[11px] text-ink/50">OTP will be sent to this number for verification.</p>
                  </div>

                  {signupError && <p className="text-xs text-red-600 font-medium">{signupError}</p>}

                  <button type="submit" disabled={signupBusy || signupPhone.length < 10}
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-md disabled:opacity-50">
                    {signupBusy ? "Sending OTP…" : "Send OTP to Verify Mobile"}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP */
                <form onSubmit={handleSignupVerifyOtp} className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-ink">OTP sent to <span className="text-copper">+91 {signupPhone}</span></p>
                    <button type="button" onClick={() => { setSignupStep("details"); setSignupOtpCode(""); setSignupError(""); }}
                      className="text-[11px] font-bold text-copper hover:underline flex items-center gap-1">
                      <ArrowLeft size={12} /> Back
                    </button>
                  </div>
                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="su-otp">Enter 6-Digit OTP</label>
                    <input id="su-otp" type="text" required maxLength={6}
                      value={signupOtpCode}
                      onChange={(e) => setSignupOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="input text-center text-lg font-mono font-bold tracking-[0.4em] mt-1"
                      placeholder="••••••" autoFocus />
                  </div>
                  {signupError && <p className="text-xs text-red-600 font-medium">{signupError}</p>}
                  <button type="submit" disabled={signupBusy || signupOtpCode.length < 6}
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-md disabled:opacity-50">
                    {signupBusy ? "Creating account…" : "Verify & Create Account"}
                  </button>
                  <div className="text-center pt-1">
                    {signupResendTimer > 0
                      ? <p className="text-xs text-ink/50">Resend OTP in <span className="font-bold text-ink">{signupResendTimer}s</span></p>
                      : <button type="button" onClick={handleSignupSendOtp} disabled={signupBusy}
                          className="text-xs font-bold text-copper hover:text-gold flex items-center gap-1 mx-auto">
                          <RefreshCw size={12} /> Resend OTP Code
                        </button>
                    }
                  </div>
                </form>
              )}

              <p className="mt-5 sm:mt-7 text-center text-xs sm:text-sm text-ink/60 font-medium border-t border-ink/[0.06] pt-4 sm:pt-5">
                Already have an account?{" "}
                <button onClick={() => openAuthModal("login")}
                  className="font-bold text-copper hover:text-gold transition-colors outline-none">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
