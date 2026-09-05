import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Prices are always PKR — formatted manually (plain grouped number + a
// fixed "Rs" prefix) rather than via Intl's currency style, since relying
// on a runtime's ICU data to resolve the PKR symbol correctly isn't
// guaranteed consistent across every deployment environment.
export function formatPrice(amount: number) {
  return `Rs ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

/**
 * Brand names (e.g. "Petal & Co.") don't have a stored slug — brand is just
 * a free-text field on Product. This derives a clean path segment for
 * /collections/brand/[slug], resolved back to the real name by matching
 * this same function against the live brand list (see fetchBrands).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * The backend serves uploaded images as relative paths (e.g. "/uploads/x.webp")
 * from its own origin, which differs from the storefront's origin. Any image
 * URL coming from the API needs this before being handed to next/image —
 * an already-absolute URL (dummy data, external images) passes through as-is.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const backendOrigin = apiUrl.replace(/\/api\/?$/, "");
  return `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
}
