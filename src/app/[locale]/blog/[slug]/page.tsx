import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogContent } from "@/components/blog/blog-content";
import { Badge } from "@/components/ui/badge";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { type BlogCategory, blogPosts, getPostBySlug } from "@/lib/blog/posts";

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

  return (
    <article className="container max-w-3xl py-12">
      <Link
        href="/blog"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← {t("backToBlog")}
      </Link>

      <div className="mt-6 mb-8">
        <Badge variant="secondary" className="mb-3">
          {categoryLabels[post.category]}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("publishedOn")} {dateFmt.format(new Date(post.date))} · {post.readingMinutes}{" "}
          {t("minRead")}
        </p>
      </div>

      <BlogContent blocks={post.blocks} />
    </article>
  );
}
