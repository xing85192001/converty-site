"use client";

import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import type { BlogCategory, BlogPost } from "@/lib/blog/posts";
import { getCategoryStyle } from "@/lib/blog/styles";

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

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category))) as BlogCategory[],
    [posts]
  );

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
    <div className="mx-auto max-w-3xl">
      <Tabs
        value={active}
        onValueChange={(value) => setActive(value as BlogCategory | "all")}
        className="mb-10 flex justify-center"
      >
        <TabsList className="h-auto flex-wrap justify-center gap-1 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium shadow-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
          >
            {strings.all}
          </TabsTrigger>
          {categories.map((cat) => {
            const style = getCategoryStyle(cat);
            const Icon = style.icon;
            return (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium shadow-sm transition-all data-[state=active]:border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                <span
                  className={`mr-1.5 inline-flex items-center justify-center rounded-full p-1 ${style.badge}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {categoryLabels[cat]}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-6">
        {filtered.map((post) => {
          const style = getCategoryStyle(post.category);
          const Icon = style.icon;
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group/card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
            >
              <article className="relative overflow-hidden rounded-2xl border border-border/60 bg-background p-6 shadow-sm transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-lg group-hover/card:border-primary/20">
                <div
                  className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${style.gradient}`}
                />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}
                    >
                      <Icon className="h-3 w-3" />
                      {categoryLabels[post.category]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time>
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readingMinutes} {strings.minRead}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold leading-snug tracking-tight transition-colors group-hover/card:text-primary">
                    {post.title}
                  </h3>

                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover/card:text-primary/80">
                    {strings.readMore}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
