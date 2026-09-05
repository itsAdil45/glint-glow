"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";
import { updateProfile } from "@/lib/api-auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) reset({ name: user.name, phone: user.phone || "" });
  }, [user, reset]);

  async function onSubmit(data: FormData) {
    setServerError("");
    setSuccess(false);
    try {
      const updated = await updateProfile(data);
      setUser(updated);
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Could not update profile");
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl mb-6">Profile details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register("name")} error={errors.name?.message} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user.email} disabled className="opacity-60" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} error={errors.phone?.message} />
        </div>
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        {success && <p className="text-sm text-accent-ink">Profile updated.</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
