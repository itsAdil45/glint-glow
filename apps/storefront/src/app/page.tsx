import Link from "next/link";
import Image from "next/image";
import { fetchProducts } from "@/lib/api-products";
import { fetchCategories } from "@/lib/api-categories";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    fetchProducts({ limit: 4, sort: "popular" }).catch(() => ({ items: [] })),
    fetchProducts({ limit: 8, sort: "newest" }).catch(() => ({ items: [] })),
    fetchCategories().catch(() => []),
  ]);

  const heroProduct = featured.items[0];

  return (
    <div>
      {/* Hero — asymmetric, photo-led */}
      <section className="bg-gradient-to-br from-accent-soft via-paper to-gold-soft/40 border-b border-line">
        <div className="container-page grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 lg:py-0">
          <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col justify-center py-8 lg:py-24">
            <span className="font-body text-xs tracking-widest text-accent-ink uppercase mb-4">
              New season — now shipping
            </span>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] max-w-lg">
              Beauty and essentials, chosen with care.
            </h1>
            <p className="mt-5 text-muted max-w-md">
              Skincare, makeup, and intimates picked the way we&apos;d choose them
              for ourselves — quality that feels as good as it looks.
            </p>
            <div className="mt-8 flex gap-3">
              <Button size="lg" asChild>
                <Link href="/products">Shop all</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/category/new-arrivals">New arrivals</Link>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 relative aspect-[4/5] lg:aspect-auto lg:my-10 rounded-3xl overflow-hidden bg-accent-soft card-shadow">
            {heroProduct?.images[0] ? (
              <Image
                src={heroProduct.images[0].url}
                alt={heroProduct.images[0].alt || heroProduct.title}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted text-sm">
                Add products to feature them here
              </div>
            )}
          </div>
        </div>
      </section>

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
                    src={category.image}
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
