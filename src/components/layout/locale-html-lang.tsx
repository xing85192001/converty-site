"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/**
 * Client component that sets the lang attribute on the <html> element
 * based on the current locale from next-intl.
 */
export function LocaleHtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
