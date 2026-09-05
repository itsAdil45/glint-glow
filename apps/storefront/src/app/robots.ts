import type { MetadataRoute } from "next";
import { isProductionSite } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Non-production deployments (local, staging, previews) block crawling
  // entirely — same signal as the noindex meta tags, so a search engine
  // that respects robots.txt never even fetches the pages in the first
  // place. No point advertising a sitemap there either.
  if (!isProductionSite()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/checkout", "/cart", "/order-confirmation"],
      },
    ],
    sitemap: [`${base}/sitemap.xml`, `${base}/products/sitemap.xml`],
  };
}
