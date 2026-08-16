import { apiFetch } from "@/lib/api";
import { Product } from "@/types";

export async function fetchAdminProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products/admin/all");
}

export async function fetchAdminProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/admin/${id}`);
}

export type ProductInput = Partial<
  Omit<Product, "_id" | "createdAt" | "ratingsAvg" | "ratingsCount" | "seo"> & {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
  }
>;

export async function createProduct(data: ProductInput): Promise<Product> {
  return apiFetch<Product>("/products", { method: "POST", body: JSON.stringify(data) });
}

export async function updateProduct(id: string, data: ProductInput): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  return apiFetch(`/products/${id}`, { method: "DELETE" });
}

export async function uploadImage(file: File): Promise<{ url: string; thumbnailUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/uploads/image", { method: "POST", body: formData, isFormData: true });
}
