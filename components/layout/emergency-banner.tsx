import Link from "next/link";
import { Phone, Siren } from "lucide-react";

export function EmergencyBanner() {
  return (
    <div className="bg-primary-950 text-primary-50 pt-safe">
      <div className="container-page flex min-h-9 items-center justify-center gap-x-3 gap-y-1 py-1.5 text-xs sm:text-sm">
        <Siren className="hidden size-4 shrink-0 text-accent-300 sm:block" aria-hidden />
        <span className="font-medium">Pet emergency?</span>
        <Link href="/vets?emergency=1" className="underline-offset-2 hover:underline">
          Find 24/7 vets
        </Link>
        <span aria-hidden className="text-primary-400">|</span>
        <a href="tel:+18884264435" className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
          <Phone className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">ASPCA Poison Control</span>
          <span className="sm:hidden">Poison Control</span>
          <span className="hidden md:inline">(888) 426-4435</span>
        </a>
      </div>
    </div>
  );
}
