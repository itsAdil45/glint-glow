import { apiFetch } from "@/lib/api";

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function submitContactMessage(data: ContactMessageInput): Promise<{ _id: string }> {
  return apiFetch<{ _id: string }>("/contact", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
}
