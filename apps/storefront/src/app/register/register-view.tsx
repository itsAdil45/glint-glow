"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AuthField } from "@/components/auth/auth-field";
import { AuthSubmit } from "@/components/auth/auth-submit";
import { PasswordStrength } from "@/components/auth/password-strength";
import { registerUser, fetchProfile } from "@/lib/api-auth";
import { mergeGuestCart } from "@/lib/api-cart";
import { setAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { showApiError } from "@/lib/toast";
import toast from "react-hot-toast";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { VerifyEmailOtp } from "@/components/auth/verify-email-otp";
import { User, Mail, Phone, Lock } from "lucide-react";

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
  const setUser = useAuthStore((s) => s.setUser);
  const setCart = useCartStore((s) => s.setCart);

  const {
    register: registerField,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onTouched" });
  const password = useWatch({ control, name: "password" });

  async function onSubmit(data: FormData) {
    try {
      const res = await registerUser(data);
      setEmail(res.email);
      setInfoMessage(res.message);
      setStep("verify");
    } catch (err) {
      showApiError(err, "Something went wrong");
    }
  }

  async function completeSignIn(accessToken: string) {
    setAccessToken(accessToken);
    const profile = await fetchProfile();
    setUser(profile);
    const cart = await mergeGuestCart();
    setCart(cart);
    router.push("/account");
  }

  if (step === "verify") {
    return (
      <VerifyEmailOtp
        email={email}
        infoMessage={infoMessage}
        onVerified={completeSignIn}
        onBack={() => setStep("details")}
      />
    );
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join to check out faster and track your orders."
      switcher={{ prompt: "Already a member?", label: "Log in", href: "/login" }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <AuthField
          id="name"
          label="Full name"
          autoComplete="name"
          icon={<User size={18} />}
          {...registerField("name")}
          error={errors.name?.message}
          valid={touchedFields.name}
        />
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          icon={<Mail size={18} />}
          {...registerField("email")}
          error={errors.email?.message}
          valid={touchedFields.email}
        />
        <AuthField
          id="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          icon={<Phone size={18} />}
          {...registerField("phone")}
          error={errors.phone?.message}
        />
        <div>
          <AuthField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            icon={<Lock size={18} />}
            {...registerField("password")}
            error={errors.password?.message}
          />
          <PasswordStrength password={password ?? ""} />
        </div>
        <div className="pt-1">
          <AuthSubmit loading={isSubmitting} loadingText="Sending code…">
            Create account
          </AuthSubmit>
        </div>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-soft">or continue with</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleAuthButton redirect="/account" text="signup_with" onError={(msg) => toast.error(msg)} />
    </AuthLayout>
  );
}
