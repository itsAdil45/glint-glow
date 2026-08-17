"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="grid grid-cols-[64px_1fr] gap-3">
      <div className="flex flex-col gap-3">
        {images.map((img, i) => (
          <button
            key={img.url + i}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-xl bg-accent-soft border-2",
              i === active ? "border-accent-ink" : "border-transparent",
            )}
          >
            <Image src={img.url} alt={img.alt || title} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-accent-soft card-shadow">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt || title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted text-sm">
            No image
          </div>
        )}
      </div>
    </div>
  );
}
