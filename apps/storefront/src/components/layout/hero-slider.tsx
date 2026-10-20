"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/hero-slides-data";
import { cn, resolveImageUrl } from "@/lib/utils";

const AUTOPLAY_MS = 5500;
// How long after mount the non-first slides start loading. Keeps them from
// competing with slide 1 (the LCP image) for bandwidth on slow connections.
const PRELOAD_REST_MS = 3000;

// Slides come in as props from the server (see app/page.tsx) so the first
// slide's <img> + preload hint are in the initial HTML.
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [loadRest, setLoadRest] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoadRest(true), PRELOAD_REST_MS);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((i: number, count: number) => {
    setIndex(((i % count) + count) % count);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  function handleManualNav(next: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    goTo(next, slides.length);
  }

  if (slides.length === 0) return null;

  return (
    <div className="container-page pt-6">
      <div className="relative aspect-[20/9] sm:aspect-[16/6] overflow-hidden rounded-3xl shadow-none md:card-shadow">
        {slides.map((s, i) => {
          // Slide 0 always renders (it's the LCP image); the rest mount once
          // the page has settled, or immediately if the user navigates to one.
          if (i !== 0 && i !== index && !loadRest) return null;
          return (
            <div
              key={s.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === index ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              <a href={s.ctaHref} target="_blank" rel="noopener noreferrer">
                <Image
                  src={resolveImageUrl(s.image)}
                  alt={s.imageAlt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-contain md:object-cover"
                  fetchPriority={i === 0 ? "high" : "low"}
                />
              </a>
            </div>
          );
        })}

        {slides.length > 1 && (
          <>
            <button
              aria-label="Previous slide"
              onClick={() => handleManualNav(index - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-paper/90 flex items-center justify-center hover:bg-paper transition-colors"
            >
              <ChevronLeft size={18} className="text-ink" />
            </button>
            <button
              aria-label="Next slide"
              onClick={() => handleManualNav(index + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-paper/90 flex items-center justify-center hover:bg-paper transition-colors"
            >
              <ChevronRight size={18} className="text-ink" />
            </button>

            {/* Buttons are 24px tall for a usable touch target; the visible
                dot is the inner span, so the look is unchanged. */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => handleManualNav(i)}
                  className="group flex h-6 items-center justify-center px-1"
                >
                  <span
                    className={cn(
                      "block h-2 rounded-full transition-all",
                      i === index
                        ? "w-7 bg-paper"
                        : "w-2 bg-paper/50 group-hover:bg-paper/75",
                    )}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
