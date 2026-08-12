"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSHint((s) => !s);
      return;
    }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  if (isStandalone) return null;
  if (!isIOS && !installPrompt) return null;

  return (
    <div className="relative">
      <Button
        onClick={handleInstallClick}
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Install baikecalc"
      >
        {isIOS ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
      </Button>
      {isIOS && showIOSHint && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 shadow-lg dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
          <p className="font-medium">Install baikecalc</p>
          <p className="mt-1">
            Tap <Share className="inline h-3 w-3" /> then "Add to Home Screen"
          </p>
        </div>
      )}
    </div>
  );
}
