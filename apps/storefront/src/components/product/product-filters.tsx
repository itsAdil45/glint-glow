"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category } from "@/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "popular", label: "Most popular" },
];

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeCategory = searchParams.get("category");
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  return (
    <aside className="space-y-8">
      <div>
        <h3 className="font-display text-lg mb-3">Sort by</h3>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("sort", opt.value)}
              className={`block text-sm ${sort === opt.value ? "text-ink font-medium" : "text-muted hover:text-ink"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg mb-3">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setParam("category", null)}
            className={`block text-sm ${!activeCategory ? "text-ink font-medium" : "text-muted hover:text-ink"}`}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setParam("category", cat.slug)}
              className={`block text-sm ${activeCategory === cat.slug ? "text-ink font-medium" : "text-muted hover:text-ink"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg mb-3">Price</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => setParam("minPrice", e.target.value || null)}
            className="h-9 w-full border border-line bg-paper px-2 text-sm outline-none focus:border-ink"
          />
          <span className="text-muted text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => setParam("maxPrice", e.target.value || null)}
            className="h-9 w-full border border-line bg-paper px-2 text-sm outline-none focus:border-ink"
          />
        </div>
      </div>
    </aside>
  );
}
