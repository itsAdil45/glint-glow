"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Search, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchMediaAssets, MediaAsset } from "@/lib/api-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MediaPickerModal({
  open,
  onOpenChange,
  mode = "single",
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "single" replaces the selection on each click; "multi" accumulates. */
  mode?: "single" | "multi";
  onSelect: (urls: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when the search term actually changes, and reset
  // selection/search when the modal closes — computed during render
  // (React's recommended pattern for "adjusting state when a dependency
  // changes") rather than in a dedicated effect, since a setState call
  // directly in an effect body causes an extra cascading render.
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setPage(1);
  }

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setLoading(true);
    } else {
      setSelected([]);
      setSearch("");
    }
  }

  useEffect(() => {
    if (!open) return;
    fetchMediaAssets({ search: debouncedSearch, page })
      .then((res) => {
        setAssets(res.items);
        setTotalPages(res.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [open, debouncedSearch, page]);

  function toggle(url: string) {
    if (mode === "single") {
      setSelected([url]);
      return;
    }
    setSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  }

  function handleInsert() {
    onSelect(selected);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Dialog.Title className="text-sm font-medium">Media Library</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="text-muted hover:text-ink" aria-label="Close">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="border-b border-line px-5 py-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : assets.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted">
                No images yet. Upload one first — it&apos;ll show up here for reuse next time.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {assets.map((asset) => {
                  const isSelected = selected.includes(asset.url);
                  return (
                    <button
                      key={asset._id}
                      type="button"
                      onClick={() => toggle(asset.url)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-md border-2 bg-bg",
                        isSelected ? "border-accent" : "border-transparent hover:border-line",
                      )}
                    >
                      <Image
                        src={asset.thumbnailUrl || asset.url}
                        alt={asset.filename || ""}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      {isSelected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                          <Check size={12} className="text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                {selected.length > 0 ? `${selected.length} selected` : ""}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleInsert} disabled={selected.length === 0}>
                Insert
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
