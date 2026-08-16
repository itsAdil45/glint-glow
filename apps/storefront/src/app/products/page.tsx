import type { Metadata } from "next";
import { fetchProducts, ProductQuery } from "@/lib/api-products";
import { fetchCategories } from "@/lib/api-categories";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { Pagination } from "@/components/product/pagination";

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
      sort: (params.sort as ProductQuery["sort"]) || "newest",
      page,
      limit: 12,
    }),
    fetchCategories().catch(() => []),
  ]);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl">
          {params.search ? `Results for "${params.search}"` : "Shop all"}
        </h1>
        <p className="text-sm text-muted mt-1">{result.total} products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
        <ProductFilters categories={categories} />

        <div>
          {result.items.length === 0 ? (
            <div className="py-24 text-center text-muted">
              <p>No products match these filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {result.items.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <Pagination page={result.page} totalPages={result.totalPages} />
        </div>
      </div>
    </div>
  );
}
