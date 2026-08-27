import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PasswordMeter from "@/components/PasswordMeter";
import {
  emailError,
  passwordError,
} from "@/lib/validation";

export default function AuthModal() {
  const { authModalOpen, authModalMode, openAuthModal, closeAuthModal, signIn, signUp } = useAuth();

  // Login states
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

  if (!authModalOpen) return null;

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
    (Object.keys(validators) as string[]).forEach((f) => {
      const err = validators[f](signupValues[f as keyof typeof signupValues]);
      if (err) nextErrors[f] = err;
    });
    setSignupErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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

  const errCls = (f: string) =>
    signupTouched[f] && signupErrors[f] ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/65 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl transform rounded-xl2 bg-white shadow-2xl transition-all border border-ink/[0.04] z-10 animate-in fade-in-50 zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        
        {/* Left Column - Promotional Image (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-5/12 relative bg-ink flex-col justify-end p-10 overflow-hidden">
          <img 
            src="/products/tom-rumble-pN6xSeiHCr0-unsplash.jpg" 
            alt="Aurex Cookware" 
            className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-[10s] hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent opacity-90" />
          
          <div className="relative z-10 text-cream">
            <span className="inline-block bg-gold text-ink text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm mb-4">
              New Member Offer
            </span>
            <h3 className="text-3xl font-serif text-white leading-tight mb-3">
              Unlock 15% Off
            </h3>
            <p className="text-cream/70 text-sm font-light leading-relaxed">
              Create an account today and enjoy a 15% discount on your first purchase of our premium triply and cast iron cookware.
            </p>
          </div>
        </div>

        {/* Right Column - Auth Forms */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-12 relative flex flex-col justify-center">
          {/* Close Button with generous clearance */}
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
              {/* New Member 15% OFF Banner */}
              <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sand/40 to-copper/10 border border-amber-600/20 p-3 sm:p-3.5 shadow-2xs">
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
                    className="text-[11px] font-black uppercase text-copper hover:text-copper-dark hover:underline flex-shrink-0 whitespace-nowrap bg-white px-2.5 py-1.5 rounded-xl border border-copper/25 shadow-2xs active:scale-95 transition-all"
                  >
                    Claim →
                  </button>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-ink">Welcome back</h2>
              <p className="mt-1 text-xs sm:text-sm text-ink/60">Sign in to your Aurex account.</p>

              <form onSubmit={handleLoginSubmit} className="mt-5 sm:mt-6 space-y-4">
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

              <p className="mt-5 sm:mt-7 text-center text-xs sm:text-sm text-ink/60 font-medium border-t border-ink/[0.06] pt-4 sm:pt-5">
                New to Aurex?{" "}
                <button 
                  onClick={() => openAuthModal("signup")} 
                  className="font-bold text-copper hover:text-gold transition-colors outline-none"
                >
                  Create an account (Get 15% OFF)
                </button>
              </p>

              {import.meta.env.DEV && (
                <div className="mt-4 rounded-xl bg-sand/40 p-2.5 text-center text-[10px] text-ink/60 leading-relaxed border border-ink/[0.04]">
                  <b className="text-ink/80">Dev only:</b> admin@aurexindia.com · admin123
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-sm mx-auto w-full pt-2 sm:pt-0">
              {/* 15% OFF Welcome Banner for Signup */}
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
