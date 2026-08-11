import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const VirtualizationCostCalculator = dynamic(() => import("./virtualization-cost-calculator"), {
  loading: () => <CalculatorSkeleton inputCount={12} showResults />,
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
  const t = await getTranslations({
    locale,
    namespace: "converter.virtualization-cost",
  });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "tco",
      "cost",
      "virtualization",
      "capex",
      "opex",
      "datacenter",
      "vmware",
      "infrastructure",
      "pricing",
    ],
  };
}

export default async function VirtualizationCostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.virtualization-cost");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("infrastructure")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("infrastructure.name")}
    >
      <Suspense fallback={<CalculatorSkeleton inputCount={12} showResults />}>
        <VirtualizationCostCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
