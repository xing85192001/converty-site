"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("common");
  const nav = useTranslations("nav");
  const footer = useTranslations("common.footer");

  const links = [
    { href: "/all", label: nav("categories") },
    { href: "/all", label: t("allTools") },
    { href: "/blog", label: footer("links.blog") },
    { href: "/privacy-policy", label: footer("links.privacy") },
    { href: "/terms", label: footer("links.terms") },
    { href: "/contact", label: footer("links.contact") },
  ];

  return (
    <footer className="mt-12 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-2 font-extrabold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">
            b
          </span>
          <span className="text-foreground">
            baike<span className="text-primary">calc</span>
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t("tagline")}</p>
        <nav className="mt-5 flex flex-col gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs text-muted-foreground">© 2026 baikecalc.</p>
      </div>
    </footer>
  );
}
