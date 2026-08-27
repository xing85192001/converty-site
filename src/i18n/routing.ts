import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./config";

// Shared routing definition, imported by BOTH the middleware (proxy.ts, Edge
// runtime — must stay JSX-free) and the navigation helpers (navigation.ts).
// Keep this file free of JSX/React so the Edge middleware can bundle it.
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
