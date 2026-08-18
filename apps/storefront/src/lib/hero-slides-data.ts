// Dummy data for the homepage hero slider. Shaped the way a real
// "hero banners" endpoint would return it, so swapping `fetchHeroSlides`
// for a real backend call later is a one-function change.

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

const DUMMY_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    eyebrow: "New Season",
    title: "Glint Glow",
    subtitle: "Skincare and makeup essentials, chosen with care.",
    ctaLabel: "Shop Skincare",
    ctaHref: "/category/skincare",
    image: "https://picsum.photos/seed/hero-skincare/1800/700",
    imageAlt: "Skincare essentials",
  },
  {
    id: "slide-2",
    eyebrow: "Just Landed",
    title: "Soft Lace",
    subtitle: "The new lingerie edit — comfort that still feels beautiful.",
    ctaLabel: "Shop Lingerie",
    ctaHref: "/category/lingerie",
    image: "https://picsum.photos/seed/hero-lingerie/1800/700",
    imageAlt: "New lingerie collection",
  },
  {
    id: "slide-3",
    eyebrow: "Editor's Pick",
    title: "Bare Face",
    subtitle: "Foundations and concealers for a natural, all-day finish.",
    ctaLabel: "Shop Makeup",
    ctaHref: "/category/makeup",
    image: "https://picsum.photos/seed/hero-makeup/1800/700",
    imageAlt: "Makeup essentials",
  },
  {
    id: "slide-4",
    eyebrow: "Signature Scent",
    title: "Lumière",
    subtitle: "A fragrance edit built around what lingers after you leave the room.",
    ctaLabel: "Shop Fragrance",
    ctaHref: "/category/fragrance",
    image: "https://picsum.photos/seed/hero-fragrance/1800/700",
    imageAlt: "Fragrance collection",
  },
];

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  // TODO: replace with a real call once the backend exposes a hero-banners
  // endpoint, e.g. `apiFetch<HeroSlide[]>("/hero-slides", { auth: false })`.
  return DUMMY_SLIDES;
}
