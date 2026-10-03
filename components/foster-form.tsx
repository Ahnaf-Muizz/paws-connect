"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { RadioCards } from "@/components/form-controls";
import { ToggleChip, toggleValue } from "@/components/toggle-chip";
import { SPECIES } from "@/lib/validators";

const DURATIONS = ["2 weeks", "1 month", "3 months", "Until adopted"] as const;
type Species = (typeof SPECIES)[number];

export function FosterForm({ shelters, defaultShelterId }: { shelters: { id: number; name: string }[]; defaultShelterId?: number }) {
  const router = useRouter();
  const [shelterId, setShelterId] = useState(defaultShelterId ?? shelters[0]?.id);
  const [species, setSpecies] = useState<Species[]>(["dog"]);
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("1 month");
  const [capacity, setCapacity] = useState(1);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!species.length) return setError("Pick at least one kind of pet.");
    setBusy(true);
    setError(null);
    const res = await fetch("/api/foster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelterId, species, duration, capacity, notes: notes.trim() || null }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Could not submit your sign-up.");
    setDone(data.shelter);
    router.refresh();
  }

  if (done) {
    return (
      <div role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950">
        <CheckCircle2 className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
        <p className="mt-2 font-semibold">You&apos;re on the list!</p>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{done} will reach out within a few days to schedule a home check and match you with a pet.</p>
        <button type="button" className="link mt-3 text-sm" onClick={() => setDone(null)}>
          Sign up with another shelter
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-5">
      <div>
        <label htmlFor="shelter" className="label">
          Shelter
        </label>
        <select id="shelter" className="input" value={shelterId} onChange={(e) => setShelterId(Number(e.target.value))}>
          {shelters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend className="label">I can foster</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIES.map((s) => (
            <ToggleChip key={s} selected={species.includes(s)} onClick={() => setSpecies((v) => toggleValue(v, s))}>
              {s}s
            </ToggleChip>
          ))}
        </div>
      </fieldset>
      <div>
        <span className="label">For how long</span>
        <RadioCards name="Duration" value={duration} options={DURATIONS} onChange={setDuration} />
      </div>
      <div>
        <label htmlFor="capacity" className="label">
          How many pets at once: <strong>{capacity}</strong>
        </label>
        <input id="capacity" type="range" min={1} max={5} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full accent-primary-600" />
      </div>
      <div>
        <label htmlFor="notes" className="label">
          Anything the shelter should know? <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea id="notes" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Other pets, work schedule, experience with bottle babies..." />
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || !shelterId} className="btn btn-primary w-full">
        {busy ? "Submitting..." : "Submit sign-up"}
      </button>
    </form>
  );
}
