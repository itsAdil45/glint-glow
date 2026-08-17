"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAddress } from "@/lib/api-addresses";
import { Address } from "@/types";
import { ApiError } from "@/lib/api";

const schema = z.object({
  fullName: z.string().min(2, "Required"),
  phone: z.string().min(6, "Required"),
  line1: z.string().min(2, "Required"),
  line2: z.string().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Required"),
  country: z.string().min(2, "Required"),
});
type FormData = z.infer<typeof schema>;

export function AddressForm({
  onCreated,
  onCancel,
}: {
  onCreated: (address: Address) => void;
  onCancel?: () => void;
}) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const address = await createAddress({ ...data, isDefault: false });
      onCreated(address);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Could not save address");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl bg-surface card-shadow p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} error={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} error={errors.phone?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="line1">Address line 1</Label>
        <Input id="line1" {...register("line1")} error={errors.line1?.message} />
      </div>
      <div>
        <Label htmlFor="line2">Address line 2 (optional)</Label>
        <Input id="line2" {...register("line2")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} error={errors.city?.message} />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register("state")} />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" {...register("postalCode")} error={errors.postalCode?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register("country")} error={errors.country?.message} />
      </div>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save address"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
