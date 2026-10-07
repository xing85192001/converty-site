"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export function HeroSearch() {
  const t = useTranslations("common.search");
  const open = () => window.dispatchEvent(new Event("open-global-search"));

  return (
    <button
      type="button"
      onClick={open}
      className="group relative flex h-12 w-full items-center justify-start gap-3 rounded-2xl border border-white/70 bg-white/55 px-4 text-left text-sm text-[#3c5249] shadow-lg backdrop-blur-xl transition-colors hover:border-primary/60 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
    >
      <Search className="h-5 w-5 shrink-0" />
      <span className="truncate">{t("placeholder")}</span>
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-7 -translate-y-1/2 select-none items-center gap-1 rounded-md border border-border bg-muted px-2 font-mono text-[11px] font-medium sm:flex">
        Ctrl K
      </kbd>
    </button>
  );
}
