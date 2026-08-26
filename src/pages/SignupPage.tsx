import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Seo from "@/components/Seo";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function validPhone(p: string) {
    return /^[6-9]\d{9}$/.test(p.replace(/\D/g, "").slice(-10));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validPhone(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await signUp({ fullName, email, phone: phone.replace(/\D/g, "").slice(-10), password });
      navigate("/account", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <Seo title="Create Account" noindex />
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-ink/60">Join Aurex for faster checkout and order tracking.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" required value={fullName}
                onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Mobile number</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink/15 bg-sand px-3 text-sm text-ink/60">
                  +91
                </span>
                <input id="phone" type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)} className="input rounded-l-none" placeholder="98765 43210" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 6 characters" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
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
