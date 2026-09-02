"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, Upload, GripVertical, Library } from "lucide-react";
import { ProductImage } from "@/types";
import { uploadImage } from "@/lib/api-products";
import { API_URL } from "@/lib/api";
import { MediaPickerModal } from "@/components/media/media-picker-modal";

function resolveUrl(url: string) {
  if (url.startsWith("http")) return url;
  // backend serves /uploads/... from its own origin, not the /api prefix
  return `${API_URL.replace(/\/api$/, "")}${url}`;
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadImage(file);
        uploaded.push({ url, alt: "" });
      }
      onChange([...images, ...uploaded]);
    } catch {
      setError("Upload failed. Check file type (JPG/PNG/WEBP) and size (max 8MB).");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function updateAlt(index: number, alt: string) {
    onChange(images.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  function handleDrop(index: number) {
    if (dragIndex.current === null || dragIndex.current === index) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    onChange(next);
    dragIndex.current = null;
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-3">
        {images.map((img, i) => (
          <div
            key={img.url + i}
            draggable
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="relative group border border-line rounded-md overflow-hidden bg-bg"
          >
            <div className="relative aspect-square">
              <Image src={resolveUrl(img.url)} alt={img.alt || ""} fill className="object-cover" />
            </div>
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={13} />
            </button>
            <div className="absolute top-1 left-1 bg-white/90 rounded p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={13} />
            </div>
            <input
              placeholder="Alt text"
              value={img.alt || ""}
              onChange={(e) => updateAlt(i, e.target.value)}
              className="w-full text-[10px] px-1.5 py-1 border-t border-line outline-none"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square border border-dashed border-line rounded-md flex flex-col items-center justify-center gap-1 text-muted hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
        >
          <Upload size={18} />
          <span className="text-xs">{uploading ? "Uploading…" : "Add image"}</span>
        </button>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="aspect-square border border-dashed border-line rounded-md flex flex-col items-center justify-center gap-1 text-muted hover:border-ink hover:text-ink transition-colors"
        >
          <Library size={18} />
          <span className="text-xs">Choose existing</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-danger">{error}</p>}

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode="multi"
        onSelect={(urls) => onChange([...images, ...urls.map((url) => ({ url, alt: "" }))])}
      />
    </div>
  );
}
