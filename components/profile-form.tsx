"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormSection, RadioCards, Switch } from "@/components/form-controls";
import { ToggleChip, toggleValue } from "@/components/toggle-chip";
import type { AdopterProfile, AgeGroup, Experience, HomeType, Level, Size, Species } from "@/lib/db/schema";
import { CITIES } from "@/lib/pets";
import { AGES, EXPERIENCE, HOME_TYPES, LEVELS, SIZES, SPECIES } from "@/lib/validators";

type FormState = {
  city: string;
  homeType: HomeType;
  hasYard: boolean;
  hasKids: boolean;
  hasDogs: boolean;
  hasCats: boolean;
  experience: Experience;
  activityLevel: Level;
  hoursAlone: number;
  species: Species[];
  sizes: Size[];
  ages: AgeGroup[];
  budgetMonthly: number;
  maxDistance: number;
  notes: string;
};

const LABELS: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  condo: "Condo / townhome",
  farm: "Farm / acreage",
  "first-time": "First-time owner",
  some: "Some experience",
  experienced: "Very experienced",
  low: "Relaxed",
  medium: "Moderately active",
  high: "Very active",
  baby: "Baby",
  young: "Young",
  adult: "Adult",
  senior: "Senior",
};

const Section = FormSection;

function Radio<T extends string>(props: { name: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return <RadioCards {...props} labels={LABELS} />;
}

export function ProfileForm({ initial, city, next }: { initial: AdopterProfile | null; city: string; next: string }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>({
    city: CITIES.includes(city) ? city : "Lubbock, TX",
    homeType: initial?.homeType ?? "house",
    hasYard: initial?.hasYard ?? false,
    hasKids: initial?.hasKids ?? false,
    hasDogs: initial?.hasDogs ?? false,
    hasCats: initial?.hasCats ?? false,
    experience: initial?.experience ?? "some",
    activityLevel: initial?.activityLevel ?? "medium",
    hoursAlone: initial?.hoursAlone ?? 4,
    species: initial?.species ?? ["dog", "cat"],
    sizes: initial?.sizes ?? ["small", "medium"],
    ages: initial?.ages ?? ["young", "adult"],
    budgetMonthly: initial?.budgetMonthly ?? 120,
    maxDistance: initial?.maxDistance ?? 50,
    notes: initial?.notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((prev) => ({ ...prev, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, notes: f.notes || null }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "Could not save your profile.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <Section title="Your home">
        <div>
          <label htmlFor="city" className="label">
            Where do you live?
          </label>
          <select id="city" value={f.city} onChange={(e) => set("city", e.target.value)} className="input">
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="label">Type of home</p>
          <Radio name="Type of home" value={f.homeType} options={HOME_TYPES} onChange={(v) => set("homeType", v)} />
        </div>
        <Switch label="I have a fenced yard" checked={f.hasYard} onChange={(v) => set("hasYard", v)} />
      </Section>

      <Section title="Your household" hint="Helps us match pets who'll get along with everyone.">
        <Switch label="Children live with me" checked={f.hasKids} onChange={(v) => set("hasKids", v)} />
        <Switch label="I have a dog" checked={f.hasDogs} onChange={(v) => set("hasDogs", v)} />
        <Switch label="I have a cat" checked={f.hasCats} onChange={(v) => set("hasCats", v)} />
      </Section>

      <Section title="Your lifestyle">
        <div>
          <p className="label">How active are you?</p>
          <Radio name="Activity level" value={f.activityLevel} options={LEVELS} onChange={(v) => set("activityLevel", v)} />
        </div>
        <div>
          <p className="label">Pet experience</p>
          <Radio name="Pet experience" value={f.experience} options={EXPERIENCE} onChange={(v) => set("experience", v)} />
        </div>
        <div>
          <label htmlFor="hours" className="label flex justify-between">
            <span>Hours a pet would be home alone on a typical day</span>
            <span className="font-semibold text-primary-700 dark:text-primary-300">{f.hoursAlone}h</span>
          </label>
          <input
            id="hours"
            type="range"
            min={0}
            max={12}
            value={f.hoursAlone}
            onChange={(e) => set("hoursAlone", Number(e.target.value))}
            className="w-full accent-primary-600"
          />
        </div>
      </Section>

      <Section title="What you're looking for" hint="Pick as many as you like.">
        <div>
          <p className="label">Kind of pet</p>
          <div className="flex flex-wrap gap-2">
            {SPECIES.map((s) => (
              <ToggleChip key={s} selected={f.species.includes(s)} onClick={() => set("species", toggleValue(f.species, s))} className="capitalize">
                {s}s
              </ToggleChip>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Size</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <ToggleChip key={s} selected={f.sizes.includes(s)} onClick={() => set("sizes", toggleValue(f.sizes, s))} className="capitalize">
                {s}
              </ToggleChip>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Age</p>
          <div className="flex flex-wrap gap-2">
            {AGES.map((a) => (
              <ToggleChip key={a} selected={f.ages.includes(a)} onClick={() => set("ages", toggleValue(f.ages, a))}>
                {LABELS[a]}
              </ToggleChip>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Budget & distance">
        <div>
          <label htmlFor="budget" className="label flex justify-between">
            <span>Monthly pet budget</span>
            <span className="font-semibold text-primary-700 dark:text-primary-300">${f.budgetMonthly}</span>
          </label>
          <input
            id="budget"
            type="range"
            min={20}
            max={400}
            step={10}
            value={f.budgetMonthly}
            onChange={(e) => set("budgetMonthly", Number(e.target.value))}
            className="w-full accent-primary-600"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Food, routine vet care, insurance, and supplies.</p>
        </div>
        <div>
          <label htmlFor="distance" className="label flex justify-between">
            <span>How far would you travel to meet a pet?</span>
            <span className="font-semibold text-primary-700 dark:text-primary-300">{f.maxDistance} mi</span>
          </label>
          <input
            id="distance"
            type="range"
            min={5}
            max={150}
            step={5}
            value={f.maxDistance}
            onChange={(e) => set("maxDistance", Number(e.target.value))}
            className="w-full accent-primary-600"
          />
        </div>
        <div>
          <label htmlFor="notes" className="label">
            Anything else owners should know? <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea id="notes" rows={3} maxLength={1000} value={f.notes} onChange={(e) => set("notes", e.target.value)} className="input" />
        </div>
      </Section>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="sticky bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+0.75rem)] z-20 lg:bottom-4">
        <button type="submit" disabled={busy} className="btn btn-primary min-h-12 w-full text-base shadow-lg">
          {busy ? "Saving..." : initial ? "Save and see my matches" : "Find my matches"}
        </button>
      </div>
    </form>
  );
}
