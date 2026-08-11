import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogContent } from "@/components/blog/blog-content";
import { getCategoryStyle } from "@/lib/blog/styles";
import { Button } from "@/components/ui/button";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { type BlogCategory, blogPosts, getPostBySlug } from "@/lib/blog/posts";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => blogPosts.map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const categoryLabels: Record<BlogCategory, string> = {
    finance: t("category.finance"),
    health: t("category.health"),
    math: t("category.math"),
    cooking: t("category.cooking"),
  };

  const style = getCategoryStyle(post.category);
  const Icon = style.icon;

  // Related posts: same category, excluding current, max 3
  const related = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-background">
      {/* Hero header */}
      <header
        className={`relative overflow-hidden border-b bg-gradient-to-br ${style.lightBg} py-14 sm:py-20`}
      >
        <div
          className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${style.gradient}`}
        />
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className={`absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br ${style.gradient} opacity-20 blur-3xl`} />
        </div>

        <div className="container max-w-4xl">
          <Button variant="ghost" size="sm" className="mb-6 -ml-3 h-auto px-3 py-2" asChild>
            <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t("backToBlog")}
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {categoryLabels[post.category]}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {post.readingMinutes} {t("minRead")}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {post.excerpt}
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="container max-w-3xl py-12 sm:py-16">
        <BlogContent blocks={post.blocks} />

        {/* Related posts */}
        {related.length > 0 && (
          <aside className="mt-16 border-t pt-12">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("relatedTitle")}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => {
                const relStyle = getCategoryStyle(rel.category);
                const RelIcon = relStyle.icon;
                return (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group/card rounded-xl border border-border/60 bg-background p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${relStyle.badge}`}
                    >
                      <RelIcon className="h-3 w-3" />
                      {categoryLabels[rel.category]}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold leading-snug group-hover/card:text-primary">
                      {rel.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
