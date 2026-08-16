"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAdminCategories } from "@/lib/api-categories";
import { fetchAdminProduct, fetchAdminProducts } from "@/lib/api-products";
import { Category, Product } from "@/types";
import { ProductForm } from "@/components/products/product-form";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAdminCategories(),
      fetchAdminProducts(),
      fetchAdminProduct(params.id),
    ])
      .then(([cats, prods, prod]) => {
        setCategories(cats);
        setProducts(prods);
        setProduct(prod);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Edit product</h1>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : product ? (
        <ProductForm categories={categories} allProducts={products} initial={product} />
      ) : (
        <p className="text-sm text-muted">Product not found.</p>
      )}
    </div>
  );
}
