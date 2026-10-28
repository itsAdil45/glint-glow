import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Live password guidance. Only the 8-character rule is enforced (by the form's
// validation); the other two are recommendations and are labelled as such so
// the checklist never implies a rule that won't actually block submission.
export function PasswordStrength({ password }: { password: string }) {
  const rules = [
    { label: "At least 8 characters", met: password.length >= 8, required: true },
    { label: "A number or a symbol", met: /\d|[^A-Za-z0-9]/.test(password), required: false },
    {
      label: "Lowercase and uppercase letters",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      required: false,
    },
  ];

  const score = password.length >= 8 ? rules.filter((r) => r.met).length : 0;
  const tone = ["bg-line", "bg-accent", "bg-gold", "bg-success"][score];

  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors", i <= score ? tone : "bg-line")}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              rule.met ? "text-success" : "text-ink-soft",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border",
                rule.met ? "border-success bg-success text-white" : "border-ink/25",
              )}
            >
              {rule.met && <Check size={10} strokeWidth={3} />}
            </span>
            <span>
              {rule.label}
              {!rule.required && <span className="text-ink-soft/70"> (recommended)</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
