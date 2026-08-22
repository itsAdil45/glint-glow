import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProducts, ProductQuery } from "@/lib/api-products";
import { fetchCategories, fetchCategoryBySlug } from "@/lib/api-categories";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { Pagination } from "@/components/product/pagination";
import { PageHero } from "@/components/layout/page-hero";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

// Themed boolean-flag rows (see homepage) can also be landed on via a
// "View All" link — e.g. /collections?fragrance=true — so the hero title
// reflects that context too, not just an actual category.
const FLAG_ROW_TITLES: [keyof ProductQuery, string][] = [
  ["featured", "Best Sellers"],
  ["fragrance", "Fragrances"],
  ["skinCare", "Skin Care"],
  ["makeupAccessory", "Makeup Accessories"],
  ["makeup", "Makeup"],
  ["lingerie", "Lingerie"],
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: slugParts } = await params;
  const slug = slugParts?.[0];

  if (!slug) {
    return {
      title: "Shop all products",
      description: "Browse the full collection — filter by category, price, and more.",
      alternates: { canonical: "/collections" },
    };
  }

  try {
    const category = await fetchCategoryBySlug(slug);
    return {
      title: category.seo?.title || category.name,
      description:
        category.seo?.description || `Shop ${category.name} — new arrivals and best sellers.`,
      alternates: { canonical: `/collections/${slug}` },
    };
  } catch {
    return { title: "Collection" };
  }
}

export default async function CollectionsPage({ params, searchParams }: PageProps) {
  const { slug: slugParts } = await params;
  const slug = slugParts?.[0];
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;

  let category = null;
  if (slug) {
    try {
      category = await fetchCategoryBySlug(slug);
    } catch {
      notFound();
    }
  }

  const [result, categories] = await Promise.all([
    fetchProducts({
      search: sp.search,
      category: slug || sp.category,
      brand: sp.brand,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      featured: sp.featured === "true" ? true : undefined,
      fragrance: sp.fragrance === "true" ? true : undefined,
      skinCare: sp.skinCare === "true" ? true : undefined,
      makeupAccessory: sp.makeupAccessory === "true" ? true : undefined,
      makeup: sp.makeup === "true" ? true : undefined,
      lingerie: sp.lingerie === "true" ? true : undefined,
      sort: (sp.sort as ProductQuery["sort"]) || "newest",
      page,
      limit: 12,
    }),
    fetchCategories().catch(() => []),
  ]);

  const activeFlagRow = FLAG_ROW_TITLES.find(([key]) => sp[key as string] === "true");

  const heroTitle = category
    ? category.name
    : sp.search
      ? `Results for "${sp.search}"`
      : activeFlagRow?.[1] || "Shop All";

  const heroSubtitle = category
    ? category.seo?.description ||
      `${result.total} product${result.total === 1 ? "" : "s"} in this collection.`
    : `${result.total} product${result.total === 1 ? "" : "s"} — beauty essentials and intimates, curated with care.`;

  const breadcrumbItems = category
    ? [{ label: "Home", href: "/" }, { label: "Shop", href: "/collections" }, { label: category.name }]
    : [{ label: "Home", href: "/" }, { label: "Shop" }];

  return (
    <div>
      <PageHero title={heroTitle} subtitle={heroSubtitle} breadcrumbItems={breadcrumbItems} />

      <div className="container-page py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <ProductFilters categories={categories} />

          <div>
            {result.items.length === 0 ? (
              <div className="py-24 text-center text-muted">
                <p>
                  {category ? "No products in this category yet." : "No products match these filters."}
                </p>
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
