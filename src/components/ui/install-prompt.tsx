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

  const showHint = () => {
    if (isIOS) {
      setShowIOSHint((s) => !s);
      return;
    }
    // On desktop Chrome/Edge that haven't fired beforeinstallprompt yet,
    // show a small non-blocking hint so the icon always feels alive.
    setShowIOSHint((s) => !s);
  };

  return (
    <div className="relative">
      <Button
        onClick={installPrompt ? handleInstallClick : showHint}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        aria-label="Install baikecalc"
      >
        {isIOS ? <Share className="h-[18px] w-[18px]" /> : <Download className="h-[18px] w-[18px]" />}
      </Button>
      {showIOSHint && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/10 bg-card p-3 text-xs text-foreground shadow-xl">
          <p className="font-medium text-primary">
            {isIOS ? "Add to Home Screen" : "Install baikecalc"}
          </p>
          <p className="mt-1 text-muted-foreground">
            {isIOS
              ? "Tap the share icon in your browser, then choose \"Add to Home Screen\"."
              : "Look for the browser menu (⋮) and choose \"Install baikecalc\" or \"Add to Home Screen\"."}
          </p>
        </div>
      )}
    </div>
  );
}
