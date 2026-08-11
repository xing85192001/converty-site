import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const RoundingCalculator = dynamic(
  () => import("./rounding-calculator").then((mod) => mod.RoundingCalculator),
  {
    loading: () => <CalculatorSkeleton />,
  }
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
  const t = await getTranslations({ locale, namespace: "converter.rounding-calculator" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["rounding", "round", "ceil", "floor", "truncate", "calculator"],
  };
}

export default async function RoundingCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.rounding-calculator");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("math")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("math.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <RoundingCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
