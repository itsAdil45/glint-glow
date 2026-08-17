"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-14">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="h-9 w-9 rounded-full flex items-center justify-center border border-line hover:border-accent-ink transition-colors disabled:opacity-30 disabled:hover:border-line"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-body">{page} / {totalPages}</span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="h-9 w-9 rounded-full flex items-center justify-center border border-line hover:border-accent-ink transition-colors disabled:opacity-30 disabled:hover:border-line"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
