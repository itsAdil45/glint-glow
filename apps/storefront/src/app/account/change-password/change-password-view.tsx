"use client";

import { useState } from "react";
import { requestChangePasswordOtp, verifyChangePasswordOtp } from "@/lib/api-auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

export default function ChangePasswordPage() {
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRequestOtp() {
    setLoading(true);
    setError("");
    try {
      await requestChangePasswordOtp();
      setStep("sent");
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
      await verifyChangePasswordOtp(otp, newPassword);
      setSuccess(true);
      setStep("idle");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl mb-6">Change password</h2>

      {step === "idle" && (
        <div>
          <p className="text-sm text-muted mb-4">
            We&apos;ll email a one-time code to your registered email address to confirm the change.
          </p>
          {success && <p className="text-sm text-accent-ink mb-4">Password updated successfully.</p>}
          {error && <p className="text-sm text-danger mb-4">{error}</p>}
          <Button onClick={handleRequestOtp} disabled={loading}>
            {loading ? "Sending…" : "Send verification code"}
          </Button>
        </div>
      )}

      {step === "sent" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-muted">Enter the code we emailed you and your new password.</p>
          <div>
            <Label htmlFor="otp">6-digit code</Label>
            <Input
              id="otp"
              required
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep("idle")}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
