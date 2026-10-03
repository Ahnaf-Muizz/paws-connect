"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Loader2, SendHorizontal } from "lucide-react";
import type { ChatMessage } from "@/lib/messages";
import { cn, eventDate, eventTime } from "@/lib/utils";

const POLL_MS = 4000;
const MAX = 2000;

type Pending = { tempId: string; body: string; failed?: boolean };

export function ChatThread({ conversationId, userId, otherName, initial }: { conversationId: number; userId: number; otherName: string; initial: ChatMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [pending, setPending] = useState<Pending[]>([]);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const lastId = messages.at(-1)?.id ?? 0;

  const merge = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      return [...prev, ...incoming.filter((m) => !seen.has(m.id))].sort((a, b) => a.id - b.id);
    });
  }, []);

  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      const res = await fetch(`/api/messages/${conversationId}?after=${lastId}`, { cache: "no-store" }).catch(() => null);
      if (!stopped && res?.ok) merge((await res.json()).messages);
    };
    const t = setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      stopped = true;
      clearInterval(t);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [conversationId, lastId, merge]);

  const scrolledOnce = useRef(false);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: scrolledOnce.current ? "smooth" : "instant" });
    scrolledOnce.current = true;
  }, [messages.length, pending.length]);

  async function send(body: string, tempId = crypto.randomUUID()) {
    setPending((p) => [...p.filter((x) => x.tempId !== tempId), { tempId, body }]);
    const res = await fetch(`/api/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }).catch(() => null);
    if (res?.ok) {
      const { message } = await res.json();
      setPending((p) => p.filter((x) => x.tempId !== tempId));
      merge([message]);
    } else {
      setPending((p) => p.map((x) => (x.tempId === tempId ? { ...x, failed: true } : x)));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    void send(body);
  }

  const lastMineId = messages.findLast((m) => m.senderId === userId)?.id;
  return (
    <>
      <div ref={scroller} className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-5" aria-live="polite" aria-label={`Conversation with ${otherName}`}>
        {messages.length === 0 && pending.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Say hello to {otherName} and introduce your home.</p>
        )}
        {messages.map((m, i) => {
          const day = eventDate(m.createdAt);
          const showDay = i === 0 || day !== eventDate(messages[i - 1].createdAt);
          const mine = m.senderId === userId;
          const isLastMine = m.id === lastMineId;
          return (
            <div key={m.id}>
              {showDay && <p className="py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{day}</p>}
              <Bubble mine={mine} body={m.body} time={eventTime(m.createdAt)}>
                {isLastMine &&
                  (m.readAt ? <CheckCheck className="size-3.5" aria-label="Read" /> : <Check className="size-3.5" aria-label="Sent" />)}
              </Bubble>
            </div>
          );
        })}
        {pending.map((p) => (
          <Bubble key={p.tempId} mine body={p.body} time={p.failed ? "Not sent" : "Sending"} faded>
            {p.failed ? (
              <button type="button" onClick={() => send(p.body, p.tempId)} className="font-semibold underline">
                Retry
              </button>
            ) : (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            )}
          </Bubble>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-end gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
        <label htmlFor="chat-input" className="sr-only">
          Message {otherName}
        </label>
        <textarea
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          placeholder="Write a message"
          className="input max-h-32 min-h-11 resize-none field-sizing-content"
        />
        <button type="submit" className="btn btn-primary size-11 shrink-0 px-0" disabled={!draft.trim()} aria-label="Send message">
          <SendHorizontal className="size-5" aria-hidden />
        </button>
      </form>
    </>
  );
}

function Bubble({ mine, body, time, faded, children }: { mine: boolean; body: string; time: string; faded?: boolean; children?: React.ReactNode }) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm sm:max-w-[70%]",
          mine ? "rounded-br-md bg-primary-600 text-white" : "rounded-bl-md bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
          faded && "opacity-70",
        )}
      >
        <p className="break-words whitespace-pre-wrap">{body}</p>
        <p className={cn("mt-1 flex items-center justify-end gap-1 text-[11px]", mine ? "text-primary-100" : "text-slate-500 dark:text-slate-400")}>
          {time}
          {children}
        </p>
      </div>
    </div>
  );
}
