"use client";

import Image from "next/image";
import { useState } from "react";
import { Bird, Cat, Dog, Rabbit } from "lucide-react";
import type { Species } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const ICONS = { dog: Dog, cat: Cat, rabbit: Rabbit, bird: Bird };

export function PetImage({
  src,
  alt,
  species = "dog",
  sizes,
  priority,
  className,
}: {
  src?: string | null;
  alt: string;
  species?: Species;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = ICONS[species];
  if (!src || failed) {
    return (
      <div
        className={cn("absolute inset-0 flex items-center justify-center bg-primary-50 text-primary-400 dark:bg-slate-800 dark:text-primary-500", className)}
        role="img"
        aria-label={alt}
      >
        <Icon className="size-1/3 max-h-24 max-w-24" strokeWidth={1.25} />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
