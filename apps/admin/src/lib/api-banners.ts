import { apiFetch } from "@/lib/api";

export type BannerLayout = "split" | "full-bleed";
export type BannerImagePosition = "left" | "right";
export type BannerTheme = "dark" | "light";

export interface Banner {
  _id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string;
  imageAlt?: string;
  layout: BannerLayout;
  imagePosition: BannerImagePosition;
  theme: BannerTheme;
  position: number;
  isActive: boolean;
}

export interface BannerInput {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string;
  imageAlt?: string;
  layout?: BannerLayout;
  imagePosition?: BannerImagePosition;
  theme?: BannerTheme;
  position?: number;
  isActive?: boolean;
}

export async function fetchAdminBanners(): Promise<Banner[]> {
  return apiFetch<Banner[]>("/banners/admin/all");
}

export async function createBanner(data: BannerInput): Promise<Banner> {
  return apiFetch<Banner>("/banners", { method: "POST", body: JSON.stringify(data) });
}

export async function updateBanner(id: string, data: Partial<BannerInput>): Promise<Banner> {
  return apiFetch<Banner>(`/banners/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteBanner(id: string): Promise<{ message: string }> {
  return apiFetch(`/banners/${id}`, { method: "DELETE" });
}
