import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const LoanCalculator = dynamic(
  () => import("./loan-calculator").then((mod) => mod.LoanCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.loan" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: ["loan calculator", "personal loan", "auto loan", "monthly payment", "amortization"],
  };
}

export default async function LoanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.loan");
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
        <LoanCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
