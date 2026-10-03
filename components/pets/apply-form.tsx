"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApplyForm({ petId, petName, available }: { petId: number; petName: string; available: boolean }) {
  const router = useRouter();
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
      body: JSON.stringify({ petId, message }),
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
