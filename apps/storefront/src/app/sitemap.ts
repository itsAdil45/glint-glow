import type { MetadataRoute } from "next";
import { fetchCategories } from "@/lib/api-categories";

// Static + category routes only — products have their own dedicated
// sitemap at /products/sitemap.xml (see app/products/sitemap.ts) so that
// file's response time and reliability don't depend on the product API,
// and so Search Console can report indexation for products separately
// from the rest of the site.
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
    const categories = await fetchCategories();
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/collections/${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    return [...staticRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
