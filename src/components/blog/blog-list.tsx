"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { BlogCategory, BlogPost } from "@/lib/blog/posts";
import { cn } from "@/lib/utils";

interface BlogListProps {
  posts: BlogPost[];
  locale: string;
  categoryLabels: Record<BlogCategory, string>;
  strings: {
    all: string;
    readMore: string;
    minRead: string;
    publishedOn: string;
  };
}

export function BlogList({ posts, locale, categoryLabels, strings }: BlogListProps) {
  const [active, setActive] = useState<BlogCategory | "all">("all");

  const categories = useMemo(() => {
    const used = Array.from(new Set(posts.map((p) => p.category))) as BlogCategory[];
    return used;
  }, [posts]);

  const filtered = useMemo(
    () => (active === "all" ? posts : posts.filter((p) => p.category === active)),
    [posts, active]
  );

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale]
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            active === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          {strings.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <Card className="flex h-full flex-col transition-colors group-hover:bg-muted/50">
              <CardHeader className="flex-1 p-5">
                <div className="mb-3">
                  <Badge variant="secondary">{categoryLabels[post.category]}</Badge>
                </div>
                <CardTitle className="text-lg leading-snug group-hover:text-primary">
                  {post.title}
                </CardTitle>
                <CardDescription className="mt-2 line-clamp-3 text-sm">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <div className="flex items-center justify-between px-5 pb-5 text-xs text-muted-foreground">
                <span>
                  {strings.publishedOn} {dateFmt.format(new Date(post.date))}
                </span>
                <span>
                  {post.readingMinutes} {strings.minRead}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
