import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { CartToast } from "@/components/layout/cart-toast";
import { EmergencyBanner } from "@/components/layout/emergency-banner";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/components/providers/cart-provider";
import { FavoritesProvider } from "@/components/providers/favorites-provider";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins", display: "swap" });

const description =
  "PAWS Connect links pets who need a new home directly with safe, screened families in Lubbock and the South Plains. Find shelters, vets, pet insurance, food, and care resources.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: "PAWS Connect - Pets And Their Worlds Connected", template: "%s | PAWS Connect" },
  description,
  applicationName: "PAWS Connect",
  appleWebApp: { capable: true, title: "PAWS", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
  openGraph: {
    title: "PAWS Connect",
    description,
    images: [{ url: "/logo.png", width: 640, height: 640 }],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#58a4af" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-primary-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <PwaProvider>
            <SessionProvider>
              <FavoritesProvider>
              <CartProvider>
                <EmergencyBanner />
                <SiteHeader />
                <main id="main" className="flex-1">
                  {children}
                </main>
                <SiteFooter />
                <div className="h-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />
                <MobileTabBar />
                <CartToast />
                <InstallPrompt />
              </CartProvider>
              </FavoritesProvider>
            </SessionProvider>
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
