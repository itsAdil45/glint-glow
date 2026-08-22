import Link from "next/link";
import { fetchProducts, ProductQuery } from "@/lib/api-products";
import { fetchCategories } from "@/lib/api-categories";
import { fetchBanners } from "@/lib/banners-data";
import { CategoryCard } from "@/components/category/category-card";
import { HeroSlider } from "@/components/layout/hero-slider";
import { ProductRail } from "@/components/product/product-rail";
import { PromoBanner } from "@/components/home/promo-banner";

export const revalidate = 60;

// Homepage rows are admin-curated per product (see the "Home Sections"
// toggles in the admin products table / form) rather than derived from
// category names — a product's category doesn't reliably say which row it
// should appear in, and a product can belong to more than one row.
const CURATED_ROWS: {
  title: string;
  queryKey:
    | "fragrance"
    | "skinCare"
    | "makeupAccessory"
    | "makeup"
    | "lingerie";
}[] = [
  { title: "Fragrances", queryKey: "fragrance" },
  { title: "Skin Care", queryKey: "skinCare" },
  { title: "Makeup Accessories", queryKey: "makeupAccessory" },
  { title: "Makeup", queryKey: "makeup" },
  { title: "Lingerie", queryKey: "lingerie" },
];

// Fixed "slots" the homepage rows sit in. Banners are admin-managed with a
// numeric `position` (see the Banners page in admin) and get interleaved
// into these gaps — e.g. a banner with position 25 renders between Best
// Sellers (20) and Makeup (30).
const SLOT = {
  categories: 10,
  bestSellers: 20,
  makeup: 30,
  skinCare: 40,
  fragrances: 50,
  makeupAccessories: 60,
  lingerie: 70,
  newArrivals: 80,
};

export default async function HomePage() {
  const [featured, latest, allCategories, curated, banners] = await Promise.all(
    [
      // "Best Sellers" is admin-curated via the isFeatured toggle — sort=popular
      // alone doesn't filter by it at all, it just ranks by ratingsCount.
      fetchProducts({ featured: true, limit: 12, sort: "popular" }).catch(
        () => ({ items: [] }),
      ),
      fetchProducts({ limit: 12, sort: "newest" }).catch(() => ({ items: [] })),
      fetchCategories().catch(() => []),
      Promise.all(
        CURATED_ROWS.map((row) =>
          fetchProducts({ [row.queryKey]: true, limit: 12 } as ProductQuery)
            .then((result) => result.items)
            .catch(() => []),
        ),
      ),
      fetchBanners(),
    ],
  );
  // Top-level only — subcategories would otherwise show up as peers of their
  // own parent in this strip.
  const categories = allCategories.filter((c) => !c.parentId);

  const rows = CURATED_ROWS.map((row, i) => ({ ...row, products: curated[i] }));
  const [fragrances, skinCare, makeupAccessories, makeup, lingerie] = rows;

  // Sections between the hero and the categories strip are fixed; everything
  // from "Best Sellers" onward is a flat, position-sorted list so admin
  // banners can be inserted anywhere among the rows.
  const sections: { position: number; node: React.ReactNode }[] = [
    {
      position: SLOT.bestSellers,
      node: (
        <ProductRail
          key="best-sellers"
          title="Best Sellers"
          viewAllHref="/products?featured=true"
          products={featured.items}
        />
      ),
    },
    {
      position: SLOT.makeup,
      node: (
        <ProductRail
          key="makeup"
          title={makeup.title}
          viewAllHref={`/products?${makeup.queryKey}=true`}
          products={makeup.products}
        />
      ),
    },
    {
      position: SLOT.skinCare,
      node: (
        <ProductRail
          key="skin-care"
          title={skinCare.title}
          viewAllHref={`/products?${skinCare.queryKey}=true`}
          products={skinCare.products}
        />
      ),
    },
    {
      position: SLOT.fragrances,
      node: (
        <ProductRail
          key="fragrances"
          title={fragrances.title}
          viewAllHref={`/products?${fragrances.queryKey}=true`}
          products={fragrances.products}
        />
      ),
    },
    {
      position: SLOT.makeupAccessories,
      node: (
        <ProductRail
          key="makeup-accessories"
          title={makeupAccessories.title}
          viewAllHref={`/products?${makeupAccessories.queryKey}=true`}
          products={makeupAccessories.products}
        />
      ),
    },
    {
      position: SLOT.lingerie,
      node: (
        <ProductRail
          key="lingerie"
          title={lingerie.title}
          viewAllHref={`/products?${lingerie.queryKey}=true`}
          products={lingerie.products}
        />
      ),
    },
    {
      position: SLOT.newArrivals,
      node: (
        <ProductRail
          key="new-arrivals"
          title="New Arrivals"
          viewAllHref="/products?sort=newest"
          products={latest.items}
        />
      ),
    },
    ...banners.map((banner) => ({
      position: banner.position,
      node: <PromoBanner key={banner.id} banner={banner} />,
    })),
  ].sort((a, b) => a.position - b.position);

  return (
    <div>
      <HeroSlider />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl">Shop by category</h2>
            <Link
              href="/categories"
              className="text-sm text-accent-ink underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                sizes="20vw"
              />
            ))}
          </div>
        </section>
      )}

      {sections.map((section) => section.node)}
    </div>
  );
}
