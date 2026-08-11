import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const RetirementCalculator = dynamic(
  () => import("./retirement-calculator").then((mod) => mod.RetirementCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.retirement" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "retirement calculator",
      "retirement planning",
      "401k",
      "savings",
      "social security",
      "pension",
    ],
  };
}

export default async function RetirementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.retirement");
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("finance")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("finance.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <RetirementCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
