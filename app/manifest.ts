import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PAWS Connect",
    short_name: "PAWS",
    description: "Pets And Their Worlds Connected. Match with adoptable pets, rehome safely, and find trusted pet care around Lubbock, TX.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#58a4af",
    categories: ["lifestyle", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Find pets", url: "/pets", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "My matches", url: "/matches", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Rehome a pet", url: "/rehome", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Report lost or found", url: "/lost-found", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
