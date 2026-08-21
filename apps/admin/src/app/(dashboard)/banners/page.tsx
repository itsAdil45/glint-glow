"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GripVertical, Plus } from "lucide-react";
import {
  fetchAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  Banner,
  BannerInput,
  BannerLayout,
  BannerImagePosition,
  BannerTheme,
} from "@/lib/api-banners";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { SingleImageUploader } from "@/components/products/single-image-uploader";
import { ApiError, API_URL } from "@/lib/api";

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL.replace(/\/api$/, "")}${url}`;
}

const HOME_SLOTS = [
  { value: 10, label: "10 — right after the categories strip" },
  { value: 20, label: "20 — after Best Sellers" },
  { value: 30, label: "30 — after Makeup" },
  { value: 40, label: "40 — after Skin Care" },
  { value: 50, label: "50 — after Fragrances" },
  { value: 60, label: "60 — after Makeup Accessories" },
  { value: 70, label: "70 — after Lingerie" },
  { value: 80, label: "80 — after New Arrivals (bottom of page)" },
];

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);

  function load() {
    fetchAdminBanners()
      .then(setBanners)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    await deleteBanner(id);
    setBanners((prev) => prev.filter((b) => b._id !== id));
  }

  async function handleToggleActive(banner: Banner) {
    const updated = await updateBanner(banner._id, { isActive: !banner.isActive });
    setBanners((prev) => prev.map((b) => (b._id === banner._id ? updated : b)));
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Banners</h1>
        {!showForm && (
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} /> Add banner
          </Button>
        )}
      </div>
      <p className="text-xs text-muted mb-6">
        Promo banners shown between the product rows on the homepage. &quot;Position&quot; controls where
        each banner slots in among the rows — lower numbers show first.
      </p>

      {showForm && (
        <div className="mb-6">
          <BannerForm
            initial={editing}
            onDone={(banner) => {
              setBanners((prev) => {
                const exists = prev.some((b) => b._id === banner._id);
                const next = exists ? prev.map((b) => (b._id === banner._id ? banner : b)) : [...prev, banner];
                return [...next].sort((a, b) => a.position - b.position);
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
        ) : banners.length === 0 ? (
          <p className="p-5 text-sm text-muted">No banners yet.</p>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="flex items-center gap-4 px-5 py-3">
              <GripVertical size={16} className="text-muted shrink-0" />
              <div className="relative w-24 h-12 rounded bg-bg overflow-hidden shrink-0">
                {banner.image && (
                  <Image src={resolveUrl(banner.image)} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{banner.title}</p>
                <p className="text-xs text-muted truncate">
                  {banner.layout} · {banner.theme}
                </p>
              </div>
              <span className="text-xs text-muted price-tag shrink-0">#{banner.position}</span>
              <label className="flex items-center gap-1.5 text-xs shrink-0">
                <input
                  type="checkbox"
                  checked={banner.isActive}
                  onChange={() => handleToggleActive(banner)}
                />
                Active
              </label>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setEditing(banner);
                    setShowForm(true);
                  }}
                  className="text-xs underline underline-offset-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
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

function BannerForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: Banner | null;
  onDone: (banner: Banner) => void;
  onCancel: () => void;
}) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel || "");
  const [ctaHref, setCtaHref] = useState(initial?.ctaHref || "/products");
  const [image, setImage] = useState(initial?.image || "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt || "");
  const [layout, setLayout] = useState<BannerLayout>(initial?.layout || "split");
  const [imagePosition, setImagePosition] = useState<BannerImagePosition>(initial?.imagePosition || "right");
  const [theme, setTheme] = useState<BannerTheme>(initial?.theme || "dark");
  const [position, setPosition] = useState(initial?.position ?? 25);
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
    const payload: BannerInput = {
      eyebrow,
      title,
      description,
      ctaLabel,
      ctaHref,
      image,
      imageAlt,
      layout,
      imagePosition,
      theme,
      position: Number(position),
      isActive,
    };
    try {
      const result = initial ? await updateBanner(initial._id, payload) : await createBanner(payload);
      onDone(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save banner");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 space-y-4">
      <div>
        <Label>Banner image</Label>
        <SingleImageUploader image={image} onChange={setImage} aspectRatio="21/9" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="banner-layout">Layout</Label>
          <Select id="banner-layout" value={layout} onChange={(e) => setLayout(e.target.value as BannerLayout)}>
            <option value="split">Split (text + image side by side)</option>
            <option value="full-bleed">Full-bleed (text over image)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="banner-theme">Text theme</Label>
          <Select id="banner-theme" value={theme} onChange={(e) => setTheme(e.target.value as BannerTheme)}>
            <option value="dark">Dark background, light text</option>
            <option value="light">Light background, dark text</option>
          </Select>
        </div>

        {layout === "split" && (
          <div>
            <Label htmlFor="banner-image-position">Image side</Label>
            <Select
              id="banner-image-position"
              value={imagePosition}
              onChange={(e) => setImagePosition(e.target.value as BannerImagePosition)}
            >
              <option value="right">Right</option>
              <option value="left">Left</option>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="banner-position">Position on homepage</Label>
          <Select id="banner-position" value={position} onChange={(e) => setPosition(Number(e.target.value))}>
            {HOME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="banner-eyebrow">Eyebrow text</Label>
          <Input
            id="banner-eyebrow"
            placeholder="Sulphate-Free Hair Care"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="banner-title">Title</Label>
          <Input id="banner-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="banner-description">Description</Label>
          <Textarea
            id="banner-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="banner-cta-label">Button label (optional)</Label>
          <Input
            id="banner-cta-label"
            placeholder="Shop Now"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="banner-cta-href">Button / banner link</Label>
          <Input
            id="banner-cta-href"
            placeholder="/category/hair-care"
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="banner-alt">Image alt text</Label>
          <Input id="banner-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
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
