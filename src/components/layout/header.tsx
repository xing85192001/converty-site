"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlobalSearch } from "@/components/search/global-search";
import { Button } from "@/components/ui/button";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/registry/categories";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("common");
  const nav = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {/* Logo (single) */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
            b
          </span>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            baike<span className="text-primary">calc</span>
          </span>
        </Link>

        {/* Search (single, prominent) */}
        <div className="hidden flex-1 sm:block">
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
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Menu className="h-[18px] w-[18px]" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="border-t border-border px-4 py-2 sm:hidden">
        <GlobalSearch />
      </div>

      {/* Mobile category drawer */}
      {menuOpen && (
        <div className="border-t border-border bg-background sm:hidden">
          <div className="mx-auto max-h-[70vh] overflow-y-auto px-4 py-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("navigation.categories")}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-muted"
                >
                  {nav(`${c.id}.name`)}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
              <Link
                href="/all"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
              >
                {t("allTools")}
              </Link>
              <Link
                href="/blog"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-muted"
              >
                {t("homepageViewBlog")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
