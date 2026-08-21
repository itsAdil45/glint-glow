import type { Metadata } from "next";
import { fetchProducts, ProductQuery } from "@/lib/api-products";
import { fetchCategories } from "@/lib/api-categories";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { Pagination } from "@/components/product/pagination";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse the full collection — filter by category, price, and more.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;

  const [result, categories] = await Promise.all([
    fetchProducts({
      search: params.search,
      category: params.category,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      featured: params.featured === "true" ? true : undefined,
      fragrance: params.fragrance === "true" ? true : undefined,
      skinCare: params.skinCare === "true" ? true : undefined,
      makeupAccessory: params.makeupAccessory === "true" ? true : undefined,
      makeup: params.makeup === "true" ? true : undefined,
      lingerie: params.lingerie === "true" ? true : undefined,
      sort: (params.sort as ProductQuery["sort"]) || "newest",
      page,
      limit: 12,
    }),
    fetchCategories().catch(() => []),
  ]);

  const ROW_TITLES: [string, string][] = [
    ["featured", "Best Sellers"],
    ["fragrance", "Fragrances"],
    ["skinCare", "Skin Care"],
    ["makeupAccessory", "Makeup Accessories"],
    ["makeup", "Makeup"],
    ["lingerie", "Lingerie"],
  ];
  const activeRow = ROW_TITLES.find(([key]) => params[key] === "true");
  const heroTitle = params.search ? `Results for "${params.search}"` : activeRow?.[1] || "Shop All";

  return (
    <div>
      <PageHero
        title={heroTitle}
        subtitle={`${result.total} product${result.total === 1 ? "" : "s"} — beauty essentials and intimates, curated with care.`}
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />

      <div className="container-page py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <ProductFilters categories={categories} />

          <div>
            {result.items.length === 0 ? (
              <div className="py-24 text-center text-muted">
                <p>No products match these filters.</p>
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
