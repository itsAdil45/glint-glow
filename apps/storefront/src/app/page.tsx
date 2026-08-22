import Link from "next/link";
import { fetchProducts, ProductQuery } from "@/lib/api-products";
import { fetchCategories } from "@/lib/api-categories";
import { CategoryCard } from "@/components/category/category-card";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/layout/hero-slider";
import { ProductRail } from "@/components/product/product-rail";

export const revalidate = 60;

// Homepage rows are admin-curated per product (see the "Home Sections"
// toggles in the admin products table / form) rather than derived from
// category names — a product's category doesn't reliably say which row it
// should appear in, and a product can belong to more than one row.
const CURATED_ROWS: { title: string; queryKey: "fragrance" | "skinCare" | "makeupAccessory" | "makeup" | "lingerie" }[] = [
  { title: "Fragrances", queryKey: "fragrance" },
  { title: "Skin Care", queryKey: "skinCare" },
  { title: "Makeup Accessories", queryKey: "makeupAccessory" },
  { title: "Makeup", queryKey: "makeup" },
  { title: "Lingerie", queryKey: "lingerie" },
];

export default async function HomePage() {
  const [featured, latest, allCategories, curated] = await Promise.all([
    // "Best Sellers" is admin-curated via the isFeatured toggle — sort=popular
    // alone doesn't filter by it at all, it just ranks by ratingsCount.
    fetchProducts({ featured: true, limit: 12, sort: "popular" }).catch(() => ({ items: [] })),
    fetchProducts({ limit: 12, sort: "newest" }).catch(() => ({ items: [] })),
    fetchCategories().catch(() => []),
    Promise.all(
      CURATED_ROWS.map((row) =>
        fetchProducts({ [row.queryKey]: true, limit: 12 } as ProductQuery)
          .then((result) => result.items)
          .catch(() => []),
      ),
    ),
  ]);
  // Top-level only — subcategories would otherwise show up as peers of their
  // own parent in this strip.
  const categories = allCategories.filter((c) => !c.parentId);

  const rows = CURATED_ROWS.map((row, i) => ({ ...row, products: curated[i] }));
  const [fragrances, skinCare, makeupAccessories, makeup, lingerie] = rows;

  return (
    <div>
      <HeroSlider />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl">Shop by category</h2>
            <Link href="/categories" className="text-sm text-accent-ink underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((category) => (
              <CategoryCard key={category._id} category={category} sizes="20vw" />
            ))}
          </div>
        </section>
      )}

      {/* Best sellers */}
      <ProductRail title="Best Sellers" viewAllHref="/collections?featured=true" products={featured.items} />

      {/* Makeup / Skin Care */}
      <ProductRail title={makeup.title} viewAllHref={`/collections?${makeup.queryKey}=true`} products={makeup.products} />
      <ProductRail title={skinCare.title} viewAllHref={`/collections?${skinCare.queryKey}=true`} products={skinCare.products} />

      {/* Promo banner */}
      <section className="container-page py-8">
        <div className="rounded-3xl bg-gradient-to-br from-ink to-ink-soft text-paper px-8 py-12 flex flex-col items-start gap-4">
          <span className="font-body text-xs tracking-widest uppercase text-gold">
            Cash on delivery, everywhere
          </span>
          <h3 className="font-display text-3xl max-w-md">
            Order now, pay when it arrives at your door.
          </h3>
          <Button variant="accent" size="lg" asChild>
            <Link href="/collections">Start shopping</Link>
          </Button>
        </div>
      </section>

      {/* Fragrances / Makeup Accessories / Lingerie */}
      <ProductRail title={fragrances.title} viewAllHref={`/collections?${fragrances.queryKey}=true`} products={fragrances.products} />
      <ProductRail
        title={makeupAccessories.title}
        viewAllHref={`/collections?${makeupAccessories.queryKey}=true`}
        products={makeupAccessories.products}
      />
      <ProductRail title={lingerie.title} viewAllHref={`/collections?${lingerie.queryKey}=true`} products={lingerie.products} />

      {/* New arrivals */}
      <ProductRail title="New Arrivals" viewAllHref="/collections?sort=newest" products={latest.items} />
    </div>
  );
}
