import { getRequestConfig } from "next-intl/server";
import { type Locale, locales } from "./config";

type Messages = Record<string, unknown>;

// Deep-merge `override` over `base` so that any key missing from a locale
// transparently falls back to the English (en) messages instead of erroring.
// This keeps the 22-language catalog maintainable: new keys only need to land
// in en.json (and zh/zh-TW for translated copy).
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const key of Object.keys(override)) {
    const b = (base as Record<string, unknown>)[key];
    const o = override[key];
    if (
      o &&
      typeof o === "object" &&
      !Array.isArray(o) &&
      b &&
      typeof b === "object" &&
      !Array.isArray(b)
    ) {
      out[key] = deepMerge(b as Messages, o as Messages);
    } else {
      out[key] = o;
    }
  }
  return out;
}

async function loadMessages(locale: string): Promise<Messages> {
  const localeMessages = (await import(`../messages/${locale}.json`)).default as Messages;
  if (locale === "en") return localeMessages;
  const enMessages = (await import("../messages/en.json")).default as Messages;
  return deepMerge(enMessages, localeMessages);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = "en";
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
