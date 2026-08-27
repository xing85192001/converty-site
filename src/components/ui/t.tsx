"use client";

import { useTranslations } from "next-intl";

/**
 * Universal inline translator. Renders a single translated message by key
 * (e.g. <T k="ui.about-us" />). Being a client component, it can be used
 * inside both Server and Client Component trees, which makes it ideal for
 * replacing hardcoded JSX text nodes without threading a translation hook
 * through every component.
 */
export function T({ k }: { k: string }) {
  const t = useTranslations();
  return <>{t(k)}</>;
}
