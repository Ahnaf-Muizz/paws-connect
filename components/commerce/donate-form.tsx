"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardForm, type CardValues } from "@/components/commerce/card-form";
import { cn, money } from "@/lib/utils";

const PRESETS = [10, 25, 50, 100, 250];

export function DonateForm({
  shelters,
  defaultShelterId,
  name,
}: {
  shelters: { id: number; name: string }[];
  defaultShelterId: number | null;
  name: string;
}) {
  const router = useRouter();
  const [shelterId, setShelterId] = useState<number | null>(defaultShelterId);
  const [preset, setPreset] = useState<number | null>(25);
  const [custom, setCustom] = useState("");
  const dollars = preset ?? Number(custom);
  const amountCents = Number.isFinite(dollars) ? Math.round(dollars * 100) : 0;
  const valid = amountCents >= 100 && amountCents <= 1_000_000;

  async function pay(card: CardValues) {
    if (!valid) return "Enter an amount between $1 and $10,000.";
    const res = await fetch("/api/donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelterId, amountCents, card }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error ?? "Payment failed. Please try again.";
    router.replace(`/orders/${data.order.id}?new=1`);
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="shelter" className="label">
          Give to
        </label>
        <select id="shelter" className="input" value={shelterId ?? ""} onChange={(e) => setShelterId(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Where it&apos;s needed most</option>
          {shelters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend className="label">Amount</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={preset === p}
              onClick={() => setPreset(p)}
              className={cn(
                "min-h-11 rounded-xl border text-sm font-semibold transition",
                preset === p ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300 hover:border-primary-400 dark:border-slate-700",
              )}
            >
              ${p}
            </button>
          ))}
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500">$</span>
            <input
              aria-label="Custom amount in dollars"
              inputMode="decimal"
              placeholder="Other"
              value={custom}
              onFocus={() => setPreset(null)}
              onChange={(e) => {
                setPreset(null);
                setCustom(e.target.value.replace(/[^\d.]/g, "").slice(0, 8));
              }}
              className={cn("input pl-6", preset === null && "border-primary-500")}
            />
          </div>
        </div>
        {!valid && preset === null && custom && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">Enter an amount between $1 and $10,000.</p>}
      </fieldset>
      <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Paying as {name}. No tax is charged on donations.</p>
        <CardForm payLabel={valid ? `Donate ${money(amountCents)}` : "Donate"} onPay={pay} disabled={!valid} defaultName={name} />
      </div>
    </div>
  );
}
