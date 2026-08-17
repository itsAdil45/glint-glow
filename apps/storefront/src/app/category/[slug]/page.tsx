import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProducts, ProductQuery } from "@/lib/api-products";
import { fetchCategories, fetchCategoryBySlug } from "@/lib/api-categories";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { Pagination } from "@/components/product/pagination";
import { PageHero } from "@/components/layout/page-hero";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await fetchCategoryBySlug(slug);
    return {
      title: category.seo?.title || category.name,
      description: category.seo?.description || `Shop ${category.name} — new arrivals and best sellers.`,
    };
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;

  let category;
  try {
    category = await fetchCategoryBySlug(slug);
  } catch {
    notFound();
  }

  const [result, categories] = await Promise.all([
    fetchProducts({
      category: slug,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      sort: (sp.sort as ProductQuery["sort"]) || "newest",
      page,
      limit: 12,
    }),
    fetchCategories().catch(() => []),
  ]);

  return (
    <div>
      <PageHero
        title={category!.name}
        subtitle={category!.seo?.description || `${result.total} product${result.total === 1 ? "" : "s"} in this collection.`}
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/products" },
          { label: category!.name },
        ]}
      />

      <div className="container-page py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <ProductFilters categories={categories} />

          <div>
            {result.items.length === 0 ? (
              <div className="py-24 text-center text-muted">
                <p>No products in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {result.items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
            <Pagination page={result.page} totalPages={result.totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}
