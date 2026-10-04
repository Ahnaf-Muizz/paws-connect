"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { APPOINTMENT_KIND_META, APPOINTMENT_KINDS } from "@/lib/appointments";
import { eventDate, eventTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function AppointmentForm({
  petId,
  petName,
  slots,
}: {
  petId: number;
  petName: string;
  slots: string[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof APPOINTMENT_KINDS)[number]>("meet-greet");
  const [scheduledAt, setScheduledAt] = useState(slots[0] ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId, kind, scheduledAt, notes: notes.trim() || null }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not book that appointment.");
      return;
    }
    router.push("/dashboard?booked=1");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-5 p-5 sm:p-6">
      <fieldset>
        <legend className="label">Visit type</legend>
        <div role="radiogroup" aria-label="Visit type" className="grid gap-2">
          {APPOINTMENT_KINDS.map((k) => {
            const meta = APPOINTMENT_KIND_META[k];
            const selected = kind === k;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  selected
                    ? "border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-950"
                    : "border-slate-200 bg-white hover:border-primary-300 dark:border-slate-700 dark:bg-slate-900",
                )}
              >
                <span className="block font-semibold text-slate-900 dark:text-white">{meta.label}</span>
                <span className="mt-0.5 block text-sm text-slate-600 dark:text-slate-400">{meta.detail}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div>
        <label htmlFor="slot" className="label">
          Time (Central)
        </label>
        <select id="slot" required className="input" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}>
          {slots.map((iso) => {
            const d = new Date(iso);
            return (
              <option key={iso} value={iso}>
                {eventDate(d)} · {eventTime(d)}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="label">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input"
          placeholder={`Anything the owner should know before meeting ${petName}.`}
        />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || !scheduledAt} className="btn btn-primary min-h-12 w-full text-base">
        {busy ? "Booking..." : "Request appointment"}
      </button>
    </form>
  );
}
