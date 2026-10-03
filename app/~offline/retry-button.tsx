"use client";

import { RefreshCw } from "lucide-react";

export function RetryButton() {
  return (
    <button type="button" onClick={() => window.location.reload()} className="btn btn-primary mt-6">
      <RefreshCw className="size-4" aria-hidden /> Try again
    </button>
  );
}
