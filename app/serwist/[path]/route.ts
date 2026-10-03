import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

function gitRevision() {
  const git = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" });
  return git.status === 0 ? git.stdout.trim() : undefined;
}

const revision = process.env.VERCEL_GIT_COMMIT_SHA || gitRevision() || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "app/sw.ts",
  useNativeEsbuild: true,
  // Hero photos are served through /_next/image, so precaching the originals would only waste space.
  globIgnores: ["**/node_modules/**/*", "public/hero/**/*"],
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});
