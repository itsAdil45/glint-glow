import { apiFetch } from "@/lib/api";
import { Product, ProductListResponse } from "@/types";

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
  attr?: Record<string, string>;
}

export function buildProductQueryString(query: ProductQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value == null || value === "" || key === "attr") return;
    params.set(key, String(value));
  });
  if (query.attr) {
    Object.entries(query.attr).forEach(([k, v]) => params.set(`attr[${k}]`, v));
  }
  return params.toString();
}

export async function fetchProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
  const qs = buildProductQueryString(query);
  return apiFetch<ProductListResponse>(`/products${qs ? `?${qs}` : ""}`, { auth: false });
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${slug}`, { auth: false });
}
