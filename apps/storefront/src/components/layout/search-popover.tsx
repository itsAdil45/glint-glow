"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

export function SearchPopover({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-ink p-2 shadow-lg z-50"
    >
      <form action="/collections" className="flex items-center gap-1.5">
        <input
          name="search"
          autoFocus
          placeholder="Search keyword"
          className="h-11 w-full rounded-xl bg-transparent px-3 text-sm text-paper placeholder:text-paper/50 outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="h-11 w-11 shrink-0 rounded-xl bg-accent-ink flex items-center justify-center hover:bg-accent-ink/90 transition-colors"
        >
          <Search size={17} className="text-paper" />
        </button>
      </form>
    </div>
  );
}
