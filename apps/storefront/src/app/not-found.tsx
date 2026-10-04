import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { fetchProducts } from "@/lib/api-products";
import { ProductRail } from "@/components/product/product-rail";
import { Button } from "@/components/ui/button";
import { NOINDEX_NOFOLLOW, buildOpenGraph, buildTwitter } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
  // A 404 has no content of its own to rank, and letting it get indexed
  // just litters search results with dead links.
  robots: NOINDEX_NOFOLLOW,
  openGraph: buildOpenGraph({ title: "Page Not Found" }),
  twitter: buildTwitter(),
};

export default async function NotFound() {
  // Best-sellers first so a lost visitor lands on something worth
  // clicking; newest as a fallback for a brand-new store with nothing
  // marked as a best seller yet, rather than showing an empty rail.
  const featured = await fetchProducts({ featured: true, limit: 8 }).catch(() => ({ items: [] }));
  const products = featured.items.length
    ? featured.items
    : await fetchProducts({ limit: 8, sort: "newest" })
        .then((r) => r.items)
        .catch(() => []);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-soft blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-soft blur-3xl"
        />

        <div className="container-page relative py-20 sm:py-28 text-center">
          <p className="font-display text-7xl sm:text-8xl text-accent-ink">404</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-4">We couldn&apos;t find that page</h1>
          <p className="text-muted mt-3 max-w-md mx-auto">
            The link may be broken, or the page may have moved. Let&apos;s get you back to shopping.
          </p>

          <form action="/collections" className="relative mt-8 max-w-sm mx-auto">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              name="search"
              placeholder="Search for products"
              className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-sm outline-none focus:border-accent-ink"
            />
          </form>

          <div className="flex items-center justify-center gap-3 mt-7">
            <Button asChild size="lg">
              <Link href="/">Back to homepage</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/collections">Browse all products</Link>
            </Button>
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <ProductRail title="You might like" viewAllHref="/collections" products={products} />
      )}
    </div>
  );
}
