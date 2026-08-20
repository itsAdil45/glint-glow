"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { ProductRailCard } from "./product-rail-card";

export function ProductRail({
  title,
  viewAllHref,
  products,
}: {
  title: string;
  viewAllHref: string;
  products: Product[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState, products]);

  function scrollByAmount(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  const barWidthPct = products.length > 4 ? Math.max(progress * 100, 15) : 100;

  return (
    <section className="border-t-2 border-accent-ink py-10">
      <div className="container-page">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-3xl">{title}</h2>
          <Link href={viewAllHref} className="text-sm font-medium underline underline-offset-4">
            View All
          </Link>
        </div>

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-5 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <ProductRailCard key={product._id} product={product} />
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <div className="h-0.5 flex-1 bg-line relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-ink transition-[width] duration-150"
              style={{ width: `${barWidthPct}%` }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              aria-label="Scroll left"
              onClick={() => scrollByAmount(-1)}
              disabled={!canScrollLeft}
              className="h-9 w-9 rounded-full border border-line flex items-center justify-center hover:border-ink transition-colors disabled:opacity-30 disabled:hover:border-line"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scrollByAmount(1)}
              disabled={!canScrollRight}
              className="h-9 w-9 rounded-full border border-line flex items-center justify-center hover:border-ink transition-colors disabled:opacity-30 disabled:hover:border-line"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
