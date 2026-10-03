"use client";

import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";

export type CardValues = { name: string; number: string; expiry: string; cvc: string; zip: string };

const formatNumber = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function brandOf(n: string) {
  const d = n.replace(/\D/g, "");
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "Amex";
  if (/^6(011|5)/.test(d)) return "Discover";
  return null;
}

export function CardForm({
  payLabel,
  onPay,
  disabled,
  summary,
  defaultName,
}: {
  payLabel: string;
  onPay: (card: CardValues) => Promise<string | null>;
  disabled?: boolean;
  summary?: React.ReactNode;
  defaultName?: string;
}) {
  const [card, setCard] = useState<CardValues>({ name: defaultName ?? "", number: "", expiry: "", cvc: "", zip: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const brand = brandOf(card.number);
  const set = (k: keyof CardValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCard((c) => ({
      ...c,
      [k]: k === "number" ? formatNumber(v) : k === "expiry" ? formatExpiry(v) : k === "cvc" ? v.replace(/\D/g, "").slice(0, 4) : k === "zip" ? v.replace(/\D/g, "").slice(0, 5) : v,
    }));
  };

  const fillTestCard = (number: string) =>
    setCard((c) => ({ name: c.name || defaultName || "Demo User", number, expiry: c.expiry || "12/30", cvc: c.cvc || "123", zip: c.zip || "79401" }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await onPay(card);
    if (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
      <div>
        <label htmlFor="cc-name" className="label">
          Name on card
        </label>
        <input id="cc-name" required autoComplete="cc-name" value={card.name} onChange={set("name")} className="input" />
      </div>
      <div>
        <label htmlFor="cc-number" className="label">
          Card number
        </label>
        <div className="relative">
          <input
            id="cc-number"
            required
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 1234 1234 1234"
            value={card.number}
            onChange={set("number")}
            className="input pr-24 font-mono tracking-wide"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <CreditCard className="size-4" aria-hidden /> {brand ?? ""}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="cc-exp" className="label">
            Expiry
          </label>
          <input
            id="cc-exp"
            required
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={card.expiry}
            onChange={set("expiry")}
            className="input font-mono"
          />
        </div>
        <div>
          <label htmlFor="cc-cvc" className="label">
            CVC
          </label>
          <input
            id="cc-cvc"
            required
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={brand === "Amex" ? "1234" : "123"}
            value={card.cvc}
            onChange={set("cvc")}
            className="input font-mono"
          />
        </div>
        <div>
          <label htmlFor="cc-zip" className="label">
            ZIP
          </label>
          <input
            id="cc-zip"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="79401"
            value={card.zip}
            onChange={set("zip")}
            className="input font-mono"
          />
        </div>
      </div>

      <details className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
        <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">Test cards (simulated payment)</summary>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          <li>
            <button type="button" className="link" onClick={() => fillTestCard("4242 4242 4242 4242")}>
              4242 4242 4242 4242
            </button>{" "}
            succeeds
          </li>
          <li>
            <button type="button" className="link" onClick={() => fillTestCard("4000 0000 0000 0002")}>
              4000 0000 0000 0002
            </button>{" "}
            is declined
          </li>
        </ul>
        <p className="mt-2 text-xs">Tap a card to fill the form. Any future expiry works. No real card is ever charged.</p>
      </details>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      {summary}

      <div className="sticky bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+0.75rem)] z-20 lg:static">
        <button type="submit" disabled={busy || disabled} className="btn btn-primary min-h-12 w-full text-base shadow-lg lg:shadow-none">
          <Lock className="size-4" aria-hidden /> {busy ? "Processing payment..." : payLabel}
        </button>
      </div>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">Demo checkout. Payments are simulated and no card is charged.</p>
    </form>
  );
}
