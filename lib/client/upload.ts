"use client";

import { upload } from "@vercel/blob/client";

const MAX_EDGE = 1600;

/** Phone photos are often 4000px+ and several MB; shrink them before upload when the browser can decode them. */
async function downscale(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadPhoto(
  file: File,
  opts: { folder: "pets" | "lost-found" | "avatars"; blobEnabled: boolean; onProgress?: (pct: number) => void },
): Promise<string> {
  const prepared = await downscale(file);
  if (opts.blobEnabled) {
    const result = await upload(`${opts.folder}/${prepared.name}`, prepared, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: prepared.type,
      onUploadProgress: ({ percentage }) => opts.onProgress?.(percentage),
    });
    return result.url;
  }
  const form = new FormData();
  form.append("file", prepared);
  const res = await fetch("/api/upload/local", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  opts.onProgress?.(100);
  return data.url as string;
}
