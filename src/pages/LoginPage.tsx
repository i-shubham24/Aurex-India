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
          {/* New Member Offer */}
          <div className="mb-5 flex items-center justify-between gap-2.5 rounded-2xl bg-gradient-to-r from-copper/10 via-sand/40 to-amber-500/10 border border-copper/30 p-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-copper text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm">
                15%
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-ink flex items-center gap-1.5">
                  <span>New Member Offer</span>
                  <span className="text-[10px] font-mono font-bold bg-white text-copper px-1.5 py-0.5 rounded border border-copper/30">NEWUSER15</span>
                </p>
                <p className="text-[11px] text-ink/65 leading-tight mt-0.5">
                  New user? Sign up & get 15% off your 1st order!
                </p>
              </div>
            </div>
            <Link
              to="/signup"
              className="text-[11px] font-black uppercase text-copper hover:text-copper-dark hover:underline flex-shrink-0 whitespace-nowrap bg-white px-2.5 py-1.5 rounded-xl border border-copper/25 shadow-2xs active:scale-95 transition-all"
            >
              Claim →
            </Link>
          </div>

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
