"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/registry/categories";
import { cn } from "@/lib/utils";

export function ToolMenu() {
  const t = useTranslations("nav");

  return (
    <div className="sticky top-14 z-40 w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm dark:from-teal-700 dark:to-cyan-800">
      <div className="container">
        <nav className="scrollbar-hide flex items-center gap-1 overflow-x-auto py-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              )}
            >
              <category.icon className="h-4 w-4" />
              <span>{t(`${category.id}.name`)}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
