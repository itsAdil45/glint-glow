"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAdmin, fetchProfile } from "@/lib/api-auth";
import { setAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const { accessToken } = await loginAdmin(data);
      setAccessToken(accessToken);
      const profile = await fetchProfile();
      if (profile.role !== "admin") {
        setAccessToken(null);
        setServerError("This account doesn't have admin access.");
        return;
      }
      setUser(profile);
      router.push("/");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm bg-surface border border-line rounded-lg p-8">
        <h1 className="text-xl font-semibold text-center">GLOWN Admin</h1>
        <p className="text-sm text-muted text-center mt-1">Sign in to manage your store.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} error={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>
          {serverError && <p className="text-sm text-danger">{serverError}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
