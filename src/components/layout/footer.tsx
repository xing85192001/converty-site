"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("common.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-8">
      <div className="container flex flex-col items-center gap-4 md:flex-row md:justify-between">
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
        <p className="text-center text-sm text-muted-foreground md:text-right">
          © {year} {t("builtWith")}. {t("copyright")}.
        </p>
      </div>
    </footer>
  );
}
