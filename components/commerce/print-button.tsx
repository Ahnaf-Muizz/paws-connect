"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-ghost min-h-10 px-3 text-sm print:hidden">
      <Printer className="size-4" aria-hidden /> Print
    </button>
  );
}
