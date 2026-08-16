import { apiFetch } from "@/lib/api";
import { Category } from "@/types";

export async function fetchAdminCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories/admin/all");
}

export interface CategoryInput {
  name: string;
  slug?: string;
  parentId?: string;
  image?: string;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export async function createCategory(data: CategoryInput): Promise<Category> {
  return apiFetch<Category>("/categories", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCategory(id: string, data: Partial<CategoryInput>): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch(`/categories/${id}`, { method: "DELETE" });
}
