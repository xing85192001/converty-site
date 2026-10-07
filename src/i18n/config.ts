// Locale configuration for all supported languages
export const locales = [
  "zh",
  "zh-TW",
  "en",
  "de",
  "ja",
  "es",
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Locale formats
export const localeFormats: Record<
  Locale,
  { currency: string; numberLocale: string; dateLocale: string }
> = {
  zh: { currency: "CNY", numberLocale: "zh-CN", dateLocale: "zh-CN" },
  "zh-TW": { currency: "TWD", numberLocale: "zh-TW", dateLocale: "zh-TW" },
  en: { currency: "USD", numberLocale: "en-US", dateLocale: "en-US" },
  de: { currency: "EUR", numberLocale: "de-DE", dateLocale: "de-DE" },
  ja: { currency: "JPY", numberLocale: "ja-JP", dateLocale: "ja-JP" },
  es: { currency: "EUR", numberLocale: "es-ES", dateLocale: "es-ES" },
};

// Locale labels for language switcher (native language names)
export const localeLabels: Record<Locale, string> = {
  zh: "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  de: "Deutsch",
  ja: "日本語",
  es: "Español",
};

// Locale flags for visual display
export const localeFlags: Record<Locale, string> = {
  zh: "🇨🇳",
  "zh-TW": "🇹🇼",
  en: "🇬🇧",
  de: "🇩🇪",
  ja: "🇯🇵",
  es: "🇪🇸",
};
