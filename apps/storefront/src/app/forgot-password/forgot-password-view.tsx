"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AuthField } from "@/components/auth/auth-field";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { PasswordStrength } from "@/components/auth/password-strength";
import { requestPasswordResetOtp, verifyPasswordResetOtp } from "@/lib/api-auth";
import { showApiError, showSuccess } from "@/lib/toast";
import { Mail, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordResetOtp(email);
      setMessage((res as { message: string }).message);
      setStep("verify");
    } catch (err) {
      showApiError(err, "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyPasswordResetOtp(email, otp, newPassword);
      showSuccess("Password reset — you can now log in.");
      router.push("/login");
    } catch (err) {
      showApiError(err, "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  const switcher = { prompt: "Remembered it?", label: "Log in", href: "/login" };

  if (step === "request") {
    return (
      <AuthLayout
        title="Forgot password"
        subtitle="Enter your email and we'll send a one-time code."
        switcher={switcher}
      >
        <form onSubmit={handleRequest} className="space-y-7">
          <AuthField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            icon={<Mail size={18} />}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthSubmit loading={loading} loadingText="Sending…">
            Send code
          </AuthSubmit>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Enter code" subtitle={message || `We sent a code to ${email}`} switcher={switcher}>
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
        <div>
          <AuthField
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            icon={<Lock size={18} />}
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordStrength password={newPassword} />
        </div>
        <AuthSubmit loading={loading} loadingText="Updating…">
          Reset password
        </AuthSubmit>
        <button
          type="button"
          onClick={() => setStep("request")}
          className="w-full text-center text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Use a different email
        </button>
      </form>
    </AuthLayout>
  );
}
