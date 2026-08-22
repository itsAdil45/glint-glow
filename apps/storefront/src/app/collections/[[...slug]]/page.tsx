import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProducts, fetchBrands, ProductQuery } from "@/lib/api-products";
import { fetchCategories, fetchCategoryBySlug } from "@/lib/api-categories";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { Pagination } from "@/components/product/pagination";
import { PageHero } from "@/components/layout/page-hero";
import { slugify } from "@/lib/utils";

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

/** Resolves /collections/brand/<slug> back to the real brand string — brand
 * has no stored slug, it's a free-text field, so this matches against the
 * live distinct-brands list the same way the sidebar/mega-menu links do. */
async function resolveBrandSlug(slug: string): Promise<string | undefined> {
  const brands = await fetchBrands().catch(() => []);
  return brands.find((b) => slugify(b) === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: slugParts } = await params;
  const [first, second] = slugParts || [];

  if (first === "brand") {
    const brandName = second ? await resolveBrandSlug(second) : undefined;
    if (!brandName) return { title: "Brand" };
    return {
      title: `${brandName} — Shop All`,
      description: `Shop everything from ${brandName}.`,
      alternates: { canonical: `/collections/brand/${second}` },
    };
  }

  if (!first) {
    return {
      title: "Shop all products",
      description: "Browse the full collection — filter by category, price, and more.",
      alternates: { canonical: "/collections" },
    };
  }

  try {
    const category = await fetchCategoryBySlug(first);
    return {
      title: category.seo?.title || category.name,
      description:
        category.seo?.description || `Shop ${category.name} — new arrivals and best sellers.`,
      alternates: { canonical: `/collections/${first}` },
    };
  } catch {
    return { title: "Collection" };
  }
}

export default async function CollectionsPage({ params, searchParams }: PageProps) {
  const { slug: slugParts } = await params;
  const [first, second] = slugParts || [];
  const sp = await searchParams;
  const page = sp.page ? Number(sp.page) : 1;

  const isBrandPath = first === "brand";

  let category = null;
  let brandName: string | undefined;

  if (isBrandPath) {
    brandName = second ? await resolveBrandSlug(second) : undefined;
    if (!brandName) notFound();
  } else if (first) {
    try {
      category = await fetchCategoryBySlug(first);
    } catch {
      notFound();
    }
  }

  const effectiveBrand = brandName || sp.brand;

  const [result, categories, brands] = await Promise.all([
    fetchProducts({
      search: sp.search,
      category: !isBrandPath ? first || sp.category : sp.category,
      brand: effectiveBrand,
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
    fetchBrands().catch(() => []),
  ]);

  const activeFlagRow = FLAG_ROW_TITLES.find(([key]) => sp[key as string] === "true");

  const heroTitle = category
    ? category.name
    : brandName
      ? brandName
      : sp.search
        ? `Results for "${sp.search}"`
        : sp.brand
          ? sp.brand
          : activeFlagRow?.[1] || "Shop All";

  const heroSubtitle = category
    ? category.seo?.description ||
      `${result.total} product${result.total === 1 ? "" : "s"} in this collection.`
    : brandName
      ? `${result.total} product${result.total === 1 ? "" : "s"} from ${brandName}.`
      : `${result.total} product${result.total === 1 ? "" : "s"} — beauty essentials and intimates, curated with care.`;

  const breadcrumbItems = category
    ? [{ label: "Home", href: "/" }, { label: "Shop", href: "/collections" }, { label: category.name }]
    : brandName
      ? [{ label: "Home", href: "/" }, { label: "Shop", href: "/collections" }, { label: brandName }]
      : [{ label: "Home", href: "/" }, { label: "Shop" }];

  return (
    <div>
      <PageHero title={heroTitle} subtitle={heroSubtitle} breadcrumbItems={breadcrumbItems} />

      <div className="container-page py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <ProductFilters categories={categories} brands={brands} />

          <div>
            {result.items.length === 0 ? (
              <div className="py-24 text-center text-muted">
                <p>
                  {category || brandName
                    ? "No products here yet."
                    : "No products match these filters."}
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
