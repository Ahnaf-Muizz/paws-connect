"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Share, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "paws-install-dismissed";

export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) ?? 0) > Date.now() - 14 * 86_400_000;
    if (standalone || dismissed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos) {
      timer = setTimeout(() => {
        setIos(true);
        setVisible(true);
      }, 4000);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Install PAWS Connect"
      className="card animate-fade-in fixed inset-x-3 bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+0.75rem)] z-50 flex items-center gap-3 p-3 sm:right-6 sm:bottom-6 sm:left-auto sm:w-96 lg:bottom-6"
    >
      <Image src="/icons/icon-192.png" alt="" width={48} height={48} className="size-12 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Install PAWS Connect</p>
        {ios ? (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Tap <Share className="inline size-3.5 align-text-bottom" aria-label="Share" /> then &ldquo;Add to Home Screen&rdquo;.
          </p>
        ) : (
          <p className="text-xs text-slate-600 dark:text-slate-400">Get matches and messages from your home screen.</p>
        )}
      </div>
      {!ios && (
        <button type="button" onClick={install} className="btn btn-primary min-h-10 px-3">
          Install
        </button>
      )}
      <button type="button" onClick={dismiss} className="btn btn-ghost size-10 min-h-10 p-0" aria-label="Dismiss">
        <X className="size-4" />
      </button>
    </div>
  );
}
