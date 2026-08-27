import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PasswordMeter from "@/components/PasswordMeter";
import {
  emailError,
  passwordError,
} from "@/lib/validation";

type Field = "firstName" | "lastName" | "email" | "password";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<Record<Field, string>>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const validators: Record<Field, (v: string) => string | null> = {
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

  function validateField(field: Field, v: string) {
    const err = validators[field](v);
    setErrors((e) => ({ ...e, [field]: err ?? undefined }));
    return err;
  }

  function set(field: Field, v: string) {
    setValues((s) => ({ ...s, [field]: v }));
    if (touched[field]) validateField(field, v);
  }

  function blur(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
    validateField(field, values[field]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    // Validate everything on submit
    const allTouched = { firstName: true, lastName: true, email: true, password: true };
    setTouched(allTouched);
    const nextErrors: Partial<Record<Field, string>> = {};
    (Object.keys(validators) as Field[]).forEach((f) => {
      const err = validators[f](values[f]);
      if (err) nextErrors[f] = err;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      await signUp({
        fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.trim(),
        password: values.password,
      });
      navigate("/account", { replace: true });
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const errCls = (f: Field) =>
    touched[f] && errors[f] ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "";

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* 15% OFF Welcome Banner for Signup */}
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sand/40 to-copper/10 border border-emerald-500/30 p-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm">
              15%
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-ink flex items-center gap-1.5">
                <span>15% Welcome Discount</span>
                <span className="text-[10px] font-mono font-bold bg-white text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-300">NEWUSER15</span>
              </p>
              <p className="text-[11px] text-ink/65 leading-tight mt-0.5">
                Your 15% coupon will be automatically ready at checkout!
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-ink/60">Join Aurex & unlock your 15% welcome savings.</p>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  value={values.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  onBlur={() => blur("firstName")}
                  className={`input ${errCls("firstName")}`}
                  placeholder="Priya"
                  autoComplete="given-name"
                />
                {touched.firstName && errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  value={values.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  onBlur={() => blur("lastName")}
                  className={`input ${errCls("lastName")}`}
                  placeholder="Sharma"
                  autoComplete="family-name"
                />
                {touched.lastName && errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => blur("email")}
                className={`input ${errCls("email")}`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={values.password}
                onChange={(e) => set("password", e.target.value)}
                onBlur={() => blur("password")}
                className={`input ${errCls("password")}`}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <PasswordMeter value={values.password} />
              {touched.password && errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-copper hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
