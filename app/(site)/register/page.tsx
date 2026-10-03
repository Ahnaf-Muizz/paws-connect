import type { Metadata } from "next";
import { Suspense } from "react";
import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import Image from "next/image";

export const metadata: Metadata = { title: "Create an account" };

const PERKS = [
  { icon: Sparkles, text: "Get matched with pets that fit your home and lifestyle" },
  { icon: ShieldCheck, text: "Screened families mean safer matches for every pet" },
  { icon: HeartHandshake, text: "Rehome your own pet without surrendering to a shelter" },
];

export default function RegisterPage() {
  return (
    <div className="container-page flex justify-center py-8 sm:py-14">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo-mark.png" alt="" width={72} height={72} className="size-18 rounded-full bg-white" />
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Join PAWS Connect</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Pets And Their Worlds Connected</p>
        </div>
        <ul className="mb-6 space-y-2">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden /> {text}
            </li>
          ))}
        </ul>
        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </div>
  );
}
