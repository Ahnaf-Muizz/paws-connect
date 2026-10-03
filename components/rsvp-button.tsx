"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function RsvpButton({
  eventId,
  loggedIn,
  initialAttending,
  initialGoing,
}: {
  eventId: number;
  loggedIn: boolean;
  initialAttending: boolean;
  initialGoing: number;
}) {
  const [state, setState] = useState({ attending: initialAttending, going: initialGoing });
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !state.attending;
    const prev = state;
    setBusy(true);
    setState({ attending: next, going: state.going + (next ? 1 : -1) });
    const res = await fetch(`/api/events/${eventId}/rsvp`, { method: next ? "POST" : "DELETE" }).catch(() => null);
    if (res?.ok) setState(await res.json());
    else setState(prev);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3">
      {loggedIn ? (
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          aria-pressed={state.attending}
          className={cn("btn min-h-10", state.attending ? "btn-primary" : "btn-outline")}
        >
          {state.attending && <Check className="size-4" aria-hidden />}
          {state.attending ? "Going" : "RSVP"}
        </button>
      ) : (
        <Link href={`/login?next=${encodeURIComponent(`/events#event-${eventId}`)}`} className="btn btn-outline min-h-10">
          RSVP
        </Link>
      )}
      <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <Users className="size-4" aria-hidden /> {state.going} going
      </span>
    </div>
  );
}
