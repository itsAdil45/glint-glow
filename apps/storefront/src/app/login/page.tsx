"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginUser, fetchProfile } from "@/lib/api-auth";
import { mergeGuestCart } from "@/lib/api-cart";
import { setAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { VerifyEmailOtp } from "@/components/auth/verify-email-otp";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const [serverError, setServerError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const setUser = useAuthStore((s) => s.setUser);
  const setCart = useCartStore((s) => s.setCart);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function completeSignIn(accessToken: string) {
    setAccessToken(accessToken);
    const profile = await fetchProfile();
    setUser(profile);
    const cart = await mergeGuestCart();
    setCart(cart);
    router.push(redirect);
  }

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const { accessToken } = await loginUser(data);
      await completeSignIn(accessToken);
    } catch (err) {
      if (err instanceof ApiError && (err.body as { code?: string })?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(data.email);
        return;
      }
      setServerError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  if (unverifiedEmail) {
    return (
      <VerifyEmailOtp
        email={unverifiedEmail}
        infoMessage="Your email isn't verified yet. Enter the code we sent when you signed up, or resend a new one."
        onVerified={completeSignIn}
        onBack={() => setUnverifiedEmail("")}
      />
    );
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back — enter your details below.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} error={errors.email?.message} />
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted hover:text-ink">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />
        </div>
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-muted uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleAuthButton redirect={redirect} text="signin_with" onError={setServerError} />

      <p className="text-center text-sm text-muted mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-ink underline underline-offset-4">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
