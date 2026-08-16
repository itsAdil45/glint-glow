import { apiFetch } from "@/lib/api";
import { Category } from "@/types";

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories", { auth: false });
}

export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  return apiFetch<Category>(`/categories/${slug}`, { auth: false });
}
