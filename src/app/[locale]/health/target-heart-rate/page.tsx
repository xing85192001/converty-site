import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/calculator-skeleton";
import { ConverterLayout } from "@/components/converter/converter-layout";
import { locales } from "@/i18n/config";
import { getCategoryBySlug } from "@/lib/registry/categories";

const TargetHeartRateCalculator = dynamic(
  () => import("./target-heart-rate-calculator").then((mod) => mod.TargetHeartRateCalculator),
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
  const t = await getTranslations({ locale, namespace: "converter.target-heart-rate" });

  return {
    title: t("name"),
    description: t("metaDescription"),
    keywords: [
      "target heart rate",
      "heart rate zones",
      "Karvonen",
      "max heart rate",
      "exercise zones",
    ],
  };
}

export default async function TargetHeartRatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("converter.target-heart-rate");
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
        <TargetHeartRateCalculator />
      </Suspense>
    </ConverterLayout>
  );
}
