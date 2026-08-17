"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

type DisclaimerKey = "finance" | "health" | "crypto";

// Map a tool category to the disclaimer that applies to it.
// finance covers money/loan/mortgage/tax (finance, realestate, financing).
const CATEGORY_MAP: Record<string, DisclaimerKey> = {
  finance: "finance",
  realestate: "finance",
  financing: "finance",
  health: "health",
  crypto: "crypto",
};

export function Disclaimer({ categoryId }: { categoryId: string }) {
  const key = CATEGORY_MAP[categoryId];
  const t = useTranslations("disclaimers");
  if (!key) return null;

  return (
    <div className="mb-6 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{t(key)}</p>
    </div>
  );
}
