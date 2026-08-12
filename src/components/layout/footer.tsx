"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("common.footer");

  return (
    <footer className="border-t bg-muted/30 py-8">
      <div className="container flex flex-col items-center gap-5">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
            {t("links.privacy")}
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            {t("links.about")}
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            {t("links.contact")}
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            {t("links.terms")}
          </Link>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            {t("links.blog")}
          </Link>
        </nav>
        <div className="h-px w-16 bg-border" />
        <p className="text-center text-xs text-muted-foreground">{t("copyrightNotice")}</p>
      </div>
    </footer>
  );
}
