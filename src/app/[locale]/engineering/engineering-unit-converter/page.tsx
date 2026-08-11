import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const UnitConverterCalculator = dynamic(() => import("./unit-converter-calculator"), {
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
  const t = await getTranslations({
    locale,
    namespace: "converter.engineering-unit-converter",
  });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "unit converter",
      "engineering units",
      "force",
      "pressure",
      "stress",
      "torque",
      "NIST",
      "conversion",
    ],
  };
}

export default async function EngineeringUnitConverterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.engineering-unit-converter");
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
        <UnitConverterCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
