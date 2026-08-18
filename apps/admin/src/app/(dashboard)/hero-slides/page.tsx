"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GripVertical, Plus } from "lucide-react";
import {
  fetchAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  HeroSlide,
  HeroSlideInput,
} from "@/lib/api-hero-slides";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SingleImageUploader } from "@/components/products/single-image-uploader";
import { ApiError, API_URL } from "@/lib/api";

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL.replace(/\/api$/, "")}${url}`;
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);

  function load() {
    fetchAdminHeroSlides()
      .then(setSlides)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this slide?")) return;
    await deleteHeroSlide(id);
    setSlides((prev) => prev.filter((s) => s._id !== id));
  }

  async function handleToggleActive(slide: HeroSlide) {
    const updated = await updateHeroSlide(slide._id, { isActive: !slide.isActive });
    setSlides((prev) => prev.map((s) => (s._id === slide._id ? updated : s)));
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Hero Slides</h1>
        {!showForm && (
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} /> Add slide
          </Button>
        )}
      </div>
      <p className="text-xs text-muted mb-6">
        Slides shown in the homepage banner, in order. Lower &quot;Order&quot; numbers show first.
      </p>

      {showForm && (
        <div className="mb-6">
          <HeroSlideForm
            initial={editing}
            onDone={(slide) => {
              setSlides((prev) => {
                const exists = prev.some((s) => s._id === slide._id);
                const next = exists ? prev.map((s) => (s._id === slide._id ? slide : s)) : [...prev, slide];
                return [...next].sort((a, b) => a.order - b.order);
              });
              setShowForm(false);
              setEditing(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="bg-surface border border-line rounded-lg divide-y divide-line">
        {loading ? (
          <p className="p-5 text-sm text-muted">Loading…</p>
        ) : slides.length === 0 ? (
          <p className="p-5 text-sm text-muted">No slides yet.</p>
        ) : (
          slides.map((slide) => (
            <div key={slide._id} className="flex items-center gap-4 px-5 py-3">
              <GripVertical size={16} className="text-muted shrink-0" />
              <div className="relative w-24 h-12 rounded bg-bg overflow-hidden shrink-0">
                {slide.image && (
                  <Image src={resolveUrl(slide.image)} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{slide.title}</p>
                <p className="text-xs text-muted truncate">{slide.subtitle}</p>
              </div>
              <span className="text-xs text-muted price-tag shrink-0">#{slide.order}</span>
              <label className="flex items-center gap-1.5 text-xs shrink-0">
                <input
                  type="checkbox"
                  checked={slide.isActive}
                  onChange={() => handleToggleActive(slide)}
                />
                Active
              </label>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setEditing(slide);
                    setShowForm(true);
                  }}
                  className="text-xs underline underline-offset-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slide._id)}
                  className="text-xs text-danger underline underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HeroSlideForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: HeroSlide | null;
  onDone: (slide: HeroSlide) => void;
  onCancel: () => void;
}) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel || "Shop Now");
  const [ctaHref, setCtaHref] = useState(initial?.ctaHref || "/products");
  const [image, setImage] = useState(initial?.image || "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt || "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      setError("Please upload a banner image");
      return;
    }
    setSubmitting(true);
    setError("");
    const payload: HeroSlideInput = {
      eyebrow,
      title,
      subtitle,
      ctaLabel,
      ctaHref,
      image,
      imageAlt,
      order: Number(order),
      isActive,
    };
    try {
      const result = initial ? await updateHeroSlide(initial._id, payload) : await createHeroSlide(payload);
      onDone(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save slide");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 space-y-4">
      <div>
        <Label>Banner image</Label>
        <SingleImageUploader image={image} onChange={setImage} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="slide-eyebrow">Eyebrow text</Label>
          <Input
            id="slide-eyebrow"
            placeholder="New Season"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="slide-title">Title</Label>
          <Input id="slide-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="slide-subtitle">Subtitle</Label>
          <Textarea
            id="slide-subtitle"
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="slide-cta-label">Button label</Label>
          <Input id="slide-cta-label" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="slide-cta-href">Button link</Label>
          <Input
            id="slide-cta-href"
            placeholder="/category/makeup"
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="slide-alt">Image alt text</Label>
          <Input id="slide-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="slide-order">Order</Label>
          <Input
            id="slide-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible on storefront)
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
