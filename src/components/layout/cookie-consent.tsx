"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";

type ConsentValue = "granted" | "denied";

function applyConsent(value: ConsentValue) {
  if (
    typeof window !== "undefined" &&
    typeof (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag === "function"
  ) {
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag("consent", "update", {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    });
  }
}

export function CookieConsent() {
  const t = useTranslations("common.cookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "granted") {
      // Returning visitor who already consented — upgrade consent immediately.
      applyConsent("granted");
    } else if (stored === "denied") {
      // Returning visitor who declined — keep denied, no banner.
      applyConsent("denied");
    } else {
      setVisible(true);
      // Default to denied until the visitor makes a choice (GDPR safe).
      applyConsent("denied");
    }
  }, []);

  function choose(value: ConsentValue) {
    localStorage.setItem(STORAGE_KEY, value);
    applyConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm">
          <p className="font-medium">{t("title")}</p>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
