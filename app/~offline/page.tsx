import type { Metadata } from "next";
import Image from "next/image";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center sm:py-28">
      <Image src="/logo-mark.png" alt="" width={80} height={80} className="size-20 rounded-full bg-white" loading="eager" />
      <h1 className="mt-6 text-2xl font-bold">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-slate-600 dark:text-slate-400">
        PAWS Connect can&apos;t reach the network right now. Pages you&apos;ve visited recently may still open; everything else will be back once you reconnect.
      </p>
      <RetryButton />
    </div>
  );
}
