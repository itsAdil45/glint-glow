import type { Metadata } from "next";
import { fetchCategories } from "@/lib/api-categories";
import { CategoryCard } from "@/components/category/category-card";
import { PageHero } from "@/components/layout/page-hero";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop by Category",
  description: "Browse every category — from skincare essentials to the latest makeup drops.",
};

export default async function CategoriesPage() {
  const all = await fetchCategories().catch(() => []);
  // fetchCategories returns every active category flat (parents and their
  // subcategories together) — subcategories are reachable via each parent's
  // page and the mega menu, so only show top-level categories in this grid.
  const categories = all.filter((c) => !c.parentId);

  return (
    <div>
      <PageHero
        title="Shop by Category"
        subtitle="Everything we carry, organized so you can find it fast."
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Categories" }]}
      />

      <section className="container-page py-12 pb-20">
        {categories.length === 0 ? (
          <p className="text-sm text-muted">No categories to show yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} sizes="25vw" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
