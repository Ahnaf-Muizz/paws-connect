"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FormSection, RadioCards, Switch } from "@/components/form-controls";
import { LIFESPAN, MONTHLY, ONE_TIME, SIZE_FACTOR, VET_AGE_FACTOR } from "@/lib/costs";
import type { AgeGroup, Size, Species } from "@/lib/db/schema";
import { AGES, SIZES, SPECIES } from "@/lib/validators";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const LABELS: Record<string, string> = { dog: "Dog", cat: "Cat", rabbit: "Rabbit", bird: "Bird", small: "Small", medium: "Medium", large: "Large", baby: "Baby", young: "Young", adult: "Adult", senior: "Senior" };

export function CostEstimator({ initialSpecies, initialSize, initialAge }: { initialSpecies: Species; initialSize: Size; initialAge: AgeGroup }) {
  const [species, setSpecies] = useState(initialSpecies);
  const [size, setSize] = useState(initialSize);
  const [age, setAge] = useState(initialAge);
  const [extras, setExtras] = useState<Record<string, boolean>>({ insurance: true });
  const [fixed, setFixed] = useState(true);
  const [chipped, setChipped] = useState(false);
  const [adoptionFee, setAdoptionFee] = useState(75);

  const result = useMemo(() => {
    const sf = SIZE_FACTOR[species][size];
    const monthly = MONTHLY[species].map((l) => {
      let amount = l.monthly * (l.scales ? sf : 1);
      if (l.vet) amount *= VET_AGE_FACTOR[age];
      return { ...l, amount: Math.round(amount), included: !l.optional || !!extras[l.key] };
    });
    const oneTime = ONE_TIME[species].map((l) => ({
      ...l,
      included: !(l.skipIf === "fixed" && fixed) && !(l.skipIf === "chipped" && chipped) && !(l.skipIf === "adult" && age !== "baby"),
    }));
    const perMonth = monthly.filter((l) => l.included).reduce((n, l) => n + l.amount, 0);
    const upfront = oneTime.filter((l) => l.included).reduce((n, l) => n + l.amount, 0) + adoptionFee;
    return { monthly, oneTime, perMonth, upfront, firstYear: upfront + perMonth * 12, emergencyFund: Math.round((species === "dog" ? 1500 : 1000) * (age === "senior" ? 1.5 : 1)) };
  }, [species, size, age, extras, fixed, chipped, adoptionFee]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="space-y-6">
        <FormSection title="Your pet">
          <div>
            <span className="label">Species</span>
            <RadioCards name="Species" value={species} options={SPECIES} onChange={setSpecies} labels={LABELS} />
          </div>
          <div>
            <span className="label">Size</span>
            <RadioCards name="Size" value={size} options={SIZES} onChange={setSize} labels={LABELS} />
          </div>
          <div>
            <span className="label">Age</span>
            <RadioCards name="Age" value={age} options={AGES} onChange={setAge} labels={LABELS} />
          </div>
          <Switch label="Already spayed or neutered" checked={fixed} onChange={setFixed} />
          <Switch label="Already microchipped" checked={chipped} onChange={setChipped} />
          <div>
            <label htmlFor="fee" className="label">
              Adoption or rehoming fee: <strong>{usd(adoptionFee)}</strong>
            </label>
            <input id="fee" type="range" min={0} max={500} step={25} value={adoptionFee} onChange={(e) => setAdoptionFee(Number(e.target.value))} className="w-full accent-primary-600" />
          </div>
        </FormSection>
        <FormSection title="Optional extras" hint="Turn on the services you expect to use.">
          {MONTHLY[species]
            .filter((l) => l.optional)
            .map((l) => (
              <Switch key={l.key} label={l.label} checked={!!extras[l.key]} onChange={(v) => setExtras((e) => ({ ...e, [l.key]: v }))} />
            ))}
        </FormSection>
      </div>

      <aside className="card p-5 sm:p-6 lg:sticky lg:top-24" aria-live="polite" aria-labelledby="estimate">
        <h2 id="estimate" className="text-lg font-semibold">
          Your estimate
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary-50 p-4 dark:bg-primary-950/60">
            <dt className="text-xs font-medium text-primary-800 dark:text-primary-200">Per month</dt>
            <dd className="font-display text-2xl font-bold text-primary-900 dark:text-white">{usd(result.perMonth)}</dd>
          </div>
          <div className="rounded-xl bg-accent-50 p-4 dark:bg-accent-700/20">
            <dt className="text-xs font-medium text-accent-700 dark:text-accent-300">First year</dt>
            <dd className="font-display text-2xl font-bold text-slate-900 dark:text-white">{usd(result.firstYear)}</dd>
          </div>
        </dl>
        <h3 className="mt-6 text-sm font-semibold">Monthly</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {result.monthly
            .filter((l) => l.included)
            .map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-400">{l.label}</span>
                <span className="font-medium">{usd(l.amount)}</span>
              </li>
            ))}
        </ul>
        <h3 className="mt-5 text-sm font-semibold">One-time, up front</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li className="flex justify-between gap-3">
            <span className="text-slate-600 dark:text-slate-400">Adoption fee</span>
            <span className="font-medium">{usd(adoptionFee)}</span>
          </li>
          {result.oneTime
            .filter((l) => l.included)
            .map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-400">{l.label}</span>
                <span className="font-medium">{usd(l.amount)}</span>
              </li>
            ))}
          <li className="flex justify-between gap-3 border-t border-slate-100 pt-1.5 font-semibold dark:border-slate-800">
            <span>Up-front total</span>
            <span>{usd(result.upfront)}</span>
          </li>
        </ul>
        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Also set aside about <strong>{usd(result.emergencyFund)}</strong> for emergencies, or get insurance. Typical lifespan: {LIFESPAN[species]}. Estimates are national averages; prices in Lubbock may differ.
        </p>
        <div className="mt-5 grid gap-2">
          <Link href={`/pets?species=${species}`} className="btn btn-primary">
            Find a {species} <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href={`/resources?tab=insurance&species=${species}`} className="btn btn-outline">
            Compare insurance
          </Link>
        </div>
      </aside>
    </div>
  );
}
