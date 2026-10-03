"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Star, X } from "lucide-react";
import { uploadPhoto } from "@/lib/client/upload";
import { cn } from "@/lib/utils";

type Pending = { key: string; preview: string; progress: number };

export function PhotoUploader({
  value,
  onChange,
  max = 6,
  folder,
  blobEnabled,
  label = "Photos",
}: {
  value: string[];
  onChange: (update: (prev: string[]) => string[]) => void;
  max?: number;
  folder: "pets" | "lost-found" | "avatars";
  blobEnabled: boolean;
  label?: string;
}) {
  const id = useId();
  const libraryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [error, setError] = useState<string | null>(null);
  const room = max - value.length - pending.length;

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > list.length) setError(`You can add up to ${max} photos.`);
    await Promise.all(
      list.map(async (file) => {
        if (!file.type.startsWith("image/")) {
          setError("Please choose an image file.");
          return;
        }
        const key = `${file.name}-${file.lastModified}-${Math.random()}`;
        const preview = URL.createObjectURL(file);
        setPending((p) => [...p, { key, preview, progress: 0 }]);
        try {
          const url = await uploadPhoto(file, {
            folder,
            blobEnabled,
            onProgress: (progress) => setPending((p) => p.map((x) => (x.key === key ? { ...x, progress } : x))),
          });
          onChange((prev) => [...prev, url].slice(0, max));
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed. Try again.");
        } finally {
          setPending((p) => p.filter((x) => x.key !== key));
          URL.revokeObjectURL(preview);
        }
      }),
    );
  }

  const remove = (url: string) => onChange((prev) => prev.filter((u) => u !== url));
  const makeCover = (url: string) => onChange((prev) => [url, ...prev.filter((u) => u !== url)]);

  return (
    <div>
      <p className="label" id={`${id}-label`}>
        {label} <span className="font-normal text-slate-500">({value.length}/{max})</span>
      </p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-labelledby={`${id}-label`}>
        {value.map((url, i) => (
          <li key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            <Image src={url} alt={`Photo ${i + 1}`} fill sizes="160px" className="object-cover" unoptimized={url.startsWith("/api/")} />
            {i === 0 && <span className="absolute bottom-1 left-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
            <div className="absolute top-1 right-1 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  className="flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow"
                  aria-label={`Make photo ${i + 1} the cover`}
                >
                  <Star className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="flex size-8 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {pending.map((p) => (
          <li key={p.key} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview */}
            <img src={p.preview} alt="" className="size-full object-cover opacity-50" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-800 dark:text-white">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {Math.round(p.progress)}%
            </span>
          </li>
        ))}
        {room > 0 && (
          <li className="aspect-square">
            <button
              type="button"
              onClick={() => libraryRef.current?.click()}
              className={cn(
                "flex size-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-600 transition hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:text-slate-400",
              )}
            >
              <ImagePlus className="size-6" aria-hidden />
              Add photos
            </button>
          </li>
        )}
      </ul>
      {room > 0 && (
        <button type="button" onClick={() => cameraRef.current?.click()} className="btn btn-outline mt-3 w-full sm:hidden">
          <Camera className="size-4" aria-hidden /> Take a photo
        </button>
      )}
      <input ref={libraryRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={(e) => (handle(e.target.files), (e.target.value = ""))} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => (handle(e.target.files), (e.target.value = ""))}
      />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        JPG, PNG, WebP, or HEIC. Large photos are resized automatically. The first photo is the cover.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
