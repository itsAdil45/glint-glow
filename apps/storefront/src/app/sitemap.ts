import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/api-products";
import { fetchCategories } from "@/lib/api-categories";

const PAGE_SIZE = 100; // matches the backend's max page size

async function fetchAllProducts() {
  const first = await fetchProducts({ limit: PAGE_SIZE, page: 1 });
  const pages = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) =>
      fetchProducts({ limit: PAGE_SIZE, page: i + 2 }).then((r) => r.items),
    ),
  );
  return [...first.items, ...pages.flat()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/collections`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [products, categories] = await Promise.all([fetchAllProducts(), fetchCategories()]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/collections/${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
