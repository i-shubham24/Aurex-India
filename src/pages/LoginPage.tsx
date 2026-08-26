import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Seo from "@/components/Seo";
import { emailError } from "@/lib/validation";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const id = email.trim();
    const emailValidation = emailError(id);
    if (emailValidation) {
      setError(emailValidation);
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setBusy(true);
    try {
      await signIn(id, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <Seo title="Login" noindex />
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-ink/60">Sign in to your Aurex account.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            New to Aurex?{" "}
            <Link to="/signup" className="font-semibold text-copper hover:underline">Create an account</Link>
          </p>
        </div>

        {import.meta.env.DEV && (
        <div className="mt-4 rounded-xl bg-sand/60 p-4 text-center text-xs text-ink/60">
          <b>Dev only:</b> admin@aurexindia.com · admin123 &nbsp;→&nbsp; opens the{" "}
          <Link to="/admin" className="text-copper underline">admin panel</Link>
        </div>
        )}
      </div>
    </div>
  );
}
