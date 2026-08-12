"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("common.footer");

  const links = [
    { href: "/privacy-policy", label: t("links.privacy") },
    { href: "/about", label: t("links.about") },
    { href: "/contact", label: t("links.contact") },
    { href: "/terms", label: t("links.terms") },
    { href: "/blog", label: t("links.blog") },
  ];

  return (
    <footer className="border-t border-white/[0.08] bg-background/80 py-8">
      <div className="container flex flex-col items-center gap-5">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
