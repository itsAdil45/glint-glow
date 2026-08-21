"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { fetchAdminProducts, deleteProduct, updateProduct } from "@/lib/api-products";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { API_URL } from "@/lib/api";

function resolveUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${API_URL.replace(/\/api$/, "")}${url}`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function load() {
    fetchAdminProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }

  async function handleToggle(product: Product, field: "isPublished" | "isFeatured") {
    const nextValue = !product[field];
    setPendingId(product._id);
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, [field]: nextValue } : p)),
    );
    try {
      await updateProduct(product._id, { [field]: nextValue });
    } catch {
      // roll back on failure
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, [field]: !nextValue } : p)),
      );
      alert(`Could not update ${field === "isPublished" ? "published" : "best seller"} status`);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button asChild>
          <Link href="/products/new">
            <Plus size={16} /> New product
          </Link>
        </Button>
      </div>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg border-b border-line text-xs text-muted uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-5 py-3 font-medium">Price</th>
              <th className="text-left px-5 py-3 font-medium">Stock</th>
              <th className="text-left px-5 py-3 font-medium">Published</th>
              <th className="text-left px-5 py-3 font-medium">Best Seller</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = product.hasVariations
                ? product.variations.reduce((s, v) => s + v.stock, 0)
                : product.stock;
              const price = product.hasVariations
                ? Math.min(...product.variations.map((v) => v.price || 0))
                : product.basePrice;

              return (
                <tr key={product._id} className="border-t border-line hover:bg-bg/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded bg-bg overflow-hidden shrink-0">
                        {product.images[0] && (
                          <Image
                            src={resolveUrl(product.images[0].url)}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.title}</p>
                        {product.hasVariations && (
                          <p className="text-xs text-muted">{product.variations.length} variations</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 price-tag">
                    {product.hasVariations ? "from " : ""}
                    {formatPrice(price)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={stock <= 5 ? "text-warn font-medium" : ""}>{stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    <Switch
                      checked={product.isPublished}
                      onChange={() => handleToggle(product, "isPublished")}
                      disabled={pendingId === product._id}
                      label={`Toggle published for ${product.title}`}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <Switch
                      checked={product.isFeatured}
                      onChange={() => handleToggle(product, "isFeatured")}
                      disabled={pendingId === product._id}
                      label={`Toggle best seller for ${product.title}`}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/products/${product._id}/edit`}
                        className="text-xs underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-xs text-danger underline underline-offset-4"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted text-sm">
                  No products yet.{" "}
                  <Link href="/products/new" className="underline underline-offset-4">
                    Create your first one
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
