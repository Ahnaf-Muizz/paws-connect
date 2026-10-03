"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Heart, Info, MapPin, RotateCcw, Settings2, X } from "lucide-react";
import { PetCard } from "@/components/pets/pet-card";
import { PetImage } from "@/components/pets/pet-image";
import { useFavorites } from "@/components/providers/favorites-provider";
import { Badge } from "@/components/ui";
import type { Pet } from "@/lib/db/schema";
import { matchLabel, type MatchResult } from "@/lib/matching";
import { formatAge } from "@/lib/pets";
import { cn } from "@/lib/utils";

type Item = {
  pet: Pet;
  owner: { id: number; name: string; verified: boolean } | null;
  shelter: { id: number; name: string; slug: string } | null;
  match: MatchResult;
};

const SWIPE_THRESHOLD = 110;

export function MatchDeck({ initialQueue, initialLiked, initialPassed }: { initialQueue: Item[]; initialLiked: Item[]; initialPassed: Item[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [liked, setLiked] = useState(initialLiked);
  const [passed, setPassed] = useState(initialPassed);
  const [tab, setTab] = useState<"discover" | "liked">("discover");
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<"like" | "pass" | null>(null);
  const [toast, setToast] = useState<Item | null>(null);
  const start = useRef<{ x: number; id: number } | null>(null);
  const { markLocal } = useFavorites();

  const current = queue[0];
  const nextUp = queue[1];

  async function react(reaction: "like" | "pass") {
    if (!current || leaving) return;
    const item = current;
    setLeaving(reaction);
    setDrag(reaction === "like" ? 600 : -600);
    fetch(`/api/matches/${item.pet.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction }),
    }).then((res) => {
      if (res.ok && reaction === "like") markLocal(item.pet.id);
    });
    setTimeout(() => {
      setQueue((q) => q.slice(1));
      if (reaction === "like") {
        setLiked((l) => [item, ...l]);
        setToast(item);
        setTimeout(() => setToast((t) => (t === item ? null : t)), 5000);
      } else {
        setPassed((p) => [item, ...p]);
      }
      setDrag(0);
      setLeaving(null);
    }, 220);
  }

  async function undoPass() {
    const [last, ...rest] = passed;
    if (!last) return;
    await fetch(`/api/matches/${last.pet.id}`, { method: "DELETE" });
    setPassed(rest);
    setQueue((q) => [last, ...q]);
  }

  async function resetPassed() {
    await Promise.all(passed.map((p) => fetch(`/api/matches/${p.pet.id}`, { method: "DELETE" })));
    setQueue((q) => [...q, ...passed].sort((a, b) => b.match.score - a.match.score));
    setPassed([]);
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    start.current = { x: e.clientX, id: e.pointerId };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (start.current?.id === e.pointerId) setDrag(e.clientX - start.current.x);
  };
  const onPointerUp = () => {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    if (drag > SWIPE_THRESHOLD) void react("like");
    else if (drag < -SWIPE_THRESHOLD) void react("pass");
    else setDrag(0);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
      <div role="tablist" aria-label="Match views" className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(
          [
            ["discover", `Discover (${queue.length})`],
            ["liked", `Liked (${liked.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "min-h-10 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition sm:px-4",
              tab === key ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>
        <Link href="/profile" className="btn btn-ghost min-h-10 px-3 text-sm md:hidden" aria-label="Edit match preferences">
          <Settings2 className="size-4" aria-hidden /> Preferences
        </Link>
      </div>

      {tab === "discover" ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,440px)_1fr] lg:items-start">
          <div className="mx-auto w-full max-w-[440px]">
            {current ? (
              <>
                <div className="relative h-[clamp(18rem,calc(100dvh-27rem),34rem)] lg:h-[clamp(24rem,calc(100dvh-20rem),36rem)] select-none">
                  {nextUp && (
                    <div className="absolute inset-0 scale-95 overflow-hidden rounded-3xl bg-slate-200 opacity-70 dark:bg-slate-800" aria-hidden>
                      <PetImage src={nextUp.pet.photos[0]} alt="" species={nextUp.pet.species} sizes="440px" />
                    </div>
                  )}
                  <article
                    key={current.pet.id}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    style={{
                      transform: `translateX(${drag}px) rotate(${drag / 20}deg)`,
                      transition: dragging ? "none" : "transform 220ms ease-out, opacity 220ms",
                      opacity: leaving ? 0 : 1,
                      touchAction: "pan-y",
                    }}
                    className="absolute inset-0 cursor-grab overflow-hidden rounded-3xl bg-slate-900 shadow-xl active:cursor-grabbing"
                    aria-label={`${current.pet.name}, ${current.match.score}% match`}
                  >
                    <PetImage src={current.pet.photos[0]} alt={`${current.pet.name}, a ${current.pet.breed}`} species={current.pet.species} sizes="440px" priority />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/95 via-slate-950/70 to-transparent p-5 pt-28 text-white">
                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-3xl font-bold text-white">{current.pet.name}</h2>
                          <p className="truncate text-white/85">
                            {current.pet.breed} &middot; <span className="capitalize">{current.pet.sex}</span> &middot; {formatAge(current.pet.ageYears)}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-sm text-white/75">
                            <MapPin className="size-3.5" aria-hidden /> {current.pet.city} &middot; {Math.round(current.match.distanceMiles)} mi away
                          </p>
                        </div>
                        <span className="flex size-16 shrink-0 flex-col items-center justify-center rounded-full bg-primary-600 font-display leading-none font-bold ring-4 ring-white/20">
                          <span className="text-xl">{current.match.score}%</span>
                          <span className="text-[10px] font-medium tracking-wide uppercase">match</span>
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm">
                        {current.match.reasons.slice(0, 2).map((r) => (
                          <li key={r} className="flex gap-1.5">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden /> {r}
                          </li>
                        ))}
                        {current.match.concerns.slice(0, 1).map((c) => (
                          <li key={c} className="flex gap-1.5 text-amber-200">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <span
                      aria-hidden
                      className="absolute top-6 left-6 -rotate-12 rounded-lg border-4 border-emerald-400 px-3 py-1 text-2xl font-black text-emerald-400 uppercase"
                      style={{ opacity: Math.max(0, Math.min(1, drag / SWIPE_THRESHOLD)) }}
                    >
                      Like
                    </span>
                    <span
                      aria-hidden
                      className="absolute top-6 right-6 rotate-12 rounded-lg border-4 border-rose-400 px-3 py-1 text-2xl font-black text-rose-400 uppercase"
                      style={{ opacity: Math.max(0, Math.min(1, -drag / SWIPE_THRESHOLD)) }}
                    >
                      Pass
                    </span>
                  </article>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => react("pass")}
                    className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-500 shadow-md transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900"
                    aria-label={`Pass on ${current.pet.name}`}
                  >
                    <X className="size-8" />
                  </button>
                  <Link
                    href={`/pets/${current.pet.id}`}
                    className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    aria-label={`View ${current.pet.name}'s profile`}
                  >
                    <Info className="size-5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => react("like")}
                    className="flex size-16 items-center justify-center rounded-full bg-primary-600 text-white shadow-md transition hover:scale-105"
                    aria-label={`Like ${current.pet.name}`}
                  >
                    <Heart className="size-8 fill-current" />
                  </button>
                </div>
                <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                  Swipe right to like, left to pass.
                  {passed.length > 0 && (
                    <>
                      {" "}
                      <button type="button" onClick={undoPass} className="link inline-flex items-center gap-1">
                        <RotateCcw className="size-3" aria-hidden /> Undo pass
                      </button>
                    </>
                  )}
                </p>
              </>
            ) : (
              <div className="card flex flex-col items-center px-6 py-12 text-center">
                <Heart className="size-10 text-primary-500" aria-hidden />
                <h2 className="mt-3 text-lg font-semibold">You&apos;re all caught up</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  New pets are posted every day. Review the pets you liked or take another look at ones you passed.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => setTab("liked")} className="btn btn-primary">
                    See liked pets
                  </button>
                  {passed.length > 0 && (
                    <button type="button" onClick={resetPassed} className="btn btn-outline">
                      Review {passed.length} passed
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {current && (
            <aside className="hidden lg:block">
              <div className="card p-6">
                <p className="text-sm font-semibold tracking-wide text-primary-700 uppercase dark:text-primary-300">{matchLabel(current.match.score)}</p>
                <h3 className="mt-1 text-2xl font-bold">Why {current.pet.name} fits</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {current.match.reasons.map((r) => (
                    <li key={r} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden /> {r}
                    </li>
                  ))}
                  {current.match.concerns.map((c) => (
                    <li key={c} className="flex gap-2 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 line-clamp-4 text-sm text-slate-600 dark:text-slate-400">{current.pet.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="neutral" className="capitalize">
                    {current.pet.size}
                  </Badge>
                  <Badge tone="neutral" className="capitalize">
                    {current.pet.energy} energy
                  </Badge>
                  <Badge tone="neutral">{current.owner ? `Owner: ${current.owner.name}` : current.shelter?.name}</Badge>
                </div>
                <Link href={`/pets/${current.pet.id}/apply`} className="btn btn-outline mt-5 w-full">
                  Apply to adopt {current.pet.name}
                </Link>
              </div>
              {queue.length > 1 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Up next</h3>
                  <ul className="mt-2 flex gap-2">
                    {queue.slice(1, 6).map((m) => (
                      <li key={m.pet.id} className="relative size-16 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        <PetImage src={m.pet.photos[0]} alt={`${m.pet.name}, ${m.match.score}% match`} species={m.pet.species} sizes="64px" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}
        </div>
      ) : liked.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {liked.map((m) => (
            <li key={m.pet.id}>
              <PetCard pet={m.pet} owner={m.owner} shelter={m.shelter} score={m.match.score} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="card p-8 text-center text-slate-600 dark:text-slate-400">Pets you like will show up here.</p>
      )}

      {toast && (
        <div
          role="status"
          className="animate-sheet-up fixed inset-x-4 bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+1rem)] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-900 p-3 text-white shadow-xl lg:bottom-6 dark:bg-slate-800"
        >
          <Heart className="size-5 shrink-0 fill-rose-500 text-rose-500" aria-hidden />
          <p className="min-w-0 flex-1 truncate text-sm">Saved {toast.pet.name} to your favorites</p>
          <Link href={`/pets/${toast.pet.id}/apply`} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-900">
            Apply
          </Link>
        </div>
      )}
    </div>
  );
}
