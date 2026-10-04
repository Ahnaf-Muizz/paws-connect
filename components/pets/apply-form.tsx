"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { APPLICATION_KIND_META, APPLICATION_KINDS } from "@/lib/validators";
import { cn } from "@/lib/utils";

const DURATIONS = ["A few weeks", "1–3 months", "Until adopted"] as const;

export function ApplyForm({ petId, petName, available }: { petId: number; petName: string; available: boolean }) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof APPLICATION_KINDS)[number]>("long-term");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("1–3 months");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petId,
        kind,
        duration: kind === "long-term" ? null : duration,
        message,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit your application.");
      return;
    }
    router.push(`/dashboard?applied=${data.application.id}`);
    router.refresh();
  }

  if (!available) {
    return <p className="card mt-6 p-5 text-center text-slate-600 dark:text-slate-400">{petName} is no longer accepting applications.</p>;
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-5 p-5 sm:p-6">
      <fieldset>
        <legend className="label">Which option works best for you?</legend>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Choose long-term, short-term, or emergency shelter so the owner knows what you can offer.
        </p>
        <div role="radiogroup" aria-label="Placement type" className="grid gap-2">
          {APPLICATION_KINDS.map((k) => {
            const meta = APPLICATION_KIND_META[k];
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

      {kind !== "long-term" && (
        <div>
          <label htmlFor="duration" className="label">
            How long can you help?
          </label>
          <select id="duration" className="input" value={duration} onChange={(e) => setDuration(e.target.value as (typeof DURATIONS)[number])}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="message" className="label">
          Message to the owner
        </label>
        <textarea
          id="message"
          rows={6}
          required
          minLength={20}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input min-h-36"
          placeholder={`Tell them about your home, your routine, and why ${petName} would fit in.`}
          aria-describedby="message-hint"
        />
        <p id="message-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {message.trim().length < 20 ? `${20 - message.trim().length} more characters needed` : `${message.length}/2000`}
        </p>
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          required
          className="mt-0.5 size-5 shrink-0 accent-primary-600"
        />
        I agree to identity, home, and reference screening, and I understand the owner makes the final decision.
      </label>
      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || !agree || message.trim().length < 20} className="btn btn-primary min-h-12 w-full text-base">
        {busy ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
