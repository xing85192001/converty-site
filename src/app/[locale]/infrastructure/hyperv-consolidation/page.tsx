import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const HypervConsolidationCalculator = dynamic(
  () =>
    import("./hyperv-consolidation-calculator").then((mod) => mod.HypervConsolidationCalculator),
  { loading: () => <CalculatorSkeleton inputCount={8} showResults /> }
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
    namespace: "converter.hyperv-consolidation",
  });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "hyper-v",
      "consolidation",
      "windows server",
      "virtualization",
      "capacity planning",
      "ha",
      "high availability",
      "replica",
      "storage",
      "licensing",
    ],
  };
}

export default async function HypervConsolidationCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.hyperv-consolidation");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("infrastructure")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("infrastructure.name")}
    >
      <Suspense fallback={<CalculatorSkeleton inputCount={8} showResults />}>
        <HypervConsolidationCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
