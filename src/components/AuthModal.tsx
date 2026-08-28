import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Smartphone, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import PasswordMeter from "@/components/PasswordMeter";
import { emailError, passwordError } from "@/lib/validation";

export default function AuthModal() {
  const { authModalOpen, authModalMode, openAuthModal, closeAuthModal, signIn, signUp, signInWithFirebaseToken } = useAuth();

  // Login Mode: "phone" | "email"
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");

  // Phone OTP states
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"send" | "verify">("send");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Email Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // Signup states
  const [signupValues, setSignupValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [signupErrors, setSignupErrors] = useState<Partial<Record<string, string>>>({});
  const [signupTouched, setSignupTouched] = useState<Partial<Record<string, boolean>>>({});
  const [signupFormError, setSignupFormError] = useState("");
  const [signupBusy, setSignupBusy] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!authModalOpen) return null;

  const getRecaptchaVerifier = () => {
    if (!(window as any)._rcv) {
      const el = document.getElementById('recaptcha-container');
      if (el) el.innerHTML = '';
      (window as any)._rcv = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => { (window as any)._rcv = null; },
      });
    }
    return (window as any)._rcv;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setOtpBusy(true);
    try {
      const formattedPhone = `+91${cleanPhone}`;
      const verifier = getRecaptchaVerifier();
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setOtpStep("verify");
      setResendTimer(60);
    } catch (err: any) {
      console.error("Firebase send OTP error:", err);
      setPhoneError(err.message || "Failed to send OTP. Please try again.");
      try { (window as any)._rcv?.clear(); } catch (_) {}
      (window as any)._rcv = null;
    } finally {
      setOtpBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    if (!otpCode || otpCode.length < 6) {
      setPhoneError("Please enter the 6-digit OTP code.");
      return;
    }
    if (!confirmationResult) {
      setPhoneError("Session expired. Please request a new OTP.");
      return;
    }
    setOtpBusy(true);
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const idToken = await userCredential.user.getIdToken();
      await signInWithFirebaseToken(idToken);
      closeAuthModal();
    } catch (err: any) {
      console.error("Firebase verify OTP error:", err);
      const msg = err.response?.data?.message || err.message || "Invalid or expired OTP code. Please check and try again.";
      setPhoneError(msg);
    } finally {
      setOtpBusy(false);
    }
  };

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const id = loginEmail.trim();
    const emailValidation = emailError(id);
    if (emailValidation) {
      setLoginError(emailValidation);
      return;
    }
    if (!loginPassword) {
      setLoginError("Please enter your password.");
      return;
    }
    setLoginBusy(true);
    try {
      await signIn(id, loginPassword);
      closeAuthModal();
    } catch (err) {
      setLoginError((err as Error).message);
    } finally {
      setLoginBusy(false);
    }
  }

  // Validation functions for signup
  const validators: Record<string, (v: string) => string | null> = {
    firstName: (v) => {
      const t = v.trim();
      if (!t) return "Please enter your first name.";
      if (t.length < 2) return "First name is too short.";
      if (!/^[a-zA-Z\s.'-]+$/.test(t)) return "First name can only contain letters.";
      return null;
    },
    lastName: (v) => {
      const t = v.trim();
      if (!t) return "Please enter your last name.";
      if (t.length < 2) return "Last name is too short.";
      if (!/^[a-zA-Z\s.'-]+$/.test(t)) return "Last name can only contain letters.";
      return null;
    },
    email: emailError,
    password: passwordError,
  };

  function validateSignupField(field: string, v: string) {
    const err = validators[field](v);
    setSignupErrors((e) => ({ ...e, [field]: err ?? undefined }));
    return err;
  }

  function setSignupVal(field: string, v: string) {
    setSignupValues((s) => ({ ...s, [field]: v }));
    if (signupTouched[field]) validateSignupField(field, v);
  }

  function blurSignupField(field: string) {
    setSignupTouched((t) => ({ ...t, [field]: true }));
    validateSignupField(field, signupValues[field as keyof typeof signupValues]);
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSignupFormError("");
    const allTouched = { firstName: true, lastName: true, email: true, password: true };
    setSignupTouched(allTouched);
    const nextErrors: Partial<Record<string, string>> = {};
    let firstErr: string | null = null;
    for (const k of Object.keys(validators)) {
      const err = validators[k](signupValues[k as keyof typeof signupValues]);
      if (err) {
        nextErrors[k] = err;
        if (!firstErr) firstErr = err;
      }
    }
    setSignupErrors(nextErrors);
    if (firstErr) {
      setSignupFormError("Please fix the errors above.");
      return;
    }
    setSignupBusy(true);
    try {
      await signUp({
        fullName: `${signupValues.firstName.trim()} ${signupValues.lastName.trim()}`,
        email: signupValues.email.trim(),
        password: signupValues.password,
      });
      closeAuthModal();
    } catch (err) {
      setSignupFormError((err as Error).message);
    } finally {
      setSignupBusy(false);
    }
  }

  const errCls = (field: string) =>
    signupTouched[field] && signupErrors[field] ? "border-red-500 focus:ring-red-500/20" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row my-auto max-h-[90vh] md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column - Premium Brand Promo */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-ink via-ink-light to-copper/30 p-8 md:p-12 flex-col justify-between relative overflow-hidden text-cream">
          <div className="absolute top-0 right-0 w-64 h-64 bg-copper/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <span className="chip bg-white/10 text-gold border border-white/15 text-[11px] font-black uppercase tracking-widest px-3 py-1">
              Aurex India
            </span>
            <h3 className="mt-6 text-2xl font-black font-serif text-cream leading-tight">
              Unlock 15% Off
            </h3>
            <p className="text-cream/70 text-sm font-light leading-relaxed mt-3">
              Sign in or create an account today to enjoy 15% discount on your first purchase of our premium triply and cast iron cookware.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-copper/20 flex items-center justify-center text-copper font-bold text-sm">
              ✨
            </div>
            <p className="text-xs text-cream/70 font-medium">
              Free Shipping Across India & Lifetime Warranty
            </p>
          </div>
        </div>

        {/* Right Column - Auth Forms */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-10 relative flex flex-col justify-center overflow-y-auto">
          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 z-30 rounded-full p-2 text-ink/40 hover:bg-sand/60 hover:text-ink transition-all"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {authModalMode === "login" ? (
            <div className="max-w-sm mx-auto w-full pt-2 sm:pt-0">
              {/* Member Offer Banner */}
              <div className="mb-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sand/40 to-copper/10 border border-amber-600/20 p-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 grid h-7 w-7 place-items-center rounded-lg bg-amber-600/15 text-amber-900 text-xs font-black">
                      %
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-ink">New Member Offer</span>
                        <span className="font-mono text-[10px] font-black text-copper bg-white px-1.5 py-0.5 rounded border border-copper/30">
                          NEWUSER15
                        </span>
                      </div>
                      <p className="text-[11px] text-ink/60 leading-tight mt-0.5">
                        Get 15% off your first cookware order
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAuthModal("signup")}
                    className="text-[11px] font-black uppercase text-copper hover:text-copper-dark hover:underline flex-shrink-0 bg-white px-2.5 py-1.5 rounded-xl border border-copper/25 shadow-2xs"
                  >
                    Claim →
                  </button>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-ink">Welcome back</h2>
              <p className="mt-1 text-xs sm:text-sm text-ink/60">Sign in to your Aurex account.</p>

              {/* Login Method Switcher Tabs */}
              <div className="mt-5 grid grid-cols-2 p-1 bg-sand/60 rounded-xl text-xs font-bold border border-ink/5">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("phone");
                    setPhoneError("");
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    loginMethod === "phone" ? "bg-white text-ink shadow-2xs" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <Smartphone size={14} /> Phone OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("email");
                    setLoginError("");
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    loginMethod === "email" ? "bg-white text-ink shadow-2xs" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <Mail size={14} /> Email Login
                </button>
              </div>

              {/* PHONE OTP LOGIN FLOW */}
              {loginMethod === "phone" ? (
                otpStep === "send" ? (
                  <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
                    <div>
                      <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="modal-phone">
                        Mobile Number
                      </label>
                      <div className="relative mt-1 flex rounded-xl border border-ink/15 overflow-hidden focus-within:border-copper focus-within:ring-2 focus-within:ring-copper/15">
                        <span className="px-3.5 bg-sand/50 text-xs font-bold text-ink/70 flex items-center border-r border-ink/10">
                          🇮🇳 +91
                        </span>
                        <input
                          id="modal-phone"
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink/30 outline-none bg-white"
                          placeholder="98765 43210"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-ink/50">An instant 6-digit OTP will be sent via SMS.</p>
                    </div>

                    {/* Visible reCAPTCHA container */}
                    <div className="my-2 flex justify-center min-h-[78px]">
                      <div id="recaptcha-container"></div>
                    </div>

                    {phoneError && <p className="text-xs text-red-600 font-medium">{phoneError}</p>}

                    <button
                      type="submit"
                      disabled={otpBusy || phone.length < 10}
                      className="btn-primary w-full py-3.5 text-sm font-bold shadow-md disabled:opacity-50"
                    >
                      {otpBusy ? "Sending OTP..." : "Send OTP Verification Code"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink">
                        OTP sent to <span className="text-copper">+91 {phone}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep("send");
                          setOtpCode("");
                          setPhoneError("");
                        }}
                        className="text-[11px] font-bold text-copper hover:underline flex items-center gap-1"
                      >
                        <ArrowLeft size={12} /> Change
                      </button>
                    </div>

                    <div>
                      <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="modal-otp">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        id="modal-otp"
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="input text-center text-lg font-mono font-bold tracking-[0.4em] mt-1"
                        placeholder="••••••"
                        autoFocus
                      />
                    </div>

                    {phoneError && <p className="text-xs text-red-600 font-medium">{phoneError}</p>}

                    <button
                      type="submit"
                      disabled={otpBusy || otpCode.length < 6}
                      className="btn-primary w-full py-3.5 text-sm font-bold shadow-md disabled:opacity-50"
                    >
                      {otpBusy ? "Verifying..." : "Verify & Sign In"}
                    </button>

                    <div className="text-center pt-2">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-ink/50">
                          Resend OTP in <span className="font-bold text-ink">{resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpBusy}
                          className="text-xs font-bold text-copper hover:text-gold flex items-center gap-1 mx-auto"
                        >
                          <RefreshCw size={12} /> Resend OTP Code
                        </button>
                      )}
                    </div>
                  </form>
                )
              ) : (
                /* EMAIL LOGIN FLOW */
                <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="modal-email">Email Address</label>
                    <input
                      id="modal-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="input text-sm mt-1"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="modal-password">Password</label>
                    <div className="relative">
                      <input
                        id="modal-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="input text-sm mt-1 w-full pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors mt-0.5"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {loginError && <p className="text-xs text-red-600 font-medium">{loginError}</p>}
                  <button type="submit" disabled={loginBusy} className="btn-primary w-full py-3.5 text-sm font-bold mt-1 shadow-md">
                    {loginBusy ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              )}

              <p className="mt-5 sm:mt-7 text-center text-xs sm:text-sm text-ink/60 font-medium border-t border-ink/[0.06] pt-4 sm:pt-5">
                New to Aurex?{" "}
                <button 
                  onClick={() => openAuthModal("signup")} 
                  className="font-bold text-copper hover:text-gold transition-colors outline-none"
                >
                  Create an account (Get 15% OFF)
                </button>
              </p>
            </div>
          ) : (
            <div className="max-w-sm mx-auto w-full pt-2 sm:pt-0">
              {/* Signup Welcome Banner */}
              <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sand/40 to-copper/10 border border-emerald-500/30 p-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 grid h-7 w-7 place-items-center rounded-lg bg-emerald-600/15 text-emerald-800 text-xs font-black">
                    15%
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-ink">15% Welcome Discount</span>
                      <span className="font-mono text-[10px] font-black text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                        NEWUSER15
                      </span>
                    </div>
                    <p className="text-[11px] text-ink/60 leading-tight mt-0.5">
                      Coupon code ready automatically at checkout!
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-ink">Create account</h2>
              <p className="mt-1 text-xs sm:text-sm text-ink/60">Join Aurex & unlock your 15% welcome savings.</p>

              <form onSubmit={handleSignupSubmit} noValidate className="mt-5 space-y-3.5 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="modal-firstname">First name</label>
                    <input
                      id="modal-firstname"
                      value={signupValues.firstName}
                      onChange={(e) => setSignupVal("firstName", e.target.value)}
                      onBlur={() => blurSignupField("firstName")}
                      className={`input text-sm mt-1 ${errCls("firstName")}`}
                      placeholder="Priya"
                      autoComplete="given-name"
                    />
                    {signupTouched.firstName && signupErrors.firstName && (
                      <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="modal-lastname">Last name</label>
                    <input
                      id="modal-lastname"
                      value={signupValues.lastName}
                      onChange={(e) => setSignupVal("lastName", e.target.value)}
                      onBlur={() => blurSignupField("lastName")}
                      className={`input text-sm mt-1 ${errCls("lastName")}`}
                      placeholder="Sharma"
                      autoComplete="family-name"
                    />
                    {signupTouched.lastName && signupErrors.lastName && (
                      <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="modal-signup-email">Email Address</label>
                  <input
                    id="modal-signup-email"
                    type="email"
                    value={signupValues.email}
                    onChange={(e) => setSignupVal("email", e.target.value)}
                    onBlur={() => blurSignupField("email")}
                    className={`input text-sm mt-1 ${errCls("email")}`}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {signupTouched.email && signupErrors.email && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="label text-[11px] font-black uppercase tracking-wider text-ink/50" htmlFor="modal-signup-password">Password</label>
                  <div className="relative">
                    <input
                      id="modal-signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signupValues.password}
                      onChange={(e) => setSignupVal("password", e.target.value)}
                      onBlur={() => blurSignupField("password")}
                      className={`input text-sm mt-1 w-full pr-10 ${errCls("password")}`}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors mt-0.5"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="mt-1">
                    <PasswordMeter value={signupValues.password} />
                  </div>
                  {signupTouched.password && signupErrors.password && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.password}</p>
                  )}
                </div>

                {signupFormError && <p className="text-xs text-red-600 font-medium">{signupFormError}</p>}
                <button type="submit" disabled={signupBusy} className="btn-primary w-full py-3.5 text-sm font-bold mt-1 shadow-md">
                  {signupBusy ? "Creating account…" : "Create account"}
                </button>
              </form>

              <p className="mt-5 sm:mt-7 text-center text-xs sm:text-sm text-ink/60 font-medium border-t border-ink/[0.06] pt-4 sm:pt-5">
                Already have an account?{" "}
                <button 
                  onClick={() => openAuthModal("login")} 
                  className="font-bold text-copper hover:text-gold transition-colors outline-none"
                >
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
