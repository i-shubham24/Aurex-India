import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Two-step phone OTP: enter number → receive code → verify.
 * On the mock backend the code is shown on screen (devCode) since there's no
 * SMS provider; on Supabase a real SMS is sent and no code is surfaced.
 */
export default function OtpForm({ redirectTo = "/account" }: { redirectTo?: string }) {
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await requestOtp(phone);
      setDevCode(res.devCode);
      setMessage(res.message);
      setStep("code");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await verifyOtp(phone, code, name || undefined);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendCode} className="space-y-4">
        <div>
          <label className="label" htmlFor="otp-name">Full name (optional)</label>
          <input id="otp-name" value={name} onChange={(e) => setName(e.target.value)}
            className="input" placeholder="Priya Sharma" />
        </div>
        <div>
          <label className="label" htmlFor="otp-phone">Mobile number</label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink/15 bg-sand px-3 text-sm text-ink/60">+91</span>
            <input id="otp-phone" type="tel" required value={phone}
              onChange={(e) => setPhone(e.target.value)} className="input rounded-l-none" placeholder="98765 43210" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3">
          {busy ? "Sending OTP…" : "Send OTP"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      <p className="text-sm text-ink/60">{message}</p>
      {devCode && (
        <div className="rounded-lg bg-copper/10 px-3 py-2 text-center text-sm text-copper">
          Dev mode — your OTP is <b className="tracking-widest">{devCode}</b>
        </div>
      )}
      <div>
        <label className="label" htmlFor="otp-code">Enter 6-digit OTP</label>
        <input id="otp-code" inputMode="numeric" maxLength={6} required value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="input text-center text-lg tracking-[0.4em]" placeholder="••••••" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy || code.length < 6} className="btn-primary w-full py-3">
        {busy ? "Verifying…" : "Verify & continue"}
      </button>
      <button type="button" onClick={() => { setStep("phone"); setCode(""); setError(""); }}
        className="btn-ghost w-full text-sm">
        ← Change number
      </button>
    </form>
  );
}
