"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitContactMessage } from "@/lib/api-contact";
import { ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Tell us a bit more (at least 10 characters)"),
});
type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      await submitContactMessage(data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong — please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink mb-4">
          <CheckCircle2 size={22} />
        </span>
        <h3 className="font-display text-xl mb-1.5">Message sent</h3>
        <p className="text-sm text-muted leading-relaxed">
          Thanks for reaching out — we&apos;ve received your message and will get back to you soon.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register("name")} error={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} error={errors.email?.message} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" {...register("phone")} error={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="subject">Subject (optional)</Label>
          <Input id="subject" placeholder="Order question, product question, etc." {...register("subject")} error={errors.subject?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...register("message")} error={errors.message?.message} />
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
