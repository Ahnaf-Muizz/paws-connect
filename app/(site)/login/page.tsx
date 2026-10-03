import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import Image from "next/image";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-8 sm:py-14">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo-mark.png" alt="" width={72} height={72} className="size-18 rounded-full bg-white" />
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Welcome back</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Log in to see your matches, applications, and messages.</p>
        </div>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </div>
  );
}
