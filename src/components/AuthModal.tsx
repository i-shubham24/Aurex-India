import React, { useState } from "react";
import { X } from "lucide-react";
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

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-email">Email</label>
                <input
                  id="modal-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input text-sm"
                  placeholder="you@example.com"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-firstname">First name</label>
                  <input
                    id="modal-firstname"
                    value={signupValues.firstName}
                    onChange={(e) => setSignupVal("firstName", e.target.value)}
                    onBlur={() => blurSignupField("firstName")}
                    className={`input text-sm ${errCls("firstName")}`}
                    placeholder="Priya"
                    autoComplete="given-name"
                  />
                  {signupTouched.firstName && signupErrors.firstName && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="label text-xs font-extrabold uppercase text-ink/55" htmlFor="modal-lastname">Last name</label>
                  <input
                    id="modal-lastname"
                    value={signupValues.lastName}
                    onChange={(e) => setSignupVal("lastName", e.target.value)}
                    onBlur={() => blurSignupField("lastName")}
                    className={`input text-sm ${errCls("lastName")}`}
                    placeholder="Sharma"
                    autoComplete="family-name"
                  />
                  {signupTouched.lastName && signupErrors.lastName && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{signupErrors.lastName}</p>
                  )}
                </div>
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
