import { apiFetch } from "@/lib/api";

export interface HeroSlide {
  _id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string;
  imageAlt?: string;
  order: number;
  isActive: boolean;
}

export interface HeroSlideInput {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string;
  imageAlt?: string;
  order?: number;
  isActive?: boolean;
}

export async function fetchAdminHeroSlides(): Promise<HeroSlide[]> {
  return apiFetch<HeroSlide[]>("/hero-slides/admin/all");
}

export async function createHeroSlide(data: HeroSlideInput): Promise<HeroSlide> {
  return apiFetch<HeroSlide>("/hero-slides", { method: "POST", body: JSON.stringify(data) });
}

export async function updateHeroSlide(id: string, data: Partial<HeroSlideInput>): Promise<HeroSlide> {
  return apiFetch<HeroSlide>(`/hero-slides/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteHeroSlide(id: string): Promise<{ message: string }> {
  return apiFetch(`/hero-slides/${id}`, { method: "DELETE" });
}
