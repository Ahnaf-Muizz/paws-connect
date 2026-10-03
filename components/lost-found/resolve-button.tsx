"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";

export function ResolveButton({ id, kind }: { id: number; kind: "lost" | "found" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function resolve() {
    if (!confirm(kind === "lost" ? "Mark this pet as home safe? The report will be removed." : "Mark this pet as reunited with its owner?")) return;
    setBusy(true);
    const res = await fetch(`/api/lost-found/${id}`, { method: "PATCH" });
    if (res.ok) router.refresh();
    else {
      alert((await res.json().catch(() => ({}))).error ?? "Could not update the report.");
      setBusy(false);
    }
  }
  return (
    <button type="button" onClick={resolve} disabled={busy} className="btn btn-primary min-h-10 flex-1">
      <PartyPopper className="size-4" aria-hidden /> {kind === "lost" ? "Home safe" : "Reunited"}
    </button>
  );
}
