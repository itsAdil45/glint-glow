import { apiFetch } from "@/lib/api";
import { Category } from "@/types";

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories", { auth: false });
}

/**
 * Categories for the "Shop by category" cards: every top-level category, plus
 * any subcategory that has an image and is flagged isCategoryItem. API order
 * (by name) is preserved.
 */
export function pickShopByCategoryItems(all: Category[]): Category[] {
  return all.filter((c) => !c.parentId || (c.isCategoryItem === true && !!c.image));
}

export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  return apiFetch<Category>(`/categories/${slug}`, { auth: false });
}
