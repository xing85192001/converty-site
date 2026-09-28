"use client";

import { useEffect } from "react";
import { locales } from "@/i18n/config";

// Static-export global 404. For a locale-prefixed site, deep paths without a
// locale prefix (e.g. /finance) would otherwise 404. Redirect them to the
// same path under the default locale so users land on real content.
export default function NotFound() {
  useEffect(() => {
    const p = window.location.pathname;
    const hasLocale = locales.some((l) => p === `/${l}` || p.startsWith(`/${l}/`));
    if (!hasLocale) {
      window.location.replace(`/zh${p}`);
    }
  }, []);

  return (
    <main
      style={{
        padding: "3rem 1rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
        color: "#555",
      }}
    >
      <p>页面未找到，正在跳转到中文版…</p>
    </main>
  );
}
