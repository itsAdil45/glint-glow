import { apiFetch } from "@/lib/api";

export type BannerLayout = "split" | "full-bleed";
export type BannerImagePosition = "left" | "right";
export type BannerTheme = "dark" | "light";

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  layout: BannerLayout;
  imagePosition: BannerImagePosition;
  theme: BannerTheme;
  position: number;
}

// Shape returned by GET /banners
interface BannerApiResponse {
  _id: string;
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
  position: number;
}

export async function fetchBanners(): Promise<Banner[]> {
  const banners = await apiFetch<BannerApiResponse[]>("/banners", { auth: false }).catch(() => []);

  return banners.map((b) => ({
    id: b._id,
    eyebrow: b.eyebrow || "",
    title: b.title,
    description: b.description || "",
    ctaLabel: b.ctaLabel || "",
    ctaHref: b.ctaHref || "/collections",
    image: b.image,
    imageAlt: b.imageAlt || b.title,
    layout: b.layout || "split",
    imagePosition: b.imagePosition || "right",
    theme: b.theme || "dark",
    position: b.position,
  }));
}
