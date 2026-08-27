"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/registry/categories";
import { converters } from "@/lib/registry/converters";
import { mediaTools } from "@/lib/registry/media-tools";
import { cn } from "@/lib/utils";

interface Item {
  slug: string;
  href: string;
  name: string;
}
interface Group {
  id: string;
  label: string;
  items: Item[];
}

export function AllToolsBrowser() {
  const t = useTranslations("common");
  const ts = useTranslations("common.search");
  const nav = useTranslations("nav");
  const tc = useTranslations("converter");
  const tm = useTranslations("mediaTools");

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("all");

  const groups = useMemo<Group[]>(() => {
    const convGroups: Group[] = categories
      .map((c) => ({
        id: c.id,
        label: nav(`${c.id}.name`),
        items: converters
          .filter((conv) => conv.category === c.id)
          .map((conv) => ({
            slug: conv.slug,
            href: `/${c.id}/${conv.slug}`,
            name: tc(`${conv.id}.name`),
          })),
      }))
      .filter((g) => g.items.length > 0);

    const mediaGroup: Group = {
      id: "media",
      label: tm("sectionTitle"),
      items: mediaTools.map((m) => ({
        slug: m.slug,
        href: `/tools/${m.slug}`,
        name: tm(m.titleKey),
      })),
    };

    return [...convGroups, mediaGroup];
  }, [nav, tc, tm]);

  const q = query.trim().toLowerCase();
  const visibleGroups = groups
    .filter((g) => selected === "all" || g.id === selected)
    .map((g) => ({
      ...g,
      items: q ? g.items.filter((it) => it.name.toLowerCase().includes(q)) : g.items,
    }))
    .filter((g) => g.items.length > 0);

  const navList = [
    { id: "all", label: t("allTools") },
    ...groups.map((g) => ({ id: g.id, label: g.label })),
  ];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Mobile: horizontal category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {navList.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setSelected(n.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              selected === n.id
                ? "bg-primary/15 text-primary"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden w-48 shrink-0 lg:block">
        <nav className="sticky top-20 space-y-1">
          {navList.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelected(n.id)}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                selected === n.id
                  ? "bg-primary/15 font-medium text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ts("placeholder")}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary/40"
          />
        </div>

        {visibleGroups.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">{ts("noResults")}</div>
        ) : (
          visibleGroups.map((g) => (
            <div key={g.id} className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                {g.label}
                <span className="text-sm font-normal text-muted-foreground">
                  ({g.items.length})
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {g.items.map((it) => (
                  <Link
                    key={it.slug}
                    href={it.href}
                    className="rounded-xl border border-white/10 bg-card p-4 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-primary"
                  >
                    {it.name}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
