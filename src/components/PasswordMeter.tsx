import { passwordStrength } from "@/lib/validation";

/** Live password-strength bar + label. Purely visual feedback; the hard
 *  requirement is enforced separately by passwordError(). */
export default function PasswordMeter({ value }: { value: string }) {
  if (!value) return null;
  const { score, label, color } = passwordStrength(value);
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= score ? color : "bg-ink/10"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-ink/55">
        Password strength: <span className="font-medium text-ink/75">{label}</span>
      </p>
    </div>
  );
}
