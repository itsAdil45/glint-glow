"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AuthField } from "@/components/auth/auth-field";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { loginUser, fetchProfile } from "@/lib/api-auth";
import { mergeGuestCart } from "@/lib/api-cart";
import { resolveAuthRedirect } from "@/lib/auth-redirect";
import { setAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { ApiError } from "@/lib/api";
import { showApiError } from "@/lib/toast";
import toast from "react-hot-toast";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { VerifyEmailOtp } from "@/components/auth/verify-email-otp";
import { Mail, Lock } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ?redirect= if present, else the page they came from, else /account
  const redirect = resolveAuthRedirect(searchParams.get("redirect"));
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
    try {
      const { accessToken } = await loginUser(data);
      await completeSignIn(accessToken);
    } catch (err) {
      if (err instanceof ApiError && (err.body as { code?: string })?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(data.email);
        return;
      }
      showApiError(err, "Something went wrong");
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
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to track your orders and check out faster."
      switcher={{ prompt: "New to GLOWN?", label: "Create account", href: "/register" }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          icon={<Mail size={18} />}
          {...register("email")}
          error={errors.email?.message}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          icon={<Lock size={18} />}
          hint={
            <Link
              href="/forgot-password"
              className="-m-3 inline-block p-3 text-xs text-accent-ink underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          }
          {...register("password")}
          error={errors.password?.message}
        />
        <AuthSubmit loading={isSubmitting} loadingText="Logging in…">
          Log in
        </AuthSubmit>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">or continue with</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleAuthButton redirect={redirect} text="signin_with" onError={(msg) => toast.error(msg)} />
    </AuthLayout>
  );
}
