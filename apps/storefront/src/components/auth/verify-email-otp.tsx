"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <Label htmlFor="otp">6-digit code</Label>
          <Input
            id="otp"
            required
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="text-center text-lg tracking-[0.5em] font-medium"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>
        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={onBack} className="text-muted underline underline-offset-4">
            Use a different email
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-muted underline underline-offset-4 disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
