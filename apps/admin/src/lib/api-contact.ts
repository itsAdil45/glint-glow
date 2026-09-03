import { apiFetch } from "@/lib/api";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function fetchAdminContactMessages(): Promise<ContactMessage[]> {
  return apiFetch<ContactMessage[]>("/contact/admin/all");
}

export async function updateContactMessage(
  id: string,
  data: { isRead: boolean },
): Promise<ContactMessage> {
  return apiFetch<ContactMessage>(`/contact/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteContactMessage(id: string): Promise<{ message: string }> {
  return apiFetch(`/contact/${id}`, { method: "DELETE" });
}
