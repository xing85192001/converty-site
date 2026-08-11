import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const NutritionCalculatorComponent = dynamic(
  () => import("./nutrition-calculator").then((mod) => mod.NutritionCalculatorComponent),
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
  const t = await getTranslations({ locale, namespace: "converter.nutrition-calculator" });
  return {
    title: t("name"),
    description: t("metaDescription"),
  };
}

export default async function NutritionCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "converter.nutrition-calculator" });
  const categoryT = await getTranslations({ locale, namespace: "nav.cooking" });
  const category = getCategoryBySlug("cooking")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={categoryT("name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <NutritionCalculatorComponent />
      </Suspense>
    </ConverterLayout>
  );
}
