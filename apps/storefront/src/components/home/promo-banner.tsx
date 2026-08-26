import Link from "next/link";
import Image from "next/image";
import { Banner } from "@/lib/banners-data";
import { Button } from "@/components/ui/button";
import { cn, resolveImageUrl } from "@/lib/utils";

export function PromoBanner({ banner }: { banner: Banner }) {
  if (banner.layout === "full-bleed")
    return <FullBleedBanner banner={banner} />;
  return <SplitBanner banner={banner} />;
}

function SplitBanner({ banner }: { banner: Banner }) {
  const imageFirst = banner.imagePosition === "left";
  const light = banner.theme === "light";

  return (
    <section className="container-page py-8">
      <div
        className={cn(
          "rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch",
          light ? "bg-accent-soft text-ink" : "bg-white text-paper",
        )}
      >
        <div
          className={cn(
            "flex flex-col justify-center gap-4 px-8 py-12 md:px-14",
            imageFirst ? "md:order-2" : "md:order-1",
          )}
        >
          {banner.eyebrow && (
            <span
              className={cn(
                "font-body text-xs tracking-widest uppercase",
                light ? "text-accent-ink" : "text-gold",
              )}
            >
              {banner.eyebrow}
            </span>
          )}
          <h3 className="font-display text-3xl sm:text-4xl max-w-md text-black">
            {banner.title}
          </h3>
          {banner.description && (
            <p
              className={cn(
                "max-w-md text-sm sm:text-base",
                light ? "text-ink/75" : "text-black",
              )}
            >
              {banner.description}
            </p>
          )}
          {banner.ctaLabel && (
            <Button variant="accent" size="lg" className="mt-2 w-fit" asChild>
              <Link href={banner.ctaHref}>{banner.ctaLabel}</Link>
            </Button>
          )}
        </div>
        <div
          className={cn(
            "relative min-h-[260px]",
            imageFirst ? "md:order-1" : "md:order-2",
          )}
        >
          <Image
            src={resolveImageUrl(banner.image)}
            alt={banner.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function FullBleedBanner({ banner }: { banner: Banner }) {
  const light = banner.theme === "light";
  const content = (
    <div className="relative aspect-[16/9] sm:aspect-[21/7] w-full overflow-hidden rounded-3xl card-shadow">
      <Image
        src={resolveImageUrl(banner.image)}
        alt={banner.imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      {!light && <div className="absolute inset-0 bg-ink/25" />}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
        {banner.eyebrow && (
          <span
            className={cn(
              "font-body text-xs tracking-widest uppercase",
              light ? "text-ink/70" : "text-paper/85",
            )}
          >
            {banner.eyebrow}
          </span>
        )}
        <h3
          className={cn(
            "font-display text-4xl sm:text-6xl leading-[1.05]",
            light ? "text-ink" : "text-paper",
          )}
        >
          {banner.title}
        </h3>
        {banner.description && (
          <p
            className={cn(
              "max-w-lg text-sm sm:text-base",
              light ? "text-ink/75" : "text-paper/90",
            )}
          >
            {banner.description}
          </p>
        )}
        {banner.ctaLabel && (
          <Button variant="accent" size="lg" className="mt-2" asChild>
            <Link href={banner.ctaHref}>{banner.ctaLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <section className="container-page py-8">
      {banner.ctaLabel ? content : <Link href={banner.ctaHref}>{content}</Link>}
    </section>
  );
}
