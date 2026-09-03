import { apiFetch } from "@/lib/api";
import { Product, ProductListResponse } from "@/types";

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  featured?: boolean;
  fragrance?: boolean;
  skinCare?: boolean;
  makeupAccessory?: boolean;
  makeup?: boolean;
  lingerie?: boolean;
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

// Walks every page (the backend caps `limit` at 100/page) — for callers
// like the sitemap that need the full published catalog, not one page of it.
export async function fetchAllProducts(): Promise<Product[]> {
  const PAGE_SIZE = 100;
  const first = await fetchProducts({ limit: PAGE_SIZE, page: 1 });
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) =>
      fetchProducts({ limit: PAGE_SIZE, page: i + 2 }).then((r) => r.items),
    ),
  );
  return [...first.items, ...rest.flat()];
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${slug}`, { auth: false });
}

export async function fetchBrands(): Promise<string[]> {
  return apiFetch<string[]>("/products/meta/brands", { auth: false });
}
