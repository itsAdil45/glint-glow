import { apiFetch } from "@/lib/api";
import { AdminUser } from "@/types";

export interface AuthResponse {
  accessToken: string;
}

export async function loginAdmin(data: { email: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
}

export async function logoutAdmin(): Promise<{ message: string }> {
  return apiFetch("/auth/logout", { method: "POST", auth: false });
}

export async function fetchProfile(): Promise<AdminUser> {
  return apiFetch<AdminUser>("/account/profile");
}
