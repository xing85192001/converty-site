// src/app/[locale]/automotive/tire-sizing/page.tsx

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryById } from "@/lib/registry/categories";

const TireSizingCalculator = dynamic(
  () => import("./tire-sizing-calculator").then((mod) => mod.TireSizingCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.tire-sizing" });
  return {
    title: t("name"),
    description: t("metaDescription"),
  };
}

export default async function TireSizingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "converter.tire-sizing" });
  const category = getCategoryById("automotive");

  if (!category) {
    throw new Error("Automotive category not found");
  }

  return (
    <ConverterLayout title={t("name")} description={t("description")} category={category}>
      <Suspense fallback={<CalculatorSkeleton />}>
        <TireSizingCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
