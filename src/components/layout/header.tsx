"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlobalSearch } from "@/components/search/global-search";
import { Button } from "@/components/ui/button";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img src="/logo.svg" alt={t("siteName")} className="h-9 w-9 rounded-lg object-contain" />
          <span className="font-bold">{t("siteName")}</span>
        </Link>

        <div className="hidden flex-1 justify-center sm:flex">
          <GlobalSearch />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <InstallPrompt />
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      <div className={cn("border-t sm:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <div className="container py-3">
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}
