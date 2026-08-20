import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Category } from "@/types";
import { resolveImageUrl } from "@/lib/utils";

/**
 * Deterministic pick from the accent palette so categories without an image
 * still look intentional (varied, branded) rather than all defaulting to the
 * same flat swatch.
 */
const PLACEHOLDER_GRADIENTS = [
  "from-accent-soft via-paper to-gold-soft",
  "from-gold-soft via-paper to-accent-soft",
  "from-accent-soft via-accent-soft/40 to-paper",
];

function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
}

export function CategoryCard({ category, sizes = "20vw" }: { category: Category; sizes?: string }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface card-shadow transition-shadow"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {category.image ? (
          <>
            <Image
              src={resolveImageUrl(category.image)}
              alt={category.name}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientFor(category._id)}`}
          >
            <span className="font-display text-6xl text-accent-ink/20 select-none">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3.5 border-t border-line">
        <span className="font-display text-base leading-tight">{category.name}</span>
        <ChevronRight
          size={15}
          className="shrink-0 text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent-ink"
        />
      </div>
    </Link>
  );
}
