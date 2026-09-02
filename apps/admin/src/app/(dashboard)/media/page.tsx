"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, Copy, Check, Loader2 } from "lucide-react";
import { fetchMediaAssets, MediaAsset } from "@/lib/api-media";
import { Input } from "@/components/ui/input";

export default function MediaLibraryPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when the search term actually changes — computed
  // during render rather than in a dedicated effect; see the media picker
  // modal for the same pattern and why.
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setPage(1);
  }

  useEffect(() => {
    fetchMediaAssets({ search: debouncedSearch, page, limit: 30 })
      .then((res) => {
        setAssets(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  async function handleCopy(asset: MediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset._id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard access denied — non-critical, just skip the confirmation */
    }
  }

  return (
    <div className="p-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <span className="text-sm text-muted">{total} image{total === 1 ? "" : "s"}</span>
      </div>
      <p className="mb-6 text-xs text-muted">
        Every image uploaded anywhere in the admin — products, categories, hero slides, banners —
        collects here automatically for reuse. Uploading here does nothing on its own; pick
        &quot;Choose existing&quot; from any image field elsewhere to reuse one of these instead of
        uploading again.
      </p>

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename…"
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted">
          No images yet. Upload one from a product, category, hero slide, or banner — it&apos;ll show
          up here automatically.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {assets.map((asset) => (
            <div
              key={asset._id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface"
            >
              <Image
                src={asset.thumbnailUrl || asset.url}
                alt={asset.filename || ""}
                fill
                sizes="180px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {asset.filename || "untitled"}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(asset)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Copy image URL"
              >
                {copiedId === asset._id ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
