import Link from "next/link";
import Image from "next/image";
import { fetchProducts } from "@/lib/api-products";
import { fetchCategories } from "@/lib/api-categories";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/layout/hero-slider";
import { resolveImageUrl } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    fetchProducts({ limit: 4, sort: "popular" }).catch(() => ({ items: [] })),
    fetchProducts({ limit: 8, sort: "newest" }).catch(() => ({ items: [] })),
    fetchCategories().catch(() => []),
  ]);

  return (
    <div>
      <HeroSlider />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <h2 className="font-display text-2xl mb-6">Shop by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-accent-soft card-shadow"
              >
                {category.image && (
                  <Image
                    src={resolveImageUrl(category.image)}
                    alt={category.name}
                    fill
                    sizes="20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-surface/90 px-3 py-2.5 text-sm font-medium text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.items.length > 0 && (
        <section className="container-page py-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl">Best sellers</h2>
            <Link href="/products" className="text-sm text-accent-ink underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promo banner */}
      <section className="container-page py-8">
        <div className="rounded-3xl bg-gradient-to-br from-ink to-ink-soft text-paper px-8 py-12 flex flex-col items-start gap-4">
          <span className="font-body text-xs tracking-widest uppercase text-gold">
            Cash on delivery, everywhere
          </span>
          <h3 className="font-display text-3xl max-w-md">
            Order now, pay when it arrives at your door.
          </h3>
          <Button variant="accent" size="lg" asChild>
            <Link href="/products">Start shopping</Link>
          </Button>
        </div>
      </section>

      {/* Latest arrivals */}
      {latest.items.length > 0 && (
        <section className="container-page py-8 pb-20">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl">New arrivals</h2>
            <Link href="/products?sort=newest" className="text-sm text-accent-ink underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {latest.items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
