import { apiFetch } from "@/lib/api";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
}

// Shape returned by GET /hero-slides
interface HeroSlideApiResponse {
  _id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string;
  imageAlt?: string;
}

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const slides = await apiFetch<HeroSlideApiResponse[]>("/hero-slides", { auth: false }).catch(
    () => [],
  );

  return slides.map((s) => ({
    id: s._id,
    eyebrow: s.eyebrow || "",
    title: s.title,
    subtitle: s.subtitle || "",
    ctaLabel: s.ctaLabel || "Shop Now",
    ctaHref: s.ctaHref || "/products",
    image: s.image,
    imageAlt: s.imageAlt || s.title,
  }));
}
