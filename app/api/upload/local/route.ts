import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { json, route } from "@/lib/api";
import { HttpError, requireApiUser } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, localUploadDir } from "@/lib/uploads";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

export const POST = route(async (req) => {
  await requireApiUser();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No file received.");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new HttpError(415, "Please upload a JPG, PNG, WebP, GIF, or HEIC image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Photos must be 8 MB or smaller.");

  const dir = localUploadDir();
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${EXT[file.type]}`;
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), Buffer.from(await file.arrayBuffer()));
  return json({ url: `/api/upload/local/${name}` }, { status: 201 });
});
