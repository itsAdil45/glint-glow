"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductAttribute, ProductVariation, Category } from "@/types";
import { createProduct, updateProduct, ProductInput } from "@/lib/api-products";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "./image-uploader";
import { VariationBuilder } from "./variation-builder";
import { slugify } from "@/lib/utils";
import { ApiError } from "@/lib/api";

export function ProductForm({
  categories,
  allProducts,
  initial,
}: {
  categories: Category[];
  allProducts: Product[];
  initial?: Product;
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initial?.description || "");
  const [shortDescription, setShortDescription] = useState(
    initial?.shortDescription || "",
  );
  const [brand, setBrand] = useState(initial?.brand || "");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categoryIds || [],
  );
  const [images, setImages] = useState(initial?.images || []);
  const [basePrice, setBasePrice] = useState(initial?.basePrice ?? 0);
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compareAtPrice ?? undefined,
  );
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [hasVariations, setHasVariations] = useState(
    initial?.hasVariations || false,
  );
  const [attributes, setAttributes] = useState<ProductAttribute[]>(
    initial?.attributes || [],
  );
  const [variations, setVariations] = useState<ProductVariation[]>(
    initial?.variations || [],
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured || false);
  const [isFragrance, setIsFragrance] = useState(initial?.isFragrance || false);
  const [isSkinCare, setIsSkinCare] = useState(initial?.isSkinCare || false);
  const [isMakeupAccessory, setIsMakeupAccessory] = useState(
    initial?.isMakeupAccessory || false,
  );
  const [isMakeup, setIsMakeup] = useState(initial?.isMakeup || false);
  const [isLingerie, setIsLingerie] = useState(initial?.isLingerie || false);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(
    initial?.relatedProductIds || [],
  );
  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title || "");
  const [seoDescription, setSeoDescription] = useState(
    initial?.seo?.description || "",
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Category pagination states
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [categoryVisibleCount, setCategoryVisibleCount] = useState(12);
  const CATEGORY_INCREMENT = 12;

  // Related products pagination states
  const [relatedSearchTerm, setRelatedSearchTerm] = useState("");
  const [relatedVisibleCount, setRelatedVisibleCount] = useState(10);
  const RELATED_INCREMENT = 10;

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()),
  );

  // Get visible categories based on pagination
  const visibleCategories = filteredCategories.slice(0, categoryVisibleCount);
  const hasMoreCategories = filteredCategories.length > categoryVisibleCount;

  // Filter related products based on search
  const availableProducts = allProducts.filter((p) => p._id !== initial?._id);
  const filteredRelatedProducts = availableProducts.filter((p) =>
    p.title.toLowerCase().includes(relatedSearchTerm.toLowerCase()),
  );

  // Get visible related products based on pagination
  const visibleRelatedProducts = filteredRelatedProducts.slice(
    0,
    relatedVisibleCount,
  );
  const hasMoreRelated = filteredRelatedProducts.length > relatedVisibleCount;

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleCategory(id: string) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function toggleRelated(id: string) {
    setRelatedProductIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  // Reset pagination when search changes
  useEffect(() => {
    setCategoryVisibleCount(CATEGORY_INCREMENT);
  }, [categorySearchTerm]);

  useEffect(() => {
    setRelatedVisibleCount(RELATED_INCREMENT);
  }, [relatedSearchTerm]);

  async function handleSubmit(e: React.FormEvent, publishOverride?: boolean) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload: ProductInput = {
      title,
      slug,
      description,
      shortDescription,
      brand,
      categoryIds,
      images,
      basePrice: Number(basePrice),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      hasVariations,
      attributes,
      variations,
      stock: Number(stock),
      isPublished: publishOverride ?? isPublished,
      isFeatured,
      isFragrance,
      isSkinCare,
      isMakeupAccessory,
      isMakeup,
      isLingerie,
      relatedProductIds,
      seoTitle,
      seoDescription,
    };

    try {
      if (isEdit) {
        await updateProduct(initial!._id, payload);
      } else {
        await createProduct(payload);
      }
      router.push("/products");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save product",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-20">
      {/* Basic info */}
      <Section title="Basic information">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Shown on product cards and PDP subtitle"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>
      </Section>

      {/* Categories */}
      <Section title="Categories">
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              className="w-full rounded-lg border border-line bg-background pl-9 pr-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              placeholder="Search categories..."
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
            />
          </div>

          {/* Selected Categories Count */}
          {categoryIds.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                {categoryIds.length} categor
                {categoryIds.length > 1 ? "ies" : "y"} selected
              </span>
              <button
                type="button"
                className="text-xs text-accent hover:text-accent-dark font-medium transition-colors"
                onClick={() => {
                  // Clear all selections
                  categories.forEach((cat) => {
                    if (categoryIds.includes(cat._id)) {
                      toggleCategory(cat._id);
                    }
                  });
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Categories Grid */}
          <div className="max-h-96 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {visibleCategories.map((cat) => (
                <label
                  key={cat._id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    categoryIds.includes(cat._id)
                      ? "border-accent bg-accent-soft"
                      : "border-line hover:border-accent/50 hover:bg-background/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={categoryIds.includes(cat._id)}
                    onChange={() => toggleCategory(cat._id)}
                  />
                  <div
                    className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                      categoryIds.includes(cat._id)
                        ? "bg-accent border-accent"
                        : "border-muted"
                    }`}
                  >
                    {categoryIds.includes(cat._id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm flex-1 truncate">{cat.name}</span>
                </label>
              ))}
            </div>

            {/* Empty States */}
            {categories.length === 0 && (
              <p className="text-xs text-muted text-center py-4">
                No categories yet — create one first.
              </p>
            )}

            {categories.length > 0 && visibleCategories.length === 0 && (
              <p className="text-xs text-muted text-center py-4">
                No categories found matching "{categorySearchTerm}"
              </p>
            )}
          </div>

          {/* Load More Button for Categories */}
          {hasMoreCategories && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                className="text-sm text-accent hover:text-accent-dark font-medium transition-colors flex items-center gap-1"
                onClick={() =>
                  setCategoryVisibleCount((prev) => prev + CATEGORY_INCREMENT)
                }
              >
                Show more categories
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Images */}
      <Section title="Images">
        <ImageUploader images={images} onChange={setImages} />
      </Section>

      {/* Pricing / variations */}
      <Section title="Pricing & inventory">
        <label className="flex items-center gap-2 mb-4 text-sm">
          <input
            type="checkbox"
            checked={hasVariations}
            onChange={(e) => setHasVariations(e.target.checked)}
          />
          This product has variations (e.g. different sizes or colors)
        </label>

        {!hasVariations ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="basePrice">Price</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                min={0}
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="compareAtPrice">Compare-at price</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min={0}
                value={compareAtPrice ?? ""}
                onChange={(e) =>
                  setCompareAtPrice(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
          </div>
        ) : (
          <VariationBuilder
            attributes={attributes}
            setAttributes={setAttributes}
            variations={variations}
            setVariations={setVariations}
            baseSlug={slug}
          />
        )}
      </Section>

      {/* Related products */}
      <Section
        title="Related products"
        subtitle="Shown on the product detail page"
      >
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              className="w-full rounded-lg border border-line bg-background pl-9 pr-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              placeholder="Search products..."
              value={relatedSearchTerm}
              onChange={(e) => setRelatedSearchTerm(e.target.value)}
            />
          </div>

          {/* Selected Products Count */}
          {relatedProductIds.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                {relatedProductIds.length} product
                {relatedProductIds.length > 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                className="text-xs text-accent hover:text-accent-dark font-medium transition-colors"
                onClick={() => {
                  // Clear all selections
                  allProducts
                    .filter((p) => p._id !== initial?._id)
                    .forEach((p) => {
                      if (relatedProductIds.includes(p._id)) {
                        toggleRelated(p._id);
                      }
                    });
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid */}
          <div className="max-h-96 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visibleRelatedProducts.map((p) => (
                <label
                  key={p._id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${
                    relatedProductIds.includes(p._id)
                      ? "border-accent bg-accent-soft shadow-sm"
                      : "border-line hover:border-accent/50 hover:bg-background/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={relatedProductIds.includes(p._id)}
                    onChange={() => toggleRelated(p._id)}
                  />
                  <div
                    className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                      relatedProductIds.includes(p._id)
                        ? "bg-accent border-accent"
                        : "border-muted"
                    }`}
                  >
                    {relatedProductIds.includes(p._id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm flex-1 truncate">{p.title}</span>
                </label>
              ))}
            </div>

            {/* Empty States */}
            {availableProducts.length === 0 && (
              <p className="text-xs text-muted text-center py-4">
                No other products available
              </p>
            )}

            {availableProducts.length > 0 &&
              visibleRelatedProducts.length === 0 && (
                <p className="text-xs text-muted text-center py-4">
                  No products found matching "{relatedSearchTerm}"
                </p>
              )}
          </div>

          {/* Load More Button for Related Products */}
          {hasMoreRelated && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                className="text-sm text-accent hover:text-accent-dark font-medium transition-colors flex items-center gap-1"
                onClick={() =>
                  setRelatedVisibleCount((prev) => prev + RELATED_INCREMENT)
                }
              >
                Show more products
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="seoTitle">Meta title</Label>
            <Input
              id="seoTitle"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="seoDescription">Meta description</Label>
            <Textarea
              id="seoDescription"
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={shortDescription}
            />
          </div>
        </div>
      </Section>

      {/* Visibility */}
      <Section title="Visibility">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Published (visible on storefront)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Featured (shown in &quot;Best sellers&quot;)
          </label>
        </div>
        <p className="text-xs text-muted mt-4 mb-2">
          Homepage rows — a product can appear in more than one, or none.
        </p>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFragrance}
              onChange={(e) => setIsFragrance(e.target.checked)}
            />
            Fragrances
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isSkinCare}
              onChange={(e) => setIsSkinCare(e.target.checked)}
            />
            Skin Care
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isMakeupAccessory}
              onChange={(e) => setIsMakeupAccessory(e.target.checked)}
            />
            Makeup Accessories
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isMakeup}
              onChange={(e) => setIsMakeup(e.target.checked)}
            />
            Makeup
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isLingerie}
              onChange={(e) => setIsLingerie(e.target.checked)}
            />
            Lingerie
          </label>
        </div>
      </Section>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3 sticky bottom-0 bg-bg py-4 border-t border-line">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6">
      <h2 className="text-sm font-medium mb-1">{title}</h2>
      {subtitle && <p className="text-xs text-muted mb-4">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </div>
  );
}
