import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const PhCalculatorCalculator = dynamic(() => import("./ph-calculator-calculator"), {
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
  const t = await getTranslations({ locale, namespace: "converter.ph-calculator" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "ph",
      "poh",
      "acid",
      "base",
      "buffer",
      "henderson hasselbalch",
      "chemistry",
      "calculator",
    ],
  };
}

export default async function PhCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.ph-calculator");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("chemistry")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("chemistry.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <PhCalculatorCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
