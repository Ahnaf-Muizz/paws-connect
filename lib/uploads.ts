import os from "node:os";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

export const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export function localUploadDir() {
  return process.env.VERCEL
    ? path.join(/*turbopackIgnore: true*/ os.tmpdir(), "paws-uploads")
    : path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "uploads");
}
