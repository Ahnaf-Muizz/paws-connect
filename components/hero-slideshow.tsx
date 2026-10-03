"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = { src: string; alt: string };

const INTERVAL_MS = 6000;
const SWIPE_PX = 40;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function HeroSlideshow({ slides, sizes, label }: { slides: Slide[]; sizes: string; label: string }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);
  const [held, setHeld] = useState(false);
  const touchX = useRef<number | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);

  // Autoplay is opt-in for people who prefer reduced motion; everyone else can pause it.
  const playing = playChoice ?? !reducedMotion;

  useEffect(() => {
    if (!playing || held || count < 2) return;
    const id = window.setTimeout(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [index, playing, held, count]);

  const go = (n: number) => setIndex((n + count) % count);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="group relative aspect-4/3 overflow-hidden rounded-3xl bg-primary-100 dark:bg-slate-800"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div aria-live={playing && !held ? "off" : "polite"}>
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes={sizes}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100 sm:flex dark:bg-slate-900/85 dark:text-slate-100"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100 sm:flex dark:bg-slate-900/85 dark:text-slate-100"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>

          <div className="absolute top-3 right-3 flex items-center rounded-full bg-slate-950/45 px-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setPlayChoice(!playing)}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              className="flex size-8 items-center justify-center rounded-full text-white"
            >
              {playing ? <Pause className="size-3.5" fill="currentColor" aria-hidden /> : <Play className="size-3.5" fill="currentColor" aria-hidden />}
            </button>
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className="flex h-8 w-6 items-center justify-center"
              >
                <span className={cn("h-2 rounded-full bg-white transition-all", i === index ? "w-4" : "w-2 opacity-60")} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
