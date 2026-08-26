import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PasswordMeter from "@/components/PasswordMeter";
import {
  nameError,
  emailError,
  phoneError,
  passwordError,
  normalizePhone,
} from "@/lib/validation";

type Field = "fullName" | "email" | "phone" | "password";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<Record<Field, string>>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const validators: Record<Field, (v: string) => string | null> = {
    fullName: nameError,
    email: emailError,
    phone: phoneError,
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
    const allTouched = { fullName: true, email: true, phone: true, password: true };
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
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: normalizePhone(values.phone),
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
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-ink/60">Join Aurex for faster checkout and order tracking.</p>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name"
                value={values.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                onBlur={() => blur("fullName")}
                className={`input ${errCls("fullName")}`}
                placeholder="Priya Sharma"
                autoComplete="name"
              />
              {touched.fullName && errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              )}
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
              <label className="label" htmlFor="phone">Mobile number</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink/15 bg-sand px-3 text-sm text-ink/60">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  onBlur={() => blur("phone")}
                  className={`input rounded-l-none ${errCls("phone")}`}
                  placeholder="98765 43210"
                  autoComplete="tel"
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
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
