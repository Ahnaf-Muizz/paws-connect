"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormSection, RadioCards } from "@/components/form-controls";
import { PhotoUploader } from "@/components/photo-uploader";
import { SPECIES } from "@/lib/validators";

const pad = (n: number) => String(n).padStart(2, "0");
const localNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function LostFoundForm({
  defaultKind,
  contactName,
  contactPhone,
  blobEnabled,
}: {
  defaultKind: "lost" | "found";
  contactName: string;
  contactPhone: string;
  blobEnabled: boolean;
}) {
  const router = useRouter();
  const [kind, setKind] = useState(defaultKind);
  const [species, setSpecies] = useState<(typeof SPECIES)[number]>("dog");
  const [photos, setPhotos] = useState<string[]>([]);
  const when = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const input = when.current;
    if (!input) return;
    const now = localNow();
    input.max = now;
    if (!input.value) input.value = now;
  }, []);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const res = await fetch("/api/lost-found", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        species,
        petName: String(f.get("petName") ?? "").trim() || null,
        description: f.get("description"),
        photoUrl: photos[0] ?? null,
        lastSeenLocation: f.get("lastSeenLocation"),
        lastSeenAt: new Date(String(f.get("lastSeenAt"))).toISOString(),
        contactName: f.get("contactName"),
        contactPhone: f.get("contactPhone"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not post the report.");
      setBusy(false);
      return;
    }
    router.push(`/lost-found?kind=${kind}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <FormSection title="What happened?">
        <RadioCards name="Report type" value={kind} options={["lost", "found"] as const} onChange={setKind} labels={{ lost: "I lost a pet", found: "I found a pet" }} />
        <div>
          <span className="label">Species</span>
          <RadioCards name="Species" value={species} options={SPECIES} onChange={setSpecies} labels={{ dog: "Dog", cat: "Cat", rabbit: "Rabbit", bird: "Bird" }} />
        </div>
        {kind === "lost" && (
          <div>
            <label htmlFor="petName" className="label">
              Pet&apos;s name
            </label>
            <input id="petName" name="petName" className="input" maxLength={40} />
          </div>
        )}
        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            className="input"
            placeholder="Breed, colors, markings, collar, size, temperament..."
          />
        </div>
        <PhotoUploader value={photos} onChange={(u) => setPhotos((p) => u(p))} max={1} folder="lost-found" blobEnabled={blobEnabled} label="Photo" />
      </FormSection>

      <FormSection title="Where and when">
        <div>
          <label htmlFor="lastSeenLocation" className="label">
            {kind === "lost" ? "Last seen near" : "Found near"}
          </label>
          <input id="lastSeenLocation" name="lastSeenLocation" required minLength={3} maxLength={200} className="input" placeholder="e.g. 34th St & Boston Ave, Lubbock" />
        </div>
        <div>
          <label htmlFor="lastSeenAt" className="label">
            Date and time
          </label>
          <input id="lastSeenAt" name="lastSeenAt" type="datetime-local" required ref={when} className="input" />
        </div>
      </FormSection>

      <FormSection title="Contact" hint="Shown publicly so neighbors can reach you quickly.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactName" className="label">
              Name
            </label>
            <input id="contactName" name="contactName" required minLength={2} maxLength={80} defaultValue={contactName} className="input" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="contactPhone" className="label">
              Phone
            </label>
            <input id="contactPhone" name="contactPhone" type="tel" required minLength={7} maxLength={30} defaultValue={contactPhone} className="input" autoComplete="tel" />
          </div>
        </div>
      </FormSection>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}
      <div className="sticky bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+0.75rem)] lg:bottom-4">
        <button type="submit" disabled={busy} className="btn btn-primary w-full shadow-lg">
          {busy ? "Posting..." : "Post report"}
        </button>
      </div>
    </form>
  );
}
