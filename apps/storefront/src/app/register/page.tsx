"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerUser, fetchProfile } from "@/lib/api-auth";
import { mergeGuestCart } from "@/lib/api-cart";
import { setAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { VerifyEmailOtp } from "@/components/auth/verify-email-otp";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "At least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [email, setEmail] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const setUser = useAuthStore((s) => s.setUser);
  const setCart = useCartStore((s) => s.setCart);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const res = await registerUser(data);
      setEmail(res.email);
      setInfoMessage(res.message);
      setStep("verify");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  async function completeSignIn(accessToken: string) {
    setAccessToken(accessToken);
    try {
      const profile = await fetchProfile();
      setUser(profile);
      const cart = await mergeGuestCart();
      setCart(cart);
      router.push("/account");
    } catch (err) {
      setAccessToken(null);
      throw err;
    }
  }

  if (step === "verify") {
    return (
      <VerifyEmailOtp
        email={email}
        infoMessage={infoMessage}
        onVerified={completeSignIn}
        onBack={() => {
          setStep("details");
          setServerError("");
        }}
      />
    );
  }

  return (
    <AuthLayout title="Create account" subtitle="Join to check out faster and track your orders.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...registerField("name")} error={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...registerField("email")} error={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" {...registerField("phone")} error={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...registerField("password")}
            error={errors.password?.message}
          />
        </div>
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending code…" : "Create account"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-muted uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleAuthButton redirect="/account" text="signup_with" onError={setServerError} />

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
