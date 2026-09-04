import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Product } from "@/types";
import { PriceTag } from "@/components/ui/price-tag";
import { colorToHex } from "@/lib/colors";
import { cn, resolveImageUrl } from "@/lib/utils";

const NEW_WINDOW_DAYS = 14;
const MAX_SWATCHES = 5;

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];

  const price = product.hasVariations
    ? Math.min(...product.variations.map((v) => v.price))
    : product.basePrice;
  const compareAt = product.hasVariations ? undefined : product.compareAtPrice;
  const discountPct =
    compareAt && compareAt > price
      ? Math.round((1 - price / compareAt) * 100)
      : null;

  // This is a Server Component re-evaluated per request (not statically
  // cached), so comparing against the current time here is safe.
  const isNew =
    // eslint-disable-next-line react-hooks/purity
    Date.now() - new Date(product.createdAt).getTime() <
    NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const colorAttr = product.attributes.find(
    (a) => a.name.toLowerCase() === "color",
  );
  const otherAttrCount = product.attributes.filter(
    (a) => a.name.toLowerCase() !== "color",
  ).length;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-2xl bg-surface overflow-hidden card-shadow transition-shadow duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-accent-soft">
        {primaryImage ? (
          <>
            <Image
              src={resolveImageUrl(primaryImage.url)}
              alt={primaryImage.alt || product.title}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-[1.04]",
                secondaryImage && "group-hover:opacity-0",
              )}
            />
            {secondaryImage && (
              <Image
                src={resolveImageUrl(secondaryImage.url)}
                alt={secondaryImage.alt || product.title}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.04]"
              />
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted text-sm">
            No image
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isNew && (
            <span className="rounded-full bg-surface/90 text-accent-ink px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase shadow-sm">
              New
            </span>
          )}
          {discountPct && (
            <span className="rounded-full bg-accent-ink text-paper px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase shadow-sm">
              −{discountPct}%
            </span>
          )}
        </div>

        <span className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-accent text-white text-center text-xs font-medium py-2.5 opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View product
        </span>
      </div>

      <div className="p-4">
        {product.brand && (
          <p className="text-[11px] text-muted uppercase tracking-wide">
            {product.brand}
          </p>
        )}
        <h3 className="font-display text-lg leading-snug mt-0.5 group-hover:text-accent-ink transition-colors">
          {product.title}
        </h3>

        {product.ratingsCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < Math.round(product.ratingsAvg)
                      ? "fill-gold text-gold"
                      : "fill-none text-line"
                  }
                />
              ))}
            </div>
            <span className="text-[11px] text-muted">
              ({product.ratingsCount})
            </span>
          </div>
        )}

        <div className="mt-1.5 flex items-baseline gap-1.5">
          <PriceTag amount={price} compareAt={compareAt} size="sm" />
          {product.hasVariations && (
            <span className="text-xs text-muted">from</span>
          )}
        </div>

        {(colorAttr || otherAttrCount > 0) && (
          <div className="mt-2.5 flex items-center gap-1.5">
            {colorAttr?.values.slice(0, MAX_SWATCHES).map((value) => {
              const hex = colorToHex(value);
              return (
                <span
                  key={value}
                  title={value}
                  className="h-3.5 w-3.5 rounded-full border border-line shrink-0"
                  style={{ backgroundColor: hex || "#c6c6c2" }}
                />
              );
            })}
            {colorAttr && colorAttr.values.length > MAX_SWATCHES && (
              <span className="text-[11px] text-muted">
                +{colorAttr.values.length - MAX_SWATCHES}
              </span>
            )}
            {otherAttrCount > 0 && (
              <span className="text-[11px] text-muted">
                {colorAttr ? "· " : ""}
                {otherAttrCount} option{otherAttrCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
