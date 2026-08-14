"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlobalSearch } from "@/components/search/global-search";
import { Button } from "@/components/ui/button";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { T } from "@/components/ui/t";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/registry/categories";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("common");
  const nav = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-gradient-to-br from-brand via-brand2 to-brand-green shadow-[0_0_14px_rgba(34,211,238,0.45)]" />
          <span className="text-lg font-extrabold tracking-wide">{t("siteName")}</span>
        </Link>

        {/* Search */}
        <div className="hidden flex-1 justify-center sm:flex max-w-xl">
          <GlobalSearch />
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <InstallPrompt />
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-[18px] w-[18px]" />
            <span className="sr-only">
              <T k="ui.toggle-menu" />
            </span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-white/[0.08] sm:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="container max-h-[72vh] overflow-y-auto py-3">
          <div className="mb-3">
            <GlobalSearch />
          </div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("navigation.categories")}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-white/5"
              >
                {nav(`${c.id}.name`)}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1 border-t border-white/[0.08] pt-3">
            <Link
              href="/all"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
            >
              {t("allTools")}
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-white/5"
            >
              {t("homepageViewBlog")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
