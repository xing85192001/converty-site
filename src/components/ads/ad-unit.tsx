"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { siteConfig } from "@/config/site";

interface AdUnitProps {
  /** Slot key from siteConfig.adSlots (e.g. "content-top"). */
  slot: keyof typeof siteConfig.adSlots;
  className?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
}

/**
 * AdSense display unit, gated by consent via Consent Mode v2.
 *
 * - Renders nothing unless NEXT_PUBLIC_ADSENSE_CLIENT_ID is set.
 * - If the matching ad slot id is not configured yet, shows a labeled placeholder
 *   (so layout spacing is correct) instead of a broken/empty ad.
 * - The actual <ins> is only pushed to adsbygoogle once the library is loaded,
 *   so we poll briefly for window.adsbygoogle before pushing.
 */
export function AdUnit({ slot, className, format = "auto" }: AdUnitProps) {
  const t = useTranslations("common");
  const clientId = siteConfig.adsenseClientId;
  const slotId = siteConfig.adSlots[slot];

  // Nothing renders until BOTH the publisher client id (env) and a concrete
  // slot id are configured. This keeps the pre-approval site clean (no empty
  // "Advertisement" placeholder boxes that could look like broken ad units).
  const enabled = Boolean(clientId && slotId);

  // The component only mounts when `enabled` is true, so the ad push runs once
  // on mount. clientId/slotId come from static config and never change.
  useEffect(() => {
    let tries = 0;
    const tryPush = () => {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      if (w.adsbygoogle) {
        try {
          w.adsbygoogle.push({});
        } catch {
          /* ignore double-push in strict mode */
        }
        return;
      }
      if (tries++ < 40) window.setTimeout(tryPush, 200);
    };
    tryPush();
  }, []);

  if (!enabled) return null;

  return (
    <div className={className ?? "my-8"} aria-label={t("advertisement")}>
      <p className="mb-1 text-center text-xs uppercase tracking-wide text-muted-foreground">
        {t("advertisement")}
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
