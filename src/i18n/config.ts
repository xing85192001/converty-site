// Locale configuration for Swiss languages
export const locales = ["en", "fr", "de", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Swiss locale formats
export const localeFormats: Record<
  Locale,
  { currency: string; numberLocale: string; dateLocale: string }
> = {
  en: { currency: "CHF", numberLocale: "en-CH", dateLocale: "en-CH" },
  fr: { currency: "CHF", numberLocale: "fr-CH", dateLocale: "fr-CH" },
  de: { currency: "CHF", numberLocale: "de-CH", dateLocale: "de-CH" },
  it: { currency: "CHF", numberLocale: "it-CH", dateLocale: "it-CH" },
};

// Locale labels for language switcher
export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

// Locale flags (emoji) for visual display
export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  de: "🇩🇪",
  it: "🇮🇹",
};
