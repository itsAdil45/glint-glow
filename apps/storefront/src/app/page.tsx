import Link from "next/link";
import { fetchProducts } from "@/lib/api-products";
import { fetchCategories } from "@/lib/api-categories";
import { CategoryCard } from "@/components/category/category-card";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/layout/hero-slider";
import { ProductRail } from "@/components/product/product-rail";
import { findCategoryByKeywords } from "@/lib/homepage-categories";

export const revalidate = 60;

// Each themed row is matched against whatever categories actually exist by
// keyword, since the admin controls the real slugs/names — see
// findCategoryByKeywords. Order here is the display order on the page.
const THEMED_ROWS: { title: string; keywords: string[] }[] = [
  { title: "Makeup", keywords: ["makeup", "make-up", "make up"] },
  { title: "Skin Care", keywords: ["skincare", "skin-care", "skin care"] },
  { title: "Fragrances", keywords: ["fragrance", "perfume", "scent"] },
  {
    title: "Beauty Tools & Accessories",
    keywords: ["accessor", "tool", "brush", "applicator"],
  },
  {
    title: "Lingerie",
    keywords: ["lingerie", "undergarment", "intimate", "innerwear"],
  },
];

export default async function HomePage() {
  const [featured, latest, allCategories] = await Promise.all([
    fetchProducts({ limit: 12, sort: "popular" }).catch(() => ({ items: [] })),
    fetchProducts({ limit: 12, sort: "newest" }).catch(() => ({ items: [] })),
    fetchCategories().catch(() => []),
  ]);
  // Top-level only — subcategories would otherwise show up as peers of their
  // own parent in this strip.
  const categories = allCategories.filter((c) => !c.parentId);

  const themedRows = await Promise.all(
    THEMED_ROWS.map(async (row) => {
      const category = findCategoryByKeywords(allCategories, row.keywords);
      if (!category) return { ...row, category, products: [] as typeof featured.items };
      const result = await fetchProducts({ category: category.slug, limit: 12 }).catch(() => ({
        items: [],
      }));
      return { ...row, category, products: result.items };
    }),
  );

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
      <ProductRail title="Best Sellers" viewAllHref="/products?sort=popular" products={featured.items} />

      {/* Makeup / Skin Care */}
      {themedRows.slice(0, 2).map((row) =>
        row.category ? (
          <ProductRail
            key={row.title}
            title={row.title}
            viewAllHref={`/category/${row.category.slug}`}
            products={row.products}
          />
        ) : null,
      )}

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
            <Link href="/products">Start shopping</Link>
          </Button>
        </div>
      </section>

      {/* Fragrances / Beauty Tools & Accessories / Lingerie */}
      {themedRows.slice(2).map((row) =>
        row.category ? (
          <ProductRail
            key={row.title}
            title={row.title}
            viewAllHref={`/category/${row.category.slug}`}
            products={row.products}
          />
        ) : null,
      )}

      {/* New arrivals */}
      <ProductRail title="New Arrivals" viewAllHref="/products?sort=newest" products={latest.items} />
    </div>
  );
}
