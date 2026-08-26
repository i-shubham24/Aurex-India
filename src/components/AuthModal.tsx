import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import OtpForm from "@/components/OtpForm";
import PasswordMeter from "@/components/PasswordMeter";
import {
  nameError,
  emailError,
  phoneError,
  passwordError,
  normalizePhone,
} from "@/lib/validation";

export default function AuthModal() {
  const { authModalOpen, authModalMode, openAuthModal, closeAuthModal, signIn, signUp } = useAuth();

  // Login states
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // Signup states
  const [signupValues, setSignupValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [signupErrors, setSignupErrors] = useState<Partial<Record<string, string>>>({});
  const [signupTouched, setSignupTouched] = useState<Partial<Record<string, boolean>>>({});
  const [signupFormError, setSignupFormError] = useState("");
  const [signupBusy, setSignupBusy] = useState(false);

  if (!authModalOpen) return null;

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const id = loginEmail.trim();
    if (!id) {
      setLoginError("Please enter your email or mobile number.");
      return;
    }
    if (emailError(id) && phoneError(id)) {
      setLoginError("Enter a valid email address or 10-digit mobile number.");
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
    fullName: nameError,
    email: emailError,
    phone: phoneError,
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
    const allTouched = { fullName: true, email: true, phone: true, password: true };
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
        fullName: signupValues.fullName.trim(),
        email: signupValues.email.trim(),
        phone: normalizePhone(signupValues.phone),
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
        onClick={closeAuthModal}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md transform rounded-xl2 bg-white p-8 shadow-2xl transition-all border border-ink/[0.04] z-10 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink/40 hover:bg-sand/65 hover:text-ink transition-all"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {authModalMode === "login" ? (
          <div>
            <h2 className="text-2xl font-black text-ink">Welcome back</h2>
            <p className="mt-1 text-xs text-ink/60">Sign in to your Aurex account.</p>

            {/* Mode switch */}
            <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-sand p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLoginMode("password")}
                className={`rounded-full py-2 transition-all ${
                  loginMode === "password" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("otp")}
                className={`rounded-full py-2 transition-all ${
                  loginMode === "otp" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                }`}
              >
                OTP
              </button>
            </div>

            {loginMode === "otp" ? (
              <div className="mt-6">
                <OtpForm onSuccess={closeAuthModal} />
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-email">Email or mobile number</label>
                  <input
                    id="modal-email"
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="input text-sm"
                    placeholder="you@example.com or 98765 43210"
                  />
                </div>
                <div>
                  <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-password">Password</label>
                  <input
                    id="modal-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {loginError && <p className="text-xs text-red-600 font-medium">{loginError}</p>}
                <button type="submit" disabled={loginBusy} className="btn-primary w-full py-3 text-sm font-bold mt-2">
                  {loginBusy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-ink/60 font-medium">
              New to Aurex?{" "}
              <button 
                onClick={() => openAuthModal("signup")} 
                className="font-bold text-copper hover:text-gold transition-colors outline-none"
              >
                Create an account
              </button>
            </p>

            {import.meta.env.DEV && (
              <div className="mt-5 rounded-xl bg-sand/65 p-3.5 text-center text-[10px] text-ink/55 leading-normal">
                <b>Dev only:</b> admin@aurexindia.com · admin123
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black text-ink">Create your account</h2>
            <p className="mt-1 text-xs text-ink/60">Join Aurex for faster checkout and order tracking.</p>

            <form onSubmit={handleSignupSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-name">Full name</label>
                <input
                  id="modal-name"
                  value={signupValues.fullName}
                  onChange={(e) => setSignupVal("fullName", e.target.value)}
                  onBlur={() => blurSignupField("fullName")}
                  className={`input text-sm ${errCls("fullName")}`}
                  placeholder="Priya Sharma"
                  autoComplete="name"
                />
                {signupTouched.fullName && signupErrors.fullName && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-signup-email">Email</label>
                <input
                  id="modal-signup-email"
                  type="email"
                  value={signupValues.email}
                  onChange={(e) => setSignupVal("email", e.target.value)}
                  onBlur={() => blurSignupField("email")}
                  className={`input text-sm ${errCls("email")}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {signupTouched.email && signupErrors.email && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.email}</p>
                )}
              </div>

              <div>
                <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-phone">Mobile number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink/15 bg-sand px-3 text-sm text-ink/60">
                    +91
                  </span>
                  <input
                    id="modal-phone"
                    type="tel"
                    inputMode="numeric"
                    value={signupValues.phone}
                    onChange={(e) => setSignupVal("phone", e.target.value)}
                    onBlur={() => blurSignupField("phone")}
                    className={`input rounded-l-none text-sm ${errCls("phone")}`}
                    placeholder="98765 43210"
                    autoComplete="tel"
                  />
                </div>
                {signupTouched.phone && signupErrors.phone && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-signup-password">Password</label>
                <input
                  id="modal-signup-password"
                  type="password"
                  value={signupValues.password}
                  onChange={(e) => setSignupVal("password", e.target.value)}
                  onBlur={() => blurSignupField("password")}
                  className={`input text-sm ${errCls("password")}`}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <PasswordMeter value={signupValues.password} />
                {signupTouched.password && signupErrors.password && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.password}</p>
                )}
              </div>

              {signupFormError && <p className="text-xs text-red-600 font-medium">{signupFormError}</p>}
              <button type="submit" disabled={signupBusy} className="btn-primary w-full py-3 text-sm font-bold mt-2">
                {signupBusy ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-ink/60 font-medium">
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
  );
}
