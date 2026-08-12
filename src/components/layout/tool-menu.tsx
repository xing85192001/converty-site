"use client";

import { Home, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/navigation";
import { categories } from "@/lib/registry/categories";
import { cn } from "@/lib/utils";

// 设计稿重点展示的分类（图片/视频处理使用更直观的别名）
const featuredIds = [
  { id: "photo", label: "图片处理" },
  { id: "video", label: "视频处理" },
  { id: "finance", label: "财务" },
  { id: "realestate", label: "房地产" },
  { id: "health", label: "健康" },
  { id: "automotive", label: "汽车" },
];

const featuredSet = new Set(featuredIds.map((f) => f.id));
const moreCategories = categories.filter((c) => !featuredSet.has(c.id));

export function ToolMenu() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number; maxHeight: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (moreOpen && moreRef.current) {
      const rect = moreRef.current.getBoundingClientRect();
      const menuWidth = 224; // w-56
      const padding = 16;
      const left = Math.min(
        rect.left,
        Math.max(padding, window.innerWidth - menuWidth - padding)
      );
      const top = rect.bottom + 8;
      const maxHeight = window.innerHeight - top - padding;
      setMenuPos({ left, top, maxHeight });
    }
  }, [moreOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        moreRef.current &&
        !moreRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [moreOpen]);

  const isActive = (slug: string) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);

  const CategoryItem = ({
    href,
    icon,
    label,
    active,
  }: {
    href: string;
    icon?: React.ReactNode;
    label: string;
    active?: boolean;
  }) => (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all",
        active
          ? "bg-gradient-to-r from-primary to-cyan-300 text-primary-foreground shadow-[0_6px_18px_rgba(34,211,238,0.35)]"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="sticky top-16 z-40 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-xl">
      <div className="container">
        <nav className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto py-2.5">
          <CategoryItem
            href="/"
            icon={<Home className="h-3.5 w-3.5" />}
            label="首页"
            active={pathname === "/" || pathname === ""}
          />

          {featuredIds.map(({ id, label }) => {
            const category = categories.find((c) => c.id === id);
            if (!category) return null;
            return (
              <CategoryItem
                key={id}
                href={`/${category.slug}`}
                icon={<category.icon className="h-3.5 w-3.5" />}
                label={label}
                active={isActive(category.slug)}
              />
            );
          })}

          {/* 更多工具下拉 */}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all",
                moreOpen
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span>更多工具</span>
            </button>

            {moreOpen && mounted && menuPos &&
              createPortal(
                <div
                  ref={menuRef}
                  className="fixed z-[100] w-56 overflow-hidden rounded-xl border border-white/10 bg-card shadow-xl"
                  style={{ left: menuPos.left, top: menuPos.top, maxHeight: menuPos.maxHeight }}
                >
                  <div className="scrollbar-hide grid gap-0.5 overflow-y-auto p-2" style={{ maxHeight: menuPos.maxHeight }}>
                    {moreCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/${category.slug}`}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                      >
                        <category.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{t(`${category.id}.name`)}</span>
                      </Link>
                    ))}
                  </div>
                </div>,
                document.body
              )}
          </div>
        </nav>
      </div>
    </div>
  );
}
