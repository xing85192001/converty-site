import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const SEOAnalyzer = dynamic(() => import("./seo-analyzer").then((mod) => mod.SEOAnalyzer), {
  loading: () => <CalculatorSkeleton />,
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "converter.seo-performance" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["seo", "performance", "analysis", "optimization", "web"],
  };
}

export default async function SEOPerformancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.seo-performance");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("web")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("web.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <SEOAnalyzer />
      </Suspense>
    </ConverterLayout>
  );
}
