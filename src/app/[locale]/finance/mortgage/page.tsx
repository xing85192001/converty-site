import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const MortgageCalculator = dynamic(
  () => import("./mortgage-calculator").then((mod) => mod.MortgageCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.mortgage" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "mortgage calculator",
      "home loan",
      "amortization",
      "monthly payment",
      "interest rate",
      "down payment",
    ],
  };
}

export default async function MortgagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.mortgage");
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
        <MortgageCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
