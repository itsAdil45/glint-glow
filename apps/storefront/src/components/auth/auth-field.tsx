"use client";

import * as React from "react";
import { CircleCheck, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  /** Shows a green tick (non-password fields) once the value has been validated. */
  valid?: boolean;
  /** Right-aligned content on the label row, e.g. a "Forgot password?" link. */
  hint?: React.ReactNode;
}

// Underline-style field used across the auth pages. Passwords get a built-in
// show/hide toggle. Works with react-hook-form's register() (ref + onChange)
// and as a plain controlled input.
export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, icon, error, valid, hint, id, type = "text", className, ...props }, ref) => {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    const errorId = `${fieldId}-error`;
    const isPassword = type === "password";
    const [revealed, setRevealed] = React.useState(false);

    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={fieldId}
            className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft"
          >
            {label}
          </label>
          {hint}
        </div>

        <div
          className={cn(
            "group relative mt-1 flex items-center border-b border-ink/20 transition-colors",
            error && "border-danger",
          )}
        >
          {icon && (
            <span
              aria-hidden
              className="mr-3 text-ink-soft/70 transition-colors group-focus-within:text-accent-ink"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            type={isPassword && revealed ? "text" : type}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "auth-input h-12 w-full min-w-0 bg-transparent text-[15px] text-ink placeholder:text-muted",
              className,
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
              className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft/70 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent-ink"
            >
              {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : valid && !error ? (
            <CircleCheck aria-hidden size={18} className="shrink-0 text-success" />
          ) : null}

          {/* gold underline that draws in on focus */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-px left-0 h-0.5 w-full origin-left scale-x-0 bg-accent-ink transition-transform duration-300 group-focus-within:scale-x-100"
          />
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
AuthField.displayName = "AuthField";
