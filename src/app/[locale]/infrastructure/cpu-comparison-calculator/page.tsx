import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const CpuComparisonCalculator = dynamic(
  () => import("./cpu-comparison-calculator").then((mod) => mod.CpuComparisonCalculator),
  { loading: () => <CalculatorSkeleton inputCount={6} showResults /> }
);

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "converter.cpu-comparison-calculator",
  });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "cpu comparison",
      "specint2017",
      "intel xeon",
      "amd epyc",
      "ampere altra",
      "performance per core",
      "performance per watt",
      "sizing ratio",
      "server cpu benchmark",
    ],
  };
}

export default async function CpuComparisonCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.cpu-comparison-calculator");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("infrastructure")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("infrastructure.name")}
    >
      <Suspense fallback={<CalculatorSkeleton inputCount={6} showResults />}>
        <CpuComparisonCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
