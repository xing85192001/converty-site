import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const CircleCalculator = dynamic(
  () => import("./circle-calculator").then((mod) => mod.CircleCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.circle-calculator" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["circle", "geometry", "area", "circumference", "radius", "diameter", "calculator"],
  };
}

export default async function CircleCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.circle-calculator");
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
        <CircleCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
