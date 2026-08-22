"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { Category } from "@/types";
import { cn, slugify } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "popular", label: "Most popular" },
];

export function ProductFilters({
  categories,
  brands,
}: {
  categories: Category[];
  brands: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // /collections/[slug] and /collections/brand/[slug] are the clean,
  // canonical URLs for a pure category or brand browse; bare /collections
  // (with query params) is the filtered/combined listing. All three are
  // the same route now, so any filter change always targets bare
  // /collections — but if we're currently on one of the clean paths, that
  // identifier has to be carried over as a query param first, or it'd be
  // lost the moment we leave the path form.
  const isCleanBrandPath = pathname.startsWith("/collections/brand/");
  const pathBrandSlug = isCleanBrandPath
    ? pathname.replace("/collections/brand/", "").split("/")[0]
    : undefined;
  const pathBrandName = pathBrandSlug ? brands.find((b) => slugify(b) === pathBrandSlug) : undefined;

  const isCleanCategoryPath =
    pathname !== "/collections" && pathname.startsWith("/collections/") && !isCleanBrandPath;
  const pathCategorySlug = isCleanCategoryPath
    ? pathname.replace("/collections/", "").split("/")[0]
    : undefined;

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");

    if (isCleanCategoryPath && key !== "category" && pathCategorySlug && !params.get("category")) {
      params.set("category", pathCategorySlug);
    }
    if (isCleanBrandPath && key !== "brand" && pathBrandName && !params.get("brand")) {
      params.set("brand", pathBrandName);
    }
    router.push(`/collections?${params.toString()}`);
  }

  const activeCategory = searchParams.get("category") || pathCategorySlug || null;
  const activeBrand = searchParams.get("brand") || pathBrandName || null;
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  return (
    <aside className="rounded-2xl bg-surface card-shadow p-5 h-fit space-y-6">
      <FilterSection title="Sort by">
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <FilterOption
              key={opt.value}
              active={sort === opt.value}
              onClick={() => setParam("sort", opt.value)}
            >
              {opt.label}
            </FilterOption>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-line" />

      <FilterSection title="Category">
        <div className="space-y-1">
          <FilterOption active={!activeCategory} onClick={() => setParam("category", null)}>
            All categories
          </FilterOption>
          {categories.map((cat) => (
            <FilterOption
              key={cat._id}
              active={activeCategory === cat.slug}
              onClick={() => setParam("category", cat.slug)}
            >
              {cat.name}
            </FilterOption>
          ))}
        </div>
      </FilterSection>

      {brands.length > 0 && (
        <>
          <div className="h-px bg-line" />

          <FilterSection title="Brand">
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <FilterOption active={!activeBrand} onClick={() => setParam("brand", null)}>
                All brands
              </FilterOption>
              {brands.map((brand) => (
                <FilterOption
                  key={brand}
                  active={activeBrand === brand}
                  onClick={() => setParam("brand", brand)}
                >
                  {brand}
                </FilterOption>
              ))}
            </div>
          </FilterSection>
        </>
      )}

      <div className="h-px bg-line" />

      <FilterSection title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => setParam("minPrice", e.target.value || null)}
            className="h-9 w-full rounded-lg border border-line bg-paper px-2.5 text-sm outline-none focus:border-accent-ink"
          />
          <span className="text-muted text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => setParam("maxPrice", e.target.value || null)}
            className="h-9 w-full rounded-lg border border-line bg-paper px-2.5 text-sm outline-none focus:border-accent-ink"
          />
        </div>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-lg mb-3">{title}</h3>
      {children}
    </div>
  );
}

function FilterOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full text-left text-sm rounded-lg px-2.5 py-1.5 transition-colors",
        active ? "bg-accent-soft text-accent-ink font-medium" : "text-muted hover:bg-accent-soft/50 hover:text-ink",
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-full border shrink-0",
          active ? "border-accent-ink bg-accent-ink" : "border-line",
        )}
      >
        {active && <Check size={9} className="text-paper" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}
