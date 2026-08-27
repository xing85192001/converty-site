"use client";

import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Locale, locales } from "@/i18n/config";
import { usePathname } from "@/i18n/navigation";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  de: "DE",
  ja: "JA",
  zh: "ZH",
  "zh-TW": "TW",
};

const localeFullLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  ja: "日本語",
  zh: "中文",
  "zh-TW": "繁體中文",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Use a full page navigation for reliability across Next.js versions and
    // static export. `pathname` from next-intl excludes the locale prefix when
    // `localePrefix: "always"` is used, so we prepend the new locale.
    const newPath = `/${newLocale}${pathname === "/" ? "" : pathname}`;
    window.location.assign(newPath + window.location.search + window.location.hash);
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[58px] h-8 border-white/10 bg-white/5 text-[12px] text-muted-foreground hover:bg-white/10 hover:text-foreground">
        <SelectValue>{localeLabels[locale]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeFullLabels[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
