"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchHeroSlides, HeroSlide } from "@/lib/hero-slides-data";
import { Button } from "@/components/ui/button";
import { cn, resolveImageUrl } from "@/lib/utils";

const AUTOPLAY_MS = 5500;

export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchHeroSlides().then(setSlides);
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

  if (slides.length === 0) {
    return (
      <div className="container-page pt-6">
        <div className="aspect-[16/7] rounded-3xl bg-accent-soft animate-pulse" />
      </div>
    );
  }

  const slide = slides[index];

  return (
    <div className="container-page pt-6">
      <div className="relative aspect-[16/9] sm:aspect-[16/6] overflow-hidden rounded-3xl card-shadow">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <Image
              src={resolveImageUrl(s.image)}
              alt={s.imageAlt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/25 to-transparent" />
          </div>
        ))}

        <div className="relative h-full flex items-center px-8 sm:px-14">
          <div className="max-w-md">
            <span className="font-body text-xs tracking-widest text-paper/80 uppercase">
              {slide.eyebrow}
            </span>
            <h2 className="font-display text-4xl sm:text-6xl text-paper leading-[1.05] mt-2">
              {slide.title}
            </h2>
            <p className="text-paper/85 mt-4 max-w-sm text-sm sm:text-base">{slide.subtitle}</p>
            <Button variant="accent" size="lg" className="mt-6" asChild>
              <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
            </Button>
          </div>
        </div>

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

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => handleManualNav(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-7 bg-paper" : "w-2 bg-paper/50 hover:bg-paper/75",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
