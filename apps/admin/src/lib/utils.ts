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

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
