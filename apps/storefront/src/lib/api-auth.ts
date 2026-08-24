import { apiFetch } from "@/lib/api";
import { UserProfile } from "@/types";

export interface AuthResponse {
  accessToken: string;
}

export interface RegisterStartResponse {
  message: string;
  email: string;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<RegisterStartResponse> {
  return apiFetch<RegisterStartResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
}

export async function verifyRegistrationOtp(email: string, otp: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register/verify", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, otp }),
  });
}

export async function resendRegistrationOtp(email: string): Promise<{ message: string }> {
  return apiFetch("/auth/register/resend", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email }),
  });
}

export async function loginUser(data: { email: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(data),
  });
}

export async function googleAuth(idToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ idToken }),
  });
}

export async function logoutUser(): Promise<{ message: string }> {
  return apiFetch("/auth/logout", { method: "POST", auth: false });
}

export async function requestPasswordResetOtp(email: string) {
  return apiFetch("/auth/otp/request", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, purpose: "password_reset" }),
  });
}

export async function verifyPasswordResetOtp(email: string, otp: string, newPassword: string) {
  return apiFetch("/auth/otp/verify-reset", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

export async function requestChangePasswordOtp() {
  return apiFetch("/auth/otp/request-authenticated", { method: "POST" });
}

export async function verifyChangePasswordOtp(otp: string, newPassword: string) {
  return apiFetch("/auth/otp/verify-authenticated", {
    method: "POST",
    body: JSON.stringify({ otp, newPassword }),
  });
}

export async function fetchProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/account/profile");
}

export async function updateProfile(data: { name?: string; phone?: string }): Promise<UserProfile> {
  return apiFetch<UserProfile>("/account/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
