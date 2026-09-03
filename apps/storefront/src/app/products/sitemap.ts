import type { MetadataRoute } from "next";
import { fetchAllProducts } from "@/lib/api-products";

// Served at /products/sitemap.xml — kept separate from the main sitemap
// (see app/sitemap.ts) so it can be diagnosed in Search Console on its
// own and doesn't block the rest of the site's sitemap on the product
// API. No /products page exists as a route (products live under
// /product/[slug] and /collections) so this path is free for a
// metadata-only file.
//
// Not using generateSitemaps' multi-file chunking here — that exists for
// catalogs approaching Google's 50,000-URLs-per-sitemap limit, which a
// few hundred products is nowhere near. Revisit if the catalog ever
// gets there.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const products = await fetchAllProducts();
    return products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    return [];
  }
}
