"use client";

import { useState } from "react";
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
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription || "");
  const [brand, setBrand] = useState(initial?.brand || "");
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds || []);
  const [images, setImages] = useState(initial?.images || []);
  const [basePrice, setBasePrice] = useState(initial?.basePrice ?? 0);
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice ?? undefined);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [hasVariations, setHasVariations] = useState(initial?.hasVariations || false);
  const [attributes, setAttributes] = useState<ProductAttribute[]>(initial?.attributes || []);
  const [variations, setVariations] = useState<ProductVariation[]>(initial?.variations || []);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured || false);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(
    initial?.relatedProductIds || [],
  );
  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title || "");
  const [seoDescription, setSeoDescription] = useState(initial?.seo?.description || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function toggleRelated(id: string) {
    setRelatedProductIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

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
      setError(err instanceof ApiError ? err.message : "Could not save product");
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
            <Input id="title" required value={title} onChange={(e) => handleTitleChange(e.target.value)} />
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
            <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Categories */}
      <Section title="Categories">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <label
              key={cat._id}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs cursor-pointer has-[:checked]:bg-accent-soft has-[:checked]:border-accent"
            >
              <input
                type="checkbox"
                className="hidden"
                checked={categoryIds.includes(cat._id)}
                onChange={() => toggleCategory(cat._id)}
              />
              {cat.name}
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-muted">No categories yet — create one first.</p>
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
                onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)}
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
      <Section title="Related products" subtitle="Shown on the product detail page">
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {allProducts
            .filter((p) => p._id !== initial?._id)
            .map((p) => (
              <label
                key={p._id}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs cursor-pointer has-[:checked]:bg-accent-soft has-[:checked]:border-accent"
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={relatedProductIds.includes(p._id)}
                  onChange={() => toggleRelated(p._id)}
                />
                {p.title}
              </label>
            ))}
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
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            Published (visible on storefront)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured (shown in &quot;Best sellers&quot;)
          </label>
        </div>
      </Section>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3 sticky bottom-0 bg-bg py-4 border-t border-line">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/products")}>
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
