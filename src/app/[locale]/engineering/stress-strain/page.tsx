import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const StressStrainCalculator = dynamic(() => import("./stress-strain-calculator"), {
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
  const t = await getTranslations({ locale, namespace: "converter.stress-strain" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "stress",
      "strain",
      "Young's modulus",
      "elasticity",
      "material",
      "safety factor",
      "engineering",
    ],
  };
}

export default async function StressStrainPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.stress-strain");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("engineering")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("engineering.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <StressStrainCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
