import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const HealthyWeightCalculator = dynamic(
  () => import("./healthy-weight-calculator").then((mod) => mod.HealthyWeightCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.healthy-weight" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["healthy weight", "ideal weight", "BMI", "weight range", "body weight"],
  };
}

export default async function HealthyWeightPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.healthy-weight");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("health")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("health.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <HealthyWeightCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
