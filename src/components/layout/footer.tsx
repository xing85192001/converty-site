"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("common");
  const footer = useTranslations("common.footer");

  const links = [
    { href: "/all", label: t("allTools") },
    { href: "/about", label: footer("links.about") },
    { href: "/blog", label: footer("links.blog") },
    { href: "/privacy-policy", label: footer("links.privacy") },
    { href: "/terms", label: footer("links.terms") },
    { href: "/contact", label: footer("links.contact") },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-sm">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/logo.jpg"
            alt="baikecalc"
            className="h-6 w-6 rounded-md object-cover"
          />
          <span className="font-extrabold text-foreground">
            baike<span className="text-primary">calc</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
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
        <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
          © 2026 baikecalc. {footer("copyright")}
        </span>
      </div>
    </footer>
  );
}
