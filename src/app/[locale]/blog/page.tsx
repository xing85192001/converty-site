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
    <div className="container max-w-5xl py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

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
    </div>
  );
}
