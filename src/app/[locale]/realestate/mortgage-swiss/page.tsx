import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const MortgageSwissCalculator = dynamic(
  () => import("./mortgage-swiss-calculator").then((mod) => mod.MortgageSwissCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.mortgage-swiss" });
  return {
    title: t("name"),
    description: t("metaDescription"),
  };
}

export default async function MortgageSwissPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "converter.mortgage-swiss" });
  const tc = await getTranslations("nav");
  const category = getCategoryBySlug("realestate")!;

  return (
    <ConverterLayout
      title={t("name")}
      description={t("description")}
      category={category}
      categoryName={tc("realestate.name")}
    >
      <Suspense fallback={<CalculatorSkeleton />}>
        <MortgageSwissCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
