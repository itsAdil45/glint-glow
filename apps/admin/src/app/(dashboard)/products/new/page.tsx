"use client";

import { useEffect, useState } from "react";
import { fetchAdminCategories } from "@/lib/api-categories";
import { fetchAdminProducts } from "@/lib/api-products";
import { Category, Product } from "@/types";
import { ProductForm } from "@/components/products/product-form";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminCategories(), fetchAdminProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">New product</h1>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <ProductForm categories={categories} allProducts={products} />
      )}
    </div>
  );
}
