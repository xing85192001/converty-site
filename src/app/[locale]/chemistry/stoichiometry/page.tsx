import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const StoichiometryCalculator = dynamic(() => import("./stoichiometry-calculator"), {
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
  const t = await getTranslations({ locale, namespace: "converter.stoichiometry" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "stoichiometry",
      "limiting reactant",
      "theoretical yield",
      "chemical reaction",
      "chemistry",
      "calculator",
    ],
  };
}

export default async function StoichiometryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.stoichiometry");
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
        <StoichiometryCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
