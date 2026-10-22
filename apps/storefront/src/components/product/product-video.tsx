"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

// Click-to-play YouTube embed. Until the shopper presses play only a poster
// image is rendered, so the product page doesn't load YouTube's player
// scripts (several hundred KB) for a video most visitors won't watch. Uses
// the privacy-enhanced youtube-nocookie.com domain.
export function ProductVideo({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-accent-soft">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`${title} — video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/95 card-shadow">
              <Play size={26} className="ml-1 text-ink" fill="currentColor" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
