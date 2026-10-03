/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const PRIVATE_PAGES = /^\/(dashboard|profile|matches|rehome|checkout|orders|messages|favorites|cart|login|register)(\/|$)/;

// Authenticated responses must never be replayed from cache (e.g. after logout or for another user).
const privateNetworkOnly: RuntimeCaching = {
  matcher: ({ sameOrigin, url: { pathname } }) => sameOrigin && (pathname.startsWith("/api/") || PRIVATE_PAGES.test(pathname)),
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [privateNetworkOnly, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
