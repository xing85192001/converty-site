import { BookOpen, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogList } from "@/components/blog/blog-list";
import { locales } from "@/i18n/config";
import { type BlogCategory, blogPosts } from "@/lib/blog/posts";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const categoryLabels: Record<BlogCategory, string> = {
    finance: t("category.finance"),
    health: t("category.health"),
    math: t("category.math"),
    cooking: t("category.cooking"),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-muted/50 via-background to-background py-10 sm:py-12 lg:py-14">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>{t("heroBadge")}</span>
          </div>
          <h1 className="mt-6 flex items-center justify-center gap-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <BookOpen className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">{t("subtitle")}</p>
        </div>
      </section>

      {/* Content */}
      <section className="container max-w-6xl py-12 sm:py-16">
        <BlogList
          posts={blogPosts}
          locale={locale}
          categoryLabels={categoryLabels}
          strings={{
            all: t("all"),
            readMore: t("readMore"),
            minRead: t("minRead"),
            publishedOn: t("publishedOn"),
          }}
        />
      </section>
    </div>
  );
}
