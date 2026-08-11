// Locale configuration for Swiss languages + Chinese
export const locales = ["en", "fr", "de", "it", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Locale formats
export const localeFormats: Record<
  Locale,
  { currency: string; numberLocale: string; dateLocale: string }
> = {
  en: { currency: "CHF", numberLocale: "en-CH", dateLocale: "en-CH" },
  fr: { currency: "CHF", numberLocale: "fr-CH", dateLocale: "fr-CH" },
  de: { currency: "CHF", numberLocale: "de-CH", dateLocale: "de-CH" },
  it: { currency: "CHF", numberLocale: "it-CH", dateLocale: "it-CH" },
  zh: { currency: "CNY", numberLocale: "zh-CN", dateLocale: "zh-CN" },
};

// Locale labels for language switcher
export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  zh: "中文",
};

// Locale flags (emoji) for visual display
export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  de: "🇩🇪",
  it: "🇮🇹",
  zh: "🇨🇳",
};
