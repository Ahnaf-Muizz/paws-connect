"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PetStatus } from "@/lib/db/schema";

export function AutoRefresh({ active, everyMs = 20_000 }: { active: boolean; everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), everyMs);
    return () => clearInterval(t);
  }, [active, everyMs, router]);
  return null;
}

export function ApplicationButtons({
  id,
  role,
  canApprove,
  petName,
  applicantName,
}: {
  id: number;
  role: "owner" | "applicant";
  canApprove?: boolean;
  petName: string;
  applicantName?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "decline" | "withdraw") {
    const prompt =
      action === "approve"
        ? `Approve ${applicantName} to adopt ${petName}? Other open applications will be declined.`
        : action === "decline"
          ? `Decline ${applicantName}'s application?`
          : `Withdraw your application for ${petName}?`;
    if (!window.confirm(prompt)) return;
    setBusy(action);
    setError(null);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return setError(data.error ?? "Something went wrong.");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {role === "owner" ? (
          <>
            <button
              type="button"
              onClick={() => act("approve")}
              disabled={!canApprove || !!busy}
              className="btn btn-primary min-h-10 px-4 text-sm"
              title={canApprove ? undefined : "Available once screening finishes"}
            >
              {busy === "approve" ? "Approving..." : "Approve match"}
            </button>
            <button type="button" onClick={() => act("decline")} disabled={!!busy} className="btn btn-outline min-h-10 px-4 text-sm">
              {busy === "decline" ? "Declining..." : "Decline"}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => act("withdraw")} disabled={!!busy} className="btn btn-ghost min-h-10 px-3 text-sm text-rose-600 dark:text-rose-400">
            {busy ? "Withdrawing..." : "Withdraw"}
          </button>
        )}
      </div>
      {role === "owner" && !canApprove && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">You can approve once screening is complete.</p>}
      {error && (
        <p role="alert" className="mt-1 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function PetStatusSelect({ id, status, name }: { id: number; status: PetStatus; name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function change(next: PetStatus) {
    const prev = value;
    setValue(next);
    setBusy(true);
    const res = await fetch(`/api/pets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (!res.ok) setValue(prev);
    else router.refresh();
  }

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value as PetStatus)}
      className="input min-h-10 w-auto py-1.5 text-sm"
      aria-label={`Listing status for ${name}`}
    >
      <option value="available">Available</option>
      <option value="pending">Pending</option>
      <option value="adopted">Adopted</option>
    </select>
  );
}

export function DeletePetButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Remove ${name}'s listing? This can't be undone.`)) return;
        setBusy(true);
        const res = await fetch(`/api/pets/${id}`, { method: "DELETE" });
        setBusy(false);
        if (res.ok) router.refresh();
      }}
      className="btn btn-ghost min-h-10 px-3 text-sm text-rose-600 dark:text-rose-400"
    >
      {busy ? "Removing..." : "Remove"}
    </button>
  );
}
