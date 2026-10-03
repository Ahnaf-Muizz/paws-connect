"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormSection, RadioCards, Switch } from "@/components/form-controls";
import { PhotoUploader } from "@/components/photo-uploader";
import type { Experience, Level, Pet, Size, Species } from "@/lib/db/schema";
import { CITIES } from "@/lib/pets";
import { EXPERIENCE, LEVELS, SIZES, SPECIES } from "@/lib/validators";

type State = {
  name: string;
  species: Species;
  breed: string;
  years: number;
  months: number;
  sex: "male" | "female";
  size: Size;
  energy: Level;
  goodWithKids: boolean;
  goodWithDogs: boolean;
  goodWithCats: boolean;
  needsYard: boolean;
  experienceNeeded: Experience;
  houseTrained: boolean;
  vaccinated: boolean;
  spayedNeutered: boolean;
  microchipped: boolean;
  description: string;
  rehomeReason: string;
  photos: string[];
  city: string;
};

const LABELS = {
  dog: "Dog",
  cat: "Cat",
  rabbit: "Rabbit",
  bird: "Bird",
  male: "Male",
  female: "Female",
  small: "Small",
  medium: "Medium",
  large: "Large",
  low: "Low",
  high: "High",
  "first-time": "Great for first-timers",
  some: "Some experience",
  experienced: "Experienced owners",
};

export function PetForm({ initial, defaultCity, blobEnabled }: { initial: Pet | null; defaultCity: string; blobEnabled: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<State>(() => ({
    name: initial?.name ?? "",
    species: initial?.species ?? "dog",
    breed: initial?.breed ?? "",
    years: initial ? Math.floor(initial.ageYears) : 2,
    months: initial ? Math.round((initial.ageYears % 1) * 12) : 0,
    sex: initial?.sex ?? "female",
    size: initial?.size ?? "medium",
    energy: initial?.energy ?? "medium",
    goodWithKids: initial?.goodWithKids ?? true,
    goodWithDogs: initial?.goodWithDogs ?? true,
    goodWithCats: initial?.goodWithCats ?? false,
    needsYard: initial?.needsYard ?? false,
    experienceNeeded: initial?.experienceNeeded ?? "first-time",
    houseTrained: initial?.houseTrained ?? true,
    vaccinated: initial?.vaccinated ?? true,
    spayedNeutered: initial?.spayedNeutered ?? true,
    microchipped: initial?.microchipped ?? false,
    description: initial?.description ?? "",
    rehomeReason: initial?.rehomeReason ?? "",
    photos: initial?.photos ?? [],
    city: initial?.city ?? (CITIES.includes(defaultCity) ? defaultCity : "Lubbock, TX"),
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof State>(k: K, v: State[K]) => setF((prev) => ({ ...prev, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.photos.length) return setError("Add at least one photo so families can meet your pet.");
    setBusy(true);
    const { years, months, ...rest } = f;
    const body = { ...rest, ageYears: Math.round((years + months / 12) * 100) / 100, rehomeReason: f.rehomeReason || null };
    const res = await fetch(initial ? `/api/pets/${initial.id}` : "/api/pets", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "Could not save this listing.");
      return;
    }
    router.push(`/pets/${data.pet.id}${initial ? "" : "?posted=1"}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <FormSection title="Photos" hint="Bright, clear photos get far more applications.">
        <PhotoUploader value={f.photos} onChange={(fn) => setF((prev) => ({ ...prev, photos: fn(prev.photos) }))} folder="pets" blobEnabled={blobEnabled} />
      </FormSection>

      <FormSection title="The basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input id="name" required maxLength={40} value={f.name} onChange={(e) => set("name", e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="breed" className="label">
              Breed or mix
            </label>
            <input
              id="breed"
              required
              minLength={2}
              maxLength={80}
              value={f.breed}
              onChange={(e) => set("breed", e.target.value)}
              className="input"
              placeholder="e.g. Labrador mix"
            />
          </div>
        </div>
        <div>
          <p className="label">Type of pet</p>
          <RadioCards name="Type of pet" value={f.species} options={SPECIES} onChange={(v) => set("species", v)} labels={LABELS} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="years" className="label">
              Age (years)
            </label>
            <input
              id="years"
              type="number"
              inputMode="numeric"
              min={0}
              max={80}
              value={f.years}
              onChange={(e) => set("years", Math.max(0, Number(e.target.value)))}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="months" className="label">
              + months
            </label>
            <input
              id="months"
              type="number"
              inputMode="numeric"
              min={0}
              max={11}
              value={f.months}
              onChange={(e) => set("months", Math.min(11, Math.max(0, Number(e.target.value))))}
              className="input"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="city" className="label">
              Location
            </label>
            <select id="city" value={f.city} onChange={(e) => set("city", e.target.value)} className="input">
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="label">Sex</p>
          <RadioCards name="Sex" value={f.sex} options={["female", "male"] as const} onChange={(v) => set("sex", v)} labels={LABELS} />
        </div>
        <div>
          <p className="label">Size</p>
          <RadioCards name="Size" value={f.size} options={SIZES} onChange={(v) => set("size", v)} labels={LABELS} />
        </div>
        <div>
          <p className="label">Energy level</p>
          <RadioCards name="Energy level" value={f.energy} options={LEVELS} onChange={(v) => set("energy", v)} labels={LABELS} />
        </div>
      </FormSection>

      <FormSection title="Personality & needs" hint="Honest answers lead to matches that last.">
        <Switch label="Good with kids" checked={f.goodWithKids} onChange={(v) => set("goodWithKids", v)} />
        <Switch label="Good with dogs" checked={f.goodWithDogs} onChange={(v) => set("goodWithDogs", v)} />
        <Switch label="Good with cats" checked={f.goodWithCats} onChange={(v) => set("goodWithCats", v)} />
        <Switch label="Needs a yard" checked={f.needsYard} onChange={(v) => set("needsYard", v)} />
        <div>
          <p className="label">Best suited for</p>
          <RadioCards name="Experience needed" value={f.experienceNeeded} options={EXPERIENCE} onChange={(v) => set("experienceNeeded", v)} labels={LABELS} />
        </div>
      </FormSection>

      <FormSection title="Health">
        <Switch label="Vaccinations up to date" checked={f.vaccinated} onChange={(v) => set("vaccinated", v)} />
        <Switch label="Spayed / neutered" checked={f.spayedNeutered} onChange={(v) => set("spayedNeutered", v)} />
        <Switch label="Microchipped" checked={f.microchipped} onChange={(v) => set("microchipped", v)} />
        <Switch label={f.species === "bird" ? "Hand-tame" : "House / litter trained"} checked={f.houseTrained} onChange={(v) => set("houseTrained", v)} />
      </FormSection>

      <FormSection title="Their story">
        <div>
          <label htmlFor="description" className="label">
            Describe {f.name || "your pet"}
          </label>
          <textarea
            id="description"
            rows={5}
            required
            minLength={20}
            maxLength={2000}
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            className="input"
            placeholder="Favorite toys, daily routine, quirks, what makes them special..."
          />
        </div>
        <div>
          <label htmlFor="reason" className="label">
            Why are you rehoming? <span className="font-normal text-slate-500">(optional, shown to families)</span>
          </label>
          <textarea id="reason" rows={2} maxLength={500} value={f.rehomeReason} onChange={(e) => set("rehomeReason", e.target.value)} className="input" />
        </div>
      </FormSection>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="sticky bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+0.75rem)] z-20 lg:bottom-4">
        <button type="submit" disabled={busy} className="btn btn-primary min-h-12 w-full text-base shadow-lg">
          {busy ? "Saving..." : initial ? "Save changes" : `Post ${f.name || "pet"}'s profile`}
        </button>
      </div>
    </form>
  );
}
