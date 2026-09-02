"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { uploadImage } from "@/lib/api-products";
import { API_URL } from "@/lib/api";
import { MediaPickerModal } from "@/components/media/media-picker-modal";

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL.replace(/\/api$/, "")}${url}`;
}

export function SingleImageUploader({
  image,
  onChange,
  aspectRatio = "16/6",
  label = "Upload banner image",
}: {
  image: string;
  onChange: (url: string) => void;
  /** CSS aspect-ratio value, e.g. "16/6" (banners) or "4/5" (category cards). */
  aspectRatio?: string;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch {
      setError("Upload failed. Check file type (JPG/PNG/WEBP) and size (max 8MB).");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {image ? (
        <div
          className="relative w-full rounded-lg overflow-hidden border border-line bg-bg group"
          style={{ aspectRatio }}
        >
          <Image src={resolveUrl(image)} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-lg border border-dashed border-line flex flex-col items-center justify-center gap-1.5 text-muted hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
          style={{ aspectRatio }}
        >
          <Upload size={20} />
          <span className="text-xs">{uploading ? "Uploading…" : label}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => handleFile(e.target.files)}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="mt-2 text-xs text-muted underline underline-offset-4 hover:text-ink"
      >
        Choose from library instead
      </button>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode="single"
        onSelect={(urls) => urls[0] && onChange(urls[0])}
      />
    </div>
  );
}
