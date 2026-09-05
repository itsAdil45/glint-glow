"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestPasswordResetOtp, verifyPasswordResetOtp } from "@/lib/api-auth";
import { ApiError } from "@/lib/api";
import { Mail, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await requestPasswordResetOtp(email);
      setMessage((res as { message: string }).message);
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyPasswordResetOtp(email, otp, newPassword);
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  if (step === "request") {
    return (
      <AuthLayout
        title="Forgot password"
        subtitle="Enter your email and we'll send a one-time code."
      >
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              icon={<Mail size={16} />}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted mt-6">
          <Link href="/login" className="underline underline-offset-4">
            Back to login
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Enter code" subtitle={message || `We sent a code to ${email}`}>
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
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            icon={<Lock size={16} />}
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Updating…" : "Reset password"}
        </Button>
        <button
          type="button"
          onClick={() => setStep("request")}
          className="w-full text-center text-xs text-muted underline underline-offset-4"
        >
          Use a different email
        </button>
      </form>
    </AuthLayout>
  );
}
