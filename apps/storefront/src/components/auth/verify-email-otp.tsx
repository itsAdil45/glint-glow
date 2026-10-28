"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AuthField } from "@/components/auth/auth-field";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { verifyRegistrationOtp, resendRegistrationOtp } from "@/lib/api-auth";
import { showApiError, showSuccess } from "@/lib/toast";

export function VerifyEmailOtp({
  email,
  infoMessage,
  onVerified,
  onBack,
}: {
  email: string;
  infoMessage?: string;
  onVerified: (accessToken: string) => Promise<void>;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { accessToken } = await verifyRegistrationOtp(email, otp);
      await onVerified(accessToken);
    } catch (err) {
      showApiError(err, "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await resendRegistrationOtp(email);
      showSuccess(res.message);
    } catch (err) {
      showApiError(err, "Could not resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout title="Verify your email" subtitle={infoMessage || `We sent a code to ${email}`}>
      <form onSubmit={handleVerify} className="space-y-7">
        <AuthField
          id="otp"
          label="6-digit code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="pl-[0.6em] text-center text-2xl font-medium tracking-[0.6em]"
        />
        <AuthSubmit loading={loading} loadingText="Verifying…">
          Verify &amp; continue
        </AuthSubmit>
        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={onBack} className="text-ink-soft underline underline-offset-4 hover:text-ink">
            Use a different email
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-accent-ink underline underline-offset-4 disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
