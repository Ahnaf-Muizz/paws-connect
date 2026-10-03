"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { mergeGuestCart } from "@/components/providers/cart-provider";
import { useSession } from "@/components/providers/session-provider";
import { CITIES } from "@/lib/pets";

export function safeNext(raw: string | null, fallback: string) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/api") ? raw : fallback;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useSession();
  const next = safeNext(params.get("next"), mode === "register" ? "/profile?welcome=1" : "/dashboard");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "Lubbock, TX" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(body: Record<string, string>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "Something went wrong.");
      return;
    }
    await mergeGuestCart().catch(() => undefined);
    setUser(data.user);
    router.replace(next);
    router.refresh();
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(mode === "login" ? { email: form.email, password: form.password } : form);
  };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const switchHref = `${mode === "login" ? "/register" : "/login"}${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`;

  return (
    <div className="card p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        {mode === "register" && (
          <div>
            <label htmlFor="name" className="label">
              Full name
            </label>
            <input id="name" required minLength={2} autoComplete="name" value={form.name} onChange={set("name")} className="input" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={set("email")}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              required
              minLength={mode === "register" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={form.password}
              onChange={set("password")}
              className="input pr-12"
              aria-describedby={mode === "register" ? "pw-hint" : undefined}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {mode === "register" && (
            <p id="pw-hint" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              At least 8 characters.
            </p>
          )}
        </div>
        {mode === "register" && (
          <div>
            <label htmlFor="city" className="label">
              City
            </label>
            <select id="city" value={form.city} onChange={set("city")} className="input">
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn btn-primary min-h-12 w-full text-base">
          {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      {mode === "login" && (
        <div className="mt-5 rounded-xl border border-dashed border-primary-300 bg-primary-50/60 p-4 text-sm dark:border-primary-800 dark:bg-primary-950/40">
          <p className="font-semibold text-primary-900 dark:text-primary-100">Trying the demo?</p>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            Email <code className="font-mono">demo@pawsconnect.org</code>, password <code className="font-mono">paws1234</code>.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => submit({ email: "demo@pawsconnect.org", password: "paws1234" })}
            className="btn btn-outline mt-3 w-full"
          >
            Log in as demo user
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {mode === "login" ? "New to PAWS Connect? " : "Already have an account? "}
        <Link href={switchHref} className="link">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
