import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug } from "@/lib/api-products";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { ProductRail } from "@/components/product/product-rail";
import { ProductReviews } from "@/components/product/product-reviews";
import { Product } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchProductBySlug(slug);
    return {
      title: product.seo?.title || product.title,
      description:
        product.seo?.description || product.shortDescription || product.description.slice(0, 160),
      openGraph: {
        title: product.seo?.title || product.title,
        images: product.images.map((img) => ({ url: img.url })),
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product: Product;
  try {
    product = await fetchProductBySlug(slug);
  } catch {
    notFound();
  }

  const relatedProducts = (product.relatedProductIds as Product[]).filter(
    (p) => typeof p === "object" && p?.slug,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription || product.description,
    image: product.images.map((img) => img.url),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    aggregateRating:
      product.ratingsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingsAvg,
            reviewCount: product.ratingsCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.hasVariations
        ? Math.min(...product.variations.map((v) => v.price))
        : product.basePrice,
      availability:
        (product.hasVariations
          ? product.variations.some((v) => v.stock > 0)
          : product.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-page py-10 pb-28 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductGallery images={product.images} title={product.title} />

          <div>
            {product.brand && <p className="text-xs text-muted uppercase tracking-wide">{product.brand}</p>}
            <h1 className="font-display text-3xl mt-1">{product.title}</h1>
            {product.shortDescription && (
              <p className="text-muted mt-2">{product.shortDescription}</p>
            )}

            <div className="mt-6">
              <AddToCartPanel product={product} />
            </div>

            <div className="mt-10 border-t border-line pt-6">
              <h2 className="font-display text-lg mb-3">Description</h2>
              <p className="text-sm text-ink-soft whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        <ProductReviews
          productId={product._id}
          ratingsAvg={product.ratingsAvg}
          ratingsCount={product.ratingsCount}
        />
      </div>

      {relatedProducts.length > 0 && (
        <ProductRail title="You May Also Like" viewAllHref="/collections" products={relatedProducts} />
      )}
    </div>
  );
}
