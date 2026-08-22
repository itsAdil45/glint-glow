"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check, ChevronDown, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Category } from "@/types";
import { cn, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "popular", label: "Most popular" },
];

interface CategoryNode extends Category {
  children: CategoryNode[];
}

function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>();
  categories.forEach((c) => byId.set(c._id, { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  byId.forEach((node) => {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

/** Prunes the tree to nodes that match the query themselves or have a
 * descendant that does, so a hit on "Lipstick" still shows under "Makeup"
 * for context instead of floating with no parent. */
function filterCategoryTree(nodes: CategoryNode[], query: string): CategoryNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    const children = filterCategoryTree(node.children, query);
    if (node.name.toLowerCase().includes(q) || children.length > 0) {
      result.push({ ...node, children });
    }
  }
  return result;
}

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [expandOverrides, setExpandOverrides] = useState<Set<string>>(new Set());

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
    setMobileOpen(false);
  }

  const activeCategory = searchParams.get("category") || pathCategorySlug || null;
  const activeBrand = searchParams.get("brand") || pathBrandName || null;
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const hasActiveFilters = Boolean(
    activeCategory || activeBrand || minPrice || maxPrice || sort !== "newest",
  );

  function clearAll() {
    router.push("/collections");
    setMobileOpen(false);
  }

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const visibleCategoryTree = useMemo(
    () => filterCategoryTree(categoryTree, categorySearch),
    [categoryTree, categorySearch],
  );

  // Whichever branch contains the active category auto-expands, so landing
  // on a subcategory page shows it in context instead of collapsed away.
  // Kept as a pure derived value (not state set from an effect) — a manual
  // toggle then XORs against this default rather than fighting it.
  const autoExpanded = useMemo(() => {
    const ids = new Set<string>();
    if (!activeCategory) return ids;
    function walk(nodes: CategoryNode[]): boolean {
      for (const node of nodes) {
        if (node.slug === activeCategory) return true;
        if (walk(node.children)) {
          ids.add(node._id);
          return true;
        }
      }
      return false;
    }
    walk(categoryTree);
    return ids;
  }, [activeCategory, categoryTree]);

  function isExpanded(id: string) {
    const auto = autoExpanded.has(id);
    const overridden = expandOverrides.has(id);
    return overridden ? !auto : auto;
  }

  function toggleExpanded(id: string) {
    setExpandOverrides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isSearchingCategories = categorySearch.trim().length > 0;

  const filtersContent = (
    <div className="space-y-6">
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
        <div className="relative mb-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search categories"
            className="h-9 w-full rounded-lg border border-line bg-paper pl-8 pr-2.5 text-sm outline-none focus:border-accent-ink"
          />
        </div>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {!isSearchingCategories && (
            <FilterOption active={!activeCategory} onClick={() => setParam("category", null)}>
              All categories
            </FilterOption>
          )}
          {visibleCategoryTree.length === 0 ? (
            <p className="text-xs text-muted px-2.5 py-1.5">No categories match &quot;{categorySearch}&quot;.</p>
          ) : (
            visibleCategoryTree.map((node) => (
              <CategoryTreeItem
                key={node._id}
                node={node}
                depth={0}
                activeCategory={activeCategory}
                isExpanded={isExpanded}
                forceExpanded={isSearchingCategories}
                onToggleExpand={toggleExpanded}
                onSelect={(slug) => setParam("category", slug)}
              />
            ))
          )}
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
    </div>
  );

  return (
    <>
      {/* Mobile trigger bar */}
      <div className="flex items-center justify-between gap-3 mb-4 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)}>
          <SlidersHorizontal size={15} /> Filters
        </Button>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-sm text-accent-ink underline underline-offset-4">
            Clear filters
          </button>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block rounded-2xl bg-surface card-shadow p-5 h-fit">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl">Filters</h2>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-accent-ink underline underline-offset-4">
              Clear all
            </button>
          )}
        </div>
        <div className="mt-4">{filtersContent}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-paper overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">Filters</h2>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button onClick={clearAll} className="text-xs text-accent-ink underline underline-offset-4">
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close filters"
                  className="text-muted hover:text-ink"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {filtersContent}
          </div>
        </div>
      )}
    </>
  );
}

function CategoryTreeItem({
  node,
  depth,
  activeCategory,
  isExpanded,
  forceExpanded,
  onToggleExpand,
  onSelect,
}: {
  node: CategoryNode;
  depth: number;
  activeCategory: string | null;
  isExpanded: (id: string) => boolean;
  forceExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onSelect: (slug: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const expanded = forceExpanded || isExpanded(node._id);

  return (
    <div>
      <div className="flex items-center" style={{ paddingLeft: depth * 14 }}>
        {hasChildren ? (
          <button
            onClick={() => onToggleExpand(node._id)}
            aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            aria-expanded={expanded}
            className="p-1 -ml-1 text-muted hover:text-ink shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-[22px] shrink-0" />
        )}
        <FilterOption active={activeCategory === node.slug} onClick={() => onSelect(node.slug)}>
          {node.name}
        </FilterOption>
      </div>
      {hasChildren && expanded && (
        <div className="space-y-1 mt-1">
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child._id}
              node={child}
              depth={depth + 1}
              activeCategory={activeCategory}
              isExpanded={isExpanded}
              forceExpanded={forceExpanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
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
