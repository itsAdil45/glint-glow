import { Category } from "@/types";

/**
 * Finds the first category whose slug or name contains any of the given
 * keywords. Used to map the homepage's fixed set of themed rows (Makeup,
 * Skincare, Fragrance, ...) onto whatever categories were actually created
 * in the admin — since we don't control their exact slugs, this matches
 * loosely instead of requiring an exact slug. Returns undefined (row simply
 * doesn't render) if nothing matches yet.
 */
export function findCategoryByKeywords(
  categories: Category[],
  keywords: string[],
): Category | undefined {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  return categories.find((c) => {
    const haystack = `${c.slug} ${c.name}`.toLowerCase();
    return lowerKeywords.some((k) => haystack.includes(k));
  });
}
