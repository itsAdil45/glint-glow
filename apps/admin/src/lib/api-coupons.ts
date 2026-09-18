import { apiFetch } from "@/lib/api";

export type CouponType = "percentage" | "fixed";

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  maxDiscountAmount?: number;
  minOrderValue: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  description?: string;
}

export async function fetchAdminCoupons(): Promise<Coupon[]> {
  return apiFetch<Coupon[]>("/coupons");
}

export async function createCoupon(data: CouponInput): Promise<Coupon> {
  return apiFetch<Coupon>("/coupons", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCoupon(id: string, data: Partial<CouponInput>): Promise<Coupon> {
  return apiFetch<Coupon>(`/coupons/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteCoupon(id: string): Promise<{ message: string }> {
  return apiFetch(`/coupons/${id}`, { method: "DELETE" });
}
