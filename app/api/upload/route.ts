import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { json, readJson, route } from "@/lib/api";
import { HttpError, getSessionUserId } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, blobEnabled } from "@/lib/uploads";

export const POST = route(async (req) => {
  if (!blobEnabled()) throw new HttpError(503, "Vercel Blob is not configured.");
  const body = (await readJson(req)) as HandleUploadBody;
  const result = await handleUpload({
    body,
    request: req,
    onBeforeGenerateToken: async (pathname) => {
      const uid = await getSessionUserId();
      if (!uid) throw new HttpError(401, "Please log in to upload photos.");
      if (!pathname.startsWith("pets/") && !pathname.startsWith("lost-found/") && !pathname.startsWith("avatars/")) {
        throw new HttpError(400, "Invalid upload path.");
      }
      return {
        allowedContentTypes: ALLOWED_IMAGE_TYPES,
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ uid }),
      };
    },
  });
  return json(result);
});
